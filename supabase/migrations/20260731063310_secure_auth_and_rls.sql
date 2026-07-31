-- AppFabric Auth/RLS hardening.
-- Apply only after the owner email has a matching Supabase Auth user.

begin;
set local lock_timeout = '5s';
set local statement_timeout = '60s';

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

alter table public.profiles
  add column if not exists role text not null default 'user',
  add column if not exists is_allowed boolean not null default false;

update public.profiles
set
  email = lower(trim(email)),
  role = case when lower(trim(email)) = 'salikalper@gmail.com' then 'admin' else 'user' end,
  is_allowed = lower(trim(email)) = 'salikalper@gmail.com';

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check check (role in ('admin', 'user'));

do $$
begin
  if not exists (
    select 1 from public.profiles
    where lower(email) = 'salikalper@gmail.com'
  ) then
    raise exception
      'The owner profile salikalper@gmail.com is missing.';
  end if;

  if not exists (
    select 1 from auth.users
    where lower(email) = 'salikalper@gmail.com'
      and deleted_at is null
  ) then
    raise exception
      'Create and auto-confirm the Supabase Auth user salikalper@gmail.com before this migration is applied.';
  end if;

  if exists (
    select lower(email)
    from auth.users
    where email is not null and deleted_at is null
    group by lower(email)
    having count(*) > 1
  ) then
    raise exception
      'Duplicate Supabase Auth emails must be resolved before this migration is applied.';
  end if;
end
$$;

-- Dashboard-created Auth users receive new UUIDs. Temporarily allow profile ID
-- updates to cascade into boards/tasks, then align every profile with auth.users.
alter table public.boards drop constraint if exists boards_created_by_fkey;
alter table public.tasks drop constraint if exists tasks_assigned_to_fkey;
alter table public.tasks drop constraint if exists tasks_created_by_fkey;

alter table public.boards
  add constraint boards_created_by_fkey
  foreign key (created_by) references public.profiles(id)
  on update cascade on delete set null;

alter table public.tasks
  add constraint tasks_assigned_to_fkey
  foreign key (assigned_to) references public.profiles(id)
  on update cascade on delete set null;

alter table public.tasks
  add constraint tasks_created_by_fkey
  foreign key (created_by) references public.profiles(id)
  on update cascade on delete set null;

update public.profiles profile
set id = auth_user.id
from auth.users auth_user
where lower(auth_user.email) = lower(profile.email)
  and auth_user.deleted_at is null
  and lower(profile.email) = 'salikalper@gmail.com'
  and profile.id <> auth_user.id;

-- The initial demo profiles are not login accounts. Preserve every board/task,
-- transfer their ownership and assignments to the sole owner, then remove them.
update public.boards
set created_by = (
  select id from public.profiles
  where lower(email) = 'salikalper@gmail.com'
)
where created_by is distinct from (
  select id from public.profiles
  where lower(email) = 'salikalper@gmail.com'
);

update public.tasks
set
  created_by = (
    select id from public.profiles
    where lower(email) = 'salikalper@gmail.com'
  ),
  assigned_to = (
    select id from public.profiles
    where lower(email) = 'salikalper@gmail.com'
  )
where created_by is distinct from (
    select id from public.profiles
    where lower(email) = 'salikalper@gmail.com'
  )
  or assigned_to is distinct from (
    select id from public.profiles
    where lower(email) = 'salikalper@gmail.com'
  );

delete from public.profiles
where lower(email) <> 'salikalper@gmail.com';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_id_auth_users_fkey'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_id_auth_users_fkey
      foreign key (id) references auth.users(id) on delete cascade
      not valid;
  end if;
end
$$;

alter table public.profiles validate constraint profiles_id_auth_users_fkey;

update public.boards
set created_by = (
  select id from public.profiles
  where role = 'admin' and is_allowed is true
  order by created_at
  limit 1
)
where created_by is null;

update public.tasks
set created_by = (
  select id from public.profiles
  where role = 'admin' and is_allowed is true
  order by created_at
  limit 1
)
where created_by is null;

alter table public.boards alter column created_by set not null;
alter table public.tasks alter column created_by set not null;

