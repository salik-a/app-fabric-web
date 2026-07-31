-- AppFabric canonical schema.
-- Authentication accounts are managed by Supabase Auth and user-admin Edge Function.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text not null,
  avatar_url text not null default '',
  background_url text not null default 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80',
  role text not null default 'user' check (role in ('admin', 'user')),
  is_allowed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  position double precision not null default 0,
  color text not null default '#f1f2f4',
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  title text not null,
  description text not null default '',
  is_completed boolean not null default false,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_by uuid not null references public.profiles(id) on delete restrict,
  position double precision not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.boards enable row level security;
alter table public.tasks enable row level security;

-- Policies and grants are defined in migrations/20260731063310_secure_auth_and_rls.sql.
-- Never store passwords in public.profiles; Supabase Auth stores salted hashes.
