import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const passwordMapRaw = process.env.APPFABRIC_BOOTSTRAP_PASSWORDS_JSON;

if (!supabaseUrl || !serviceRoleKey || !passwordMapRaw) {
  throw new Error(
    'SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY ve APPFABRIC_BOOTSTRAP_PASSWORDS_JSON gereklidir.'
  );
}

const passwords = JSON.parse(passwordMapRaw);
const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const { data: profiles, error: profilesError } = await admin
  .from('profiles')
  .select('id,email,full_name,role')
  .order('created_at');
if (profilesError) throw profilesError;

const {
  data: { users: existingUsers },
  error: usersError
} = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (usersError) throw usersError;

for (const profile of profiles ?? []) {
  const email = profile.email.trim().toLowerCase();
  const existing = existingUsers.find(
    (user) => user.email?.toLowerCase() === email || user.id === profile.id
  );
  if (existing) {
    if (existing.id !== profile.id) {
      throw new Error(`${email} Auth kullanıcısının ID değeri profil ID değeriyle eşleşmiyor.`);
    }
    console.log(`${email}: zaten hazır`);
    continue;
  }

  const password = passwords[email];
  if (typeof password !== 'string' || password.length < 8) {
    throw new Error(`${email} için en az 8 karakterli yeni bir şifre tanımlayın.`);
  }

  const { error } = await admin.auth.admin.createUser({
    id: profile.id,
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: profile.full_name },
    app_metadata: { app_role: profile.role === 'admin' ? 'admin' : 'user' }
  });
  if (error) throw error;
  console.log(`${email}: Auth hesabı oluşturuldu`);
}

console.log('Tüm profil kayıtları Supabase Auth ile eşleştirildi.');
