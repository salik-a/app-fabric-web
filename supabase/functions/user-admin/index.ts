import { createClient } from "npm:@supabase/supabase-js@2.111.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const requireString = (value: unknown, name: string) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${name} zorunludur.`);
  }
  return value.trim();
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization) return json({ error: "Oturum bulunamadı." }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const publishableKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, publishableKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const token = authorization.replace(/^Bearer\s+/i, "");
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser(token);
    if (userError || !user) return json({ error: "Geçersiz oturum." }, 401);

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: callerProfile, error: callerError } = await adminClient
      .from("profiles")
      .select("id,role,is_allowed")
      .eq("id", user.id)
      .single();

    if (callerError || !callerProfile?.is_allowed) {
      return json({ error: "Bu hesabın AppFabric erişim izni yok." }, 403);
    }

    const body = await request.json();
    const action = requireString(body.action, "action");
    const isAdmin = callerProfile.role === "admin";

    if (action === "update_self") {
      const targetId = requireString(body.user_id, "user_id");
      if (targetId !== user.id) return json({ error: "Yalnızca kendi profilinizi güncelleyebilirsiniz." }, 403);

      const fullName = requireString(body.full_name, "Ad soyad");
      const email = requireString(body.email, "E-posta").toLowerCase();
      const avatarUrl = typeof body.avatar_url === "string" ? body.avatar_url.trim() : "";
      const password = typeof body.password === "string" ? body.password : undefined;
      if (password && password.length < 8) {
        return json({ error: "Yeni şifre en az 8 karakter olmalıdır." }, 400);
      }

      const authUpdates: Record<string, unknown> = {
        email,
        user_metadata: { full_name: fullName },
      };
      if (password) authUpdates.password = password;
      const { error: authUpdateError } = await adminClient.auth.admin.updateUserById(
        user.id,
        authUpdates,
      );
      if (authUpdateError) throw authUpdateError;

      const { data: profile, error: profileError } = await adminClient
        .from("profiles")
        .update({ email, full_name: fullName, avatar_url: avatarUrl })
        .eq("id", user.id)
        .select("id,email,full_name,avatar_url,background_url,role,is_allowed,created_at")
        .single();
      if (profileError) throw profileError;
      return json({ profile });
    }

    if (!isAdmin) return json({ error: "Bu işlem için yönetici yetkisi gerekir." }, 403);

    if (action === "create_user") {
      const fullName = requireString(body.full_name, "Ad soyad");
      const email = requireString(body.email, "E-posta").toLowerCase();
      const password = requireString(body.password, "Şifre");
      const avatarUrl = typeof body.avatar_url === "string" ? body.avatar_url.trim() : "";
      if (password.length < 8) return json({ error: "Şifre en az 8 karakter olmalıdır." }, 400);

      const { data: created, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
        app_metadata: { app_role: "user" },
      });
      if (createError || !created.user) throw createError ?? new Error("Auth kullanıcısı oluşturulamadı.");

      const { data: profile, error: profileError } = await adminClient
        .from("profiles")
        .insert({
          id: created.user.id,
          email,
          full_name: fullName,
          avatar_url: avatarUrl,
          role: "user",
          is_allowed: true,
        })
        .select("id,email,full_name,avatar_url,background_url,role,is_allowed,created_at")
        .single();
      if (profileError) {
        await adminClient.auth.admin.deleteUser(created.user.id);
        throw profileError;
      }
      return json({ profile }, 201);
    }

    const targetId = requireString(body.user_id, "user_id");
    if (targetId === user.id) return json({ error: "Kendi hesabınızda bu işlemi yapamazsınız." }, 400);

    if (action === "set_access") {
      if (typeof body.is_allowed !== "boolean") {
        return json({ error: "is_allowed boolean olmalıdır." }, 400);
      }
      const { data: profile, error } = await adminClient
        .from("profiles")
        .update({ is_allowed: body.is_allowed })
        .eq("id", targetId)
        .select("id,email,full_name,avatar_url,background_url,role,is_allowed,created_at")
        .single();
      if (error) throw error;
      return json({ profile });
    }

    if (action === "delete_user") {
      const { error: assignedTaskError } = await adminClient
        .from("tasks")
        .update({ assigned_to: user.id })
        .eq("assigned_to", targetId);
      if (assignedTaskError) throw assignedTaskError;
      const { error: createdTaskError } = await adminClient
        .from("tasks")
        .update({ created_by: user.id })
        .eq("created_by", targetId);
      if (createdTaskError) throw createdTaskError;
      const { error: createdBoardError } = await adminClient
        .from("boards")
        .update({ created_by: user.id })
        .eq("created_by", targetId);
      if (createdBoardError) throw createdBoardError;

      // Removing the profile first immediately makes every still-live JWT fail
      // the RLS allow-list check. Auth deletion then removes login credentials.
      const { error: profileDeleteError } = await adminClient
        .from("profiles")
        .delete()
        .eq("id", targetId);
      if (profileDeleteError) throw profileDeleteError;
      const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(targetId);
      if (authDeleteError) throw authDeleteError;
      return json({ success: true });
    }

    return json({ error: "Bilinmeyen işlem." }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Beklenmeyen sunucu hatası.";
    return json({ error: message }, 400);
  }
});
