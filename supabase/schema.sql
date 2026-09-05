-- ==============================================================================
-- SHARED WORK & LIFE HUB — MULTI-WORKSPACE POSTGRESQL SCHEMA (sw_ prefix)
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

-- 2. Workspaces Table (sw_workspaces)
CREATE TABLE IF NOT EXISTS public.sw_workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT DEFAULT '',
  owner_id UUID NOT NULL REFERENCES public.sw_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Workspace Members Table (sw_workspace_members)
CREATE TABLE IF NOT EXISTS public.sw_workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.sw_workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.sw_profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- 4. Workspace Invitations Table (sw_workspace_invitations)
CREATE TABLE IF NOT EXISTS public.sw_workspace_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.sw_workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES public.sw_profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'canceled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Projects Table (sw_projects)
CREATE TABLE IF NOT EXISTS public.sw_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.sw_workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '#3b82f6',
  icon TEXT NOT NULL DEFAULT 'folder',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  created_by UUID REFERENCES public.sw_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Tasks Table (sw_tasks)
CREATE TABLE IF NOT EXISTS public.sw_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.sw_workspaces(id) ON DELETE CASCADE,
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

-- 7. Ideas Table (sw_ideas)
CREATE TABLE IF NOT EXISTS public.sw_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.sw_workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'maybe', 'planned', 'converted')),
  project_id UUID REFERENCES public.sw_projects(id) ON DELETE SET NULL,
  creator_id UUID NOT NULL REFERENCES public.sw_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Knowledge Table (sw_knowledge)
