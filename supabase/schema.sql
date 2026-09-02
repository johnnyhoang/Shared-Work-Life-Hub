-- ==============================================================================
-- SHARED WORK & LIFE HUB — PRODUCTION SUPABASE POSTGRESQL SCHEMA (sw_ prefix)
-- ==============================================================================

-- 1. Profiles Table (sw_profiles)
CREATE TABLE IF NOT EXISTS public.sw_profiles (
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

-- 2. Projects Table (sw_projects)
CREATE TABLE IF NOT EXISTS public.sw_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '#3b82f6',
  icon TEXT NOT NULL DEFAULT 'folder',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  created_by UUID REFERENCES public.sw_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tasks Table (sw_tasks)
CREATE TABLE IF NOT EXISTS public.sw_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  project_id UUID REFERENCES public.sw_projects(id) ON DELETE SET NULL,
  creator_id UUID NOT NULL REFERENCES public.sw_profiles(id) ON DELETE CASCADE,
  assignee_id UUID NOT NULL REFERENCES public.sw_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'inbox' CHECK (status IN ('inbox', 'todo', 'in_progress', 'done')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Ideas Table (sw_ideas)
CREATE TABLE IF NOT EXISTS public.sw_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'maybe', 'planned', 'converted')),
  project_id UUID REFERENCES public.sw_projects(id) ON DELETE SET NULL,
  creator_id UUID NOT NULL REFERENCES public.sw_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Knowledge Table (sw_knowledge)
CREATE TABLE IF NOT EXISTS public.sw_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'to_learn' CHECK (status IN ('to_learn', 'learning', 'mastered')),
  project_id UUID REFERENCES public.sw_projects(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES public.sw_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Decisions Table (sw_decisions)
CREATE TABLE IF NOT EXISTS public.sw_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  project_id UUID REFERENCES public.sw_projects(id) ON DELETE SET NULL,
  created_by_id UUID NOT NULL REFERENCES public.sw_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Comments Table (sw_comments)
CREATE TABLE IF NOT EXISTS public.sw_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('task', 'project', 'idea', 'knowledge', 'decision')),
  entity_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.sw_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Activities Table (sw_activities)
CREATE TABLE IF NOT EXISTS public.sw_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES public.sw_profiles(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES public.sw_profiles(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('task', 'project', 'idea', 'knowledge', 'decision', 'comment')),
  entity_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  summary TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT '',
  project_id UUID REFERENCES public.sw_projects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for high performance
CREATE INDEX IF NOT EXISTS idx_sw_tasks_status ON public.sw_tasks(status);
CREATE INDEX IF NOT EXISTS idx_sw_tasks_assignee ON public.sw_tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_sw_tasks_creator ON public.sw_tasks(creator_id);
CREATE INDEX IF NOT EXISTS idx_sw_tasks_project ON public.sw_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_sw_activities_created ON public.sw_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sw_comments_entity ON public.sw_comments(entity_type, entity_id);

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
  -- Check if this is the very first registered user in sw_profiles (if so, make them Admin / Lead)
  SELECT COUNT(*) = 0 INTO is_first_user FROM public.sw_profiles;

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

  INSERT INTO public.sw_profiles (id, name, avatar_url, email, role, timezone, location, flag, color, last_visited_at, created_at)
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

ALTER TABLE public.sw_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sw_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sw_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sw_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sw_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sw_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sw_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sw_activities ENABLE ROW LEVEL SECURITY;

-- Read & write policies for collaborative team members
CREATE POLICY "Authenticated users can read sw_profiles" ON public.sw_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update their own sw_profile" ON public.sw_profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can update any sw_profile role" ON public.sw_profiles FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.sw_profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Authenticated users can view sw_projects" ON public.sw_projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create sw_projects" ON public.sw_projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update sw_projects" ON public.sw_projects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete sw_projects" ON public.sw_projects FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.sw_profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Authenticated users can view sw_tasks" ON public.sw_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create sw_tasks" ON public.sw_tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update sw_tasks" ON public.sw_tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete sw_tasks" ON public.sw_tasks FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view sw_ideas" ON public.sw_ideas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create sw_ideas" ON public.sw_ideas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update sw_ideas" ON public.sw_ideas FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view sw_knowledge" ON public.sw_knowledge FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create sw_knowledge" ON public.sw_knowledge FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update sw_knowledge" ON public.sw_knowledge FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view sw_decisions" ON public.sw_decisions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create sw_decisions" ON public.sw_decisions FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can view sw_comments" ON public.sw_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create sw_comments" ON public.sw_comments FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can view sw_activities" ON public.sw_activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create sw_activities" ON public.sw_activities FOR INSERT TO authenticated WITH CHECK (true);
