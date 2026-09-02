-- ==============================================================================
-- SHARED WORK & LIFE HUB — PRODUCTION SUPABASE POSTGRESQL SCHEMA
-- ==============================================================================

-- 1. Profiles Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  timezone TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
  location TEXT NOT NULL DEFAULT 'Vietnam',
  flag TEXT NOT NULL DEFAULT '🇻🇳',
  color TEXT NOT NULL DEFAULT '#3b82f6',
  last_visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '#3b82f6',
  icon TEXT NOT NULL DEFAULT 'folder',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assignee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'inbox' CHECK (status IN ('inbox', 'todo', 'in_progress', 'done')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Ideas Table
CREATE TABLE IF NOT EXISTS public.ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'maybe', 'planned', 'converted')),
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Knowledge Table
CREATE TABLE IF NOT EXISTS public.knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'to_learn' CHECK (status IN ('to_learn', 'learning', 'mastered')),
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Decisions Table
CREATE TABLE IF NOT EXISTS public.decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  created_by_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('task', 'project', 'idea', 'knowledge', 'decision')),
  entity_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Activities Table
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('task', 'project', 'idea', 'knowledge', 'decision', 'comment')),
  entity_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  summary TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT '',
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON public.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_creator ON public.tasks(creator_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_activities_created ON public.activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_entity ON public.comments(entity_type, entity_id);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  is_first_user BOOLEAN;
  user_name TEXT;
  user_avatar TEXT;
BEGIN
  -- Check if this is the very first registered user (if so, make them Admin / Lead)
  SELECT COUNT(*) = 0 INTO is_first_user FROM public.profiles;

  -- Extract display name from Google OAuth metadata or email
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  user_avatar := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    '👤'
  );

  INSERT INTO public.profiles (id, name, avatar_url, email, role, timezone, location, flag, color, last_visited_at, created_at)
  VALUES (
    NEW.id,
    user_name,
    user_avatar,
    NEW.email,
    CASE WHEN is_first_user THEN 'admin' ELSE 'member' END,
    'Asia/Ho_Chi_Minh',
    'Vietnam',
    '🇻🇳',
    '#3b82f6',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url,
    email = EXCLUDED.email;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Allow authenticated team members full read and write to collaborative workspace
CREATE POLICY "Authenticated users can read profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile role" ON public.profiles FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Authenticated users can view projects" ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update projects" ON public.projects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete projects" ON public.projects FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Authenticated users can view tasks" ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update tasks" ON public.tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete tasks" ON public.tasks FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view ideas" ON public.ideas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create ideas" ON public.ideas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update ideas" ON public.ideas FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view knowledge" ON public.knowledge FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create knowledge" ON public.knowledge FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update knowledge" ON public.knowledge FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view decisions" ON public.decisions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create decisions" ON public.decisions FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can view comments" ON public.comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create comments" ON public.comments FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can view activities" ON public.activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create activities" ON public.activities FOR INSERT TO authenticated WITH CHECK (true);