-- Authorization helpers intentionally live in an unexposed schema. They only
-- answer questions about auth.uid() and never return profile data.
create or replace function private.is_allowed_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and is_allowed is true
  );
$$;

create or replace function private.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and is_allowed is true
      and role = 'admin'
  );
$$;

revoke all on function private.is_allowed_user() from public, anon;
revoke all on function private.is_admin_user() from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_allowed_user() to authenticated;
grant execute on function private.is_admin_user() to authenticated;

alter table public.profiles enable row level security;
alter table public.boards enable row level security;
alter table public.tasks enable row level security;

drop policy if exists "Profiles viewable by everyone" on public.profiles;
drop policy if exists "Profiles insertable by everyone" on public.profiles;
drop policy if exists "Profiles updatable by everyone" on public.profiles;
drop policy if exists "Profiles deletable by everyone" on public.profiles;
drop policy if exists "profiles_select_allowed_users" on public.profiles;
drop policy if exists "profiles_update_own_profile" on public.profiles;

create policy "profiles_select_allowed_users"
on public.profiles
for select
to authenticated
using ((select private.is_allowed_user()));

create policy "profiles_update_own_profile"
on public.profiles
for update
to authenticated
using (
  id = (select auth.uid())
  and (select private.is_allowed_user())
)
with check (
  id = (select auth.uid())
  and (select private.is_allowed_user())
);

drop policy if exists "Boards viewable by everyone" on public.boards;
drop policy if exists "Boards insertable by everyone" on public.boards;
drop policy if exists "Boards updatable by everyone" on public.boards;
drop policy if exists "Boards deletable by everyone" on public.boards;
drop policy if exists "boards_select_allowed_users" on public.boards;
drop policy if exists "boards_insert_allowed_users" on public.boards;
drop policy if exists "boards_update_allowed_users" on public.boards;
drop policy if exists "boards_delete_allowed_users" on public.boards;

create policy "boards_select_allowed_users"
on public.boards for select to authenticated
using ((select private.is_allowed_user()));

create policy "boards_insert_allowed_users"
on public.boards for insert to authenticated
with check (
  (select private.is_allowed_user())
  and created_by = (select auth.uid())
);

create policy "boards_update_allowed_users"
on public.boards for update to authenticated
using ((select private.is_allowed_user()))
with check ((select private.is_allowed_user()));

create policy "boards_delete_allowed_users"
on public.boards for delete to authenticated
using ((select private.is_allowed_user()));

drop policy if exists "Tasks viewable by everyone" on public.tasks;
drop policy if exists "Tasks insertable by everyone" on public.tasks;
drop policy if exists "Tasks updatable by everyone" on public.tasks;
drop policy if exists "Tasks deletable by everyone" on public.tasks;
drop policy if exists "tasks_select_allowed_users" on public.tasks;
drop policy if exists "tasks_insert_allowed_users" on public.tasks;
drop policy if exists "tasks_update_allowed_users" on public.tasks;
drop policy if exists "tasks_delete_allowed_users" on public.tasks;

create policy "tasks_select_allowed_users"
on public.tasks for select to authenticated
using ((select private.is_allowed_user()));

create policy "tasks_insert_allowed_users"
on public.tasks for insert to authenticated
with check (
  (select private.is_allowed_user())
  and created_by = (select auth.uid())
);

create policy "tasks_update_allowed_users"
on public.tasks for update to authenticated
using ((select private.is_allowed_user()))
with check ((select private.is_allowed_user()));

create policy "tasks_delete_allowed_users"
on public.tasks for delete to authenticated
using ((select private.is_allowed_user()));

revoke all on public.profiles, public.boards, public.tasks from anon;
revoke all on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, avatar_url, background_url) on public.profiles to authenticated;
grant select, insert, update, delete on public.boards, public.tasks to authenticated;

create index if not exists boards_created_by_idx on public.boards (created_by);
create index if not exists tasks_board_id_idx on public.tasks (board_id);
create index if not exists tasks_assigned_to_idx on public.tasks (assigned_to);
create index if not exists tasks_created_by_idx on public.tasks (created_by);

-- Supabase Auth stores password hashes. Keeping a second plaintext password
-- copy in an exposed table is both unnecessary and unsafe.
alter table public.profiles drop column if exists password;

commit;
