-- AppFabric Supabase Database Schema (Mobil & Web Ortak Tablolar)

-- 1. Kullanıcı Profilleri Tablosu (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  background_url TEXT DEFAULT 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Profiles insertable by everyone" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Profiles updatable by everyone" ON public.profiles FOR UPDATE USING (true);

-- 2. Panolar Tablosu (Boards)
CREATE TABLE IF NOT EXISTS public.boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  position FLOAT NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#f1f2f4',
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Boards viewable by everyone" ON public.boards FOR SELECT USING (true);
CREATE POLICY "Boards insertable by everyone" ON public.boards FOR INSERT WITH CHECK (true);
CREATE POLICY "Boards updatable by everyone" ON public.boards FOR UPDATE USING (true);
CREATE POLICY "Boards deletable by everyone" ON public.boards FOR DELETE USING (true);

-- 3. Görevler Tablosu (Tasks)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  is_completed BOOLEAN DEFAULT FALSE,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  position FLOAT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tasks viewable by everyone" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Tasks insertable by everyone" ON public.tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Tasks updatable by everyone" ON public.tasks FOR UPDATE USING (true);
CREATE POLICY "Tasks deletable by everyone" ON public.tasks FOR DELETE USING (true);

-- 4. Örnek Tanımlı Kullanıcıların Eklenmesi
INSERT INTO public.profiles (id, email, full_name, avatar_url, background_url)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'salika@appfabric.com', 'Salika', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80'),
  ('22222222-2222-2222-2222-222222222222', 'ahmet@appfabric.com', 'Ahmet Yılmaz', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80'),
  ('33333333-3333-3333-3333-333333333333', 'zeynep@appfabric.com', 'Zeynep Kaya', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80'),
  ('44444444-4444-4444-4444-444444444444', 'admin@appfabric.com', 'Sistem Yöneticisi', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80')
ON CONFLICT (email) DO NOTHING;