CREATE TABLE IF NOT EXISTS public.sw_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.sw_workspaces(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'to_learn' CHECK (status IN ('to_learn', 'learning', 'mastered')),
  project_id UUID REFERENCES public.sw_projects(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES public.sw_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Decisions Table (sw_decisions)
CREATE TABLE IF NOT EXISTS public.sw_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.sw_workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  project_id UUID REFERENCES public.sw_projects(id) ON DELETE SET NULL,
  created_by_id UUID NOT NULL REFERENCES public.sw_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Comments Table (sw_comments)
CREATE TABLE IF NOT EXISTS public.sw_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.sw_workspaces(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('task', 'project', 'idea', 'knowledge', 'decision')),
  entity_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.sw_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Activities Table (sw_activities)
CREATE TABLE IF NOT EXISTS public.sw_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.sw_workspaces(id) ON DELETE CASCADE,
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

-- 12. Notification Settings Table (sw_notification_settings)
CREATE TABLE IF NOT EXISTS public.sw_notification_settings (
  user_id UUID PRIMARY KEY REFERENCES public.sw_profiles(id) ON DELETE CASCADE,
  morning_digest_enabled BOOLEAN NOT NULL DEFAULT true,
  digest_time TEXT NOT NULL DEFAULT '08:00',
  notify_on_new_task BOOLEAN NOT NULL DEFAULT true,
  notify_on_due_today BOOLEAN NOT NULL DEFAULT true,
  notify_on_overdue BOOLEAN NOT NULL DEFAULT true,
  -- Zalo
  zalo_enabled BOOLEAN NOT NULL DEFAULT false,
  zalo_user_id TEXT NOT NULL DEFAULT '',
  zalo_webhook_url TEXT NOT NULL DEFAULT '',
  -- Slack
  slack_enabled BOOLEAN NOT NULL DEFAULT false,
  slack_webhook_url TEXT NOT NULL DEFAULT '',
  -- Discord
  discord_enabled BOOLEAN NOT NULL DEFAULT false,
  discord_webhook_url TEXT NOT NULL DEFAULT '',
  -- Telegram
  telegram_enabled BOOLEAN NOT NULL DEFAULT false,
  telegram_bot_token TEXT NOT NULL DEFAULT '',
  telegram_chat_id TEXT NOT NULL DEFAULT '',
  -- Messenger
  messenger_enabled BOOLEAN NOT NULL DEFAULT false,
  messenger_psid TEXT NOT NULL DEFAULT '',
  messenger_webhook_url TEXT NOT NULL DEFAULT '',
  -- Email
  email_enabled BOOLEAN NOT NULL DEFAULT false,
  email_address TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure workspace_id is added to existing tables if upgrading schema
ALTER TABLE public.sw_workspaces ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE public.sw_projects ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.sw_workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.sw_tasks ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.sw_workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.sw_ideas ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.sw_workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.sw_knowledge ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.sw_workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.sw_decisions ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.sw_workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.sw_comments ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.sw_workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.sw_activities ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.sw_workspaces(id) ON DELETE CASCADE;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sw_workspaces_owner ON public.sw_workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_sw_workspace_members_user ON public.sw_workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_sw_workspace_members_ws ON public.sw_workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_sw_invitations_email ON public.sw_workspace_invitations(email);
CREATE INDEX IF NOT EXISTS idx_sw_tasks_workspace ON public.sw_tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_sw_projects_workspace ON public.sw_projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_sw_activities_workspace ON public.sw_activities(workspace_id);

-- ==============================================================================
-- AUTOMATIC PROFILE & DEFAULT WORKSPACE CREATION TRIGGER ON AUTH SIGNUP
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  user_avatar TEXT;
  new_ws_id UUID;
BEGIN
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
    'member',
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

  -- Auto-accept any pending invitations for this user email
  INSERT INTO public.sw_workspace_members (workspace_id, user_id, role)
  SELECT workspace_id, NEW.id, role
  FROM public.sw_workspace_invitations
  WHERE LOWER(email) = LOWER(NEW.email) AND status = 'accepted'
  ON CONFLICT (workspace_id, user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- 13. Attachments Table (sw_attachments)
CREATE TABLE IF NOT EXISTS public.sw_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.sw_workspaces(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('task', 'idea', 'project', 'knowledge', 'decision')),
  entity_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  file_type TEXT NOT NULL DEFAULT 'application/octet-stream',
  file_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES public.sw_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sw_attachments_entity ON public.sw_attachments(entity_type, entity_id);

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.sw_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sw_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sw_workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sw_workspace_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sw_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sw_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sw_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sw_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sw_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sw_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sw_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sw_notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read sw_profiles" ON public.sw_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own sw_profile" ON public.sw_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own sw_profile" ON public.sw_profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view workspaces they belong to" ON public.sw_workspaces FOR SELECT TO authenticated USING (
  owner_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.sw_workspace_members WHERE workspace_id = id AND user_id = auth.uid())
);
CREATE POLICY "Authenticated users can create workspaces" ON public.sw_workspaces FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Workspace admins can update workspaces" ON public.sw_workspaces FOR UPDATE TO authenticated USING (
  owner_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.sw_workspace_members WHERE workspace_id = id AND user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Workspace members can view members" ON public.sw_workspace_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Workspace admins can insert members" ON public.sw_workspace_members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Workspace admins can update members" ON public.sw_workspace_members FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Workspace admins can delete members" ON public.sw_workspace_members FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can view invitations for their email or workspace" ON public.sw_workspace_invitations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Workspace admins can create invitations" ON public.sw_workspace_invitations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update invitations" ON public.sw_workspace_invitations FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete invitations" ON public.sw_workspace_invitations FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view sw_projects" ON public.sw_projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create sw_projects" ON public.sw_projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update sw_projects" ON public.sw_projects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete sw_projects" ON public.sw_projects FOR DELETE TO authenticated USING (true);

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

ALTER TABLE public.sw_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view sw_attachments" ON public.sw_attachments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create sw_attachments" ON public.sw_attachments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can delete sw_attachments" ON public.sw_attachments FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can view their own notification settings" ON public.sw_notification_settings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own notification settings" ON public.sw_notification_settings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notification settings" ON public.sw_notification_settings FOR UPDATE TO authenticated USING (auth.uid() = user_id);
