-- =============================================================================
-- 001 — Workspace isolation via Row Level Security
-- =============================================================================
--
-- WHY: every sw_* content policy was `USING (true)`, so any authenticated user
-- of this Supabase project could read and write every workspace's tasks,
-- projects, ideas, knowledge, decisions, comments, activities and attachments.
-- Isolation existed only in application query filters, and `GET /api/tasks`
-- had no filter at all.
--
-- HOW TO RUN — in order, checking between steps:
--   STEP 0  run the dry-run report, read the numbers
--   STEP 1  helper functions
--   STEP 2  backfill workspace_id  (writes data — take a backup first)
--   STEP 3  replace policies
--   STEP 4  verify with the queries at the bottom
--   STEP 5  optional hardening, only after the app is verified working
--
-- Take a database backup before STEP 2. Supabase: Database > Backups.
-- =============================================================================


-- =============================================================================
-- STEP 0 — Dry run. Read-only. Run this alone first.
-- =============================================================================
-- How many rows are currently unassigned to any workspace? These rows are the
-- ones that leak into every workspace today via the `workspace_id IS NULL`
-- fallback, and the ones that would become invisible if we enabled RLS without
-- backfilling them first.
--
--   SELECT 'sw_projects'   AS tbl, count(*) FROM public.sw_projects   WHERE workspace_id IS NULL
--   UNION ALL SELECT 'sw_tasks',      count(*) FROM public.sw_tasks      WHERE workspace_id IS NULL
--   UNION ALL SELECT 'sw_ideas',      count(*) FROM public.sw_ideas      WHERE workspace_id IS NULL
--   UNION ALL SELECT 'sw_knowledge',  count(*) FROM public.sw_knowledge  WHERE workspace_id IS NULL
--   UNION ALL SELECT 'sw_decisions',  count(*) FROM public.sw_decisions  WHERE workspace_id IS NULL
--   UNION ALL SELECT 'sw_comments',   count(*) FROM public.sw_comments   WHERE workspace_id IS NULL
--   UNION ALL SELECT 'sw_activities', count(*) FROM public.sw_activities WHERE workspace_id IS NULL
--   UNION ALL SELECT 'sw_attachments',count(*) FROM public.sw_attachments WHERE workspace_id IS NULL;
--
-- Also confirm at least one workspace exists, otherwise the backfill has no
-- target and every legacy row would stay NULL (and become invisible):
--
--   SELECT count(*) AS workspace_count FROM public.sw_workspaces;


-- =============================================================================
-- STEP 1 — Helper functions
-- =============================================================================
-- These are SECURITY DEFINER on purpose. A policy on sw_workspace_members that
-- queries sw_workspace_members would recurse infinitely; running the membership
-- lookup as the definer bypasses RLS for that inner read and breaks the cycle.
-- search_path is pinned so the functions cannot be hijacked by a caller's path.

CREATE OR REPLACE FUNCTION public.sw_is_member(ws_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT ws_id IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.sw_workspaces w
      WHERE w.id = ws_id AND w.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.sw_workspace_members m
      WHERE m.workspace_id = ws_id AND m.user_id = auth.uid()
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.sw_is_workspace_admin(ws_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT ws_id IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.sw_workspaces w
      WHERE w.id = ws_id AND w.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.sw_workspace_members m
      WHERE m.workspace_id = ws_id AND m.user_id = auth.uid() AND m.role = 'admin'
    )
  );
$$;

-- True when the caller has an invitation to this workspace addressed to their
-- own email. Needed so an invitee can accept: at that moment they are not yet a
-- member, so sw_is_member() is still false for them.
CREATE OR REPLACE FUNCTION public.sw_is_invited(ws_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT ws_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.sw_workspace_invitations i
    WHERE i.workspace_id = ws_id
      AND lower(i.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      AND i.status IN ('pending', 'accepted')
  );
$$;

-- True when the caller and the given profile belong to at least one workspace
-- in common. Used to stop the member directory leaking every user in the
-- Supabase project to every other user.
CREATE OR REPLACE FUNCTION public.sw_shares_workspace(profile_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT profile_id = auth.uid() OR EXISTS (
    SELECT 1
    FROM public.sw_workspace_members me
    JOIN public.sw_workspace_members them
      ON them.workspace_id = me.workspace_id
    WHERE me.user_id = auth.uid() AND them.user_id = profile_id
  );
$$;

-- Membership is now on the hot path of every policy; index both directions.
CREATE INDEX IF NOT EXISTS idx_sw_workspace_members_user
  ON public.sw_workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_sw_workspace_members_ws_user
  ON public.sw_workspace_members(workspace_id, user_id);
CREATE INDEX IF NOT EXISTS idx_sw_invitations_email
  ON public.sw_workspace_invitations(lower(email), status);


-- =============================================================================
-- STEP 2 — Backfill workspace_id  ** THIS WRITES DATA **
-- =============================================================================
-- Legacy rows predate multi-workspace and have workspace_id = NULL. Once the
-- new policies are live, sw_is_member(NULL) is false, so any row left NULL
-- becomes invisible to everyone. Backfill must happen BEFORE step 3.
--
-- Heuristic: give each row to the oldest workspace its author belongs to.
-- Rows whose author has no membership fall back to the oldest workspace.
-- Review the dry-run numbers from STEP 0 before running this.

UPDATE public.sw_projects t SET workspace_id = (
  SELECT m.workspace_id FROM public.sw_workspace_members m
  WHERE m.user_id = t.created_by ORDER BY m.joined_at LIMIT 1
) WHERE t.workspace_id IS NULL;

UPDATE public.sw_tasks t SET workspace_id = (
  SELECT m.workspace_id FROM public.sw_workspace_members m
  WHERE m.user_id = t.creator_id ORDER BY m.joined_at LIMIT 1
) WHERE t.workspace_id IS NULL;

UPDATE public.sw_ideas t SET workspace_id = (
  SELECT m.workspace_id FROM public.sw_workspace_members m
  WHERE m.user_id = t.creator_id ORDER BY m.joined_at LIMIT 1
) WHERE t.workspace_id IS NULL;

UPDATE public.sw_knowledge t SET workspace_id = (
  SELECT m.workspace_id FROM public.sw_workspace_members m
  WHERE m.user_id = t.user_id ORDER BY m.joined_at LIMIT 1
) WHERE t.workspace_id IS NULL;

UPDATE public.sw_decisions t SET workspace_id = (
  SELECT m.workspace_id FROM public.sw_workspace_members m
  WHERE m.user_id = t.created_by_id ORDER BY m.joined_at LIMIT 1
) WHERE t.workspace_id IS NULL;

UPDATE public.sw_comments t SET workspace_id = (
  SELECT m.workspace_id FROM public.sw_workspace_members m
  WHERE m.user_id = t.user_id ORDER BY m.joined_at LIMIT 1
) WHERE t.workspace_id IS NULL;

UPDATE public.sw_activities t SET workspace_id = (
  SELECT m.workspace_id FROM public.sw_workspace_members m
  WHERE m.user_id = t.actor_id ORDER BY m.joined_at LIMIT 1
) WHERE t.workspace_id IS NULL;

UPDATE public.sw_attachments t SET workspace_id = (
  SELECT m.workspace_id FROM public.sw_workspace_members m
  WHERE m.user_id = t.uploaded_by ORDER BY m.joined_at LIMIT 1
) WHERE t.workspace_id IS NULL;

-- Fallback for orphans (author no longer a member of anything).
DO $$
DECLARE fallback_ws uuid;
BEGIN
  SELECT id INTO fallback_ws FROM public.sw_workspaces ORDER BY created_at LIMIT 1;
  IF fallback_ws IS NULL THEN
    RAISE NOTICE 'No workspace exists; leaving orphan rows NULL. They will be invisible until a workspace is created and they are assigned.';
    RETURN;
  END IF;
  UPDATE public.sw_projects    SET workspace_id = fallback_ws WHERE workspace_id IS NULL;
  UPDATE public.sw_tasks       SET workspace_id = fallback_ws WHERE workspace_id IS NULL;
  UPDATE public.sw_ideas       SET workspace_id = fallback_ws WHERE workspace_id IS NULL;
  UPDATE public.sw_knowledge   SET workspace_id = fallback_ws WHERE workspace_id IS NULL;
  UPDATE public.sw_decisions   SET workspace_id = fallback_ws WHERE workspace_id IS NULL;
  UPDATE public.sw_comments    SET workspace_id = fallback_ws WHERE workspace_id IS NULL;
  UPDATE public.sw_activities  SET workspace_id = fallback_ws WHERE workspace_id IS NULL;
  UPDATE public.sw_attachments SET workspace_id = fallback_ws WHERE workspace_id IS NULL;
END $$;


-- =============================================================================
-- STEP 3 — Replace every sw_* policy
-- =============================================================================
-- Dropped by enumeration rather than by name, so policies that have drifted
-- from the checked-in schema are also removed and nothing permissive survives.

DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT tablename, policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename LIKE 'sw\_%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

ALTER TABLE public.sw_profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sw_workspaces            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sw_workspace_members     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sw_workspace_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sw_projects              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sw_tasks                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sw_ideas                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sw_knowledge             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sw_decisions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sw_comments              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sw_activities            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sw_attachments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sw_notification_settings ENABLE ROW LEVEL SECURITY;

-- --- Profiles -----------------------------------------------------------
-- Readable only to people you actually share a workspace with, plus yourself.
CREATE POLICY "profiles_select" ON public.sw_profiles
  FOR SELECT TO authenticated USING (public.sw_shares_workspace(id));
CREATE POLICY "profiles_insert_self" ON public.sw_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_self" ON public.sw_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- --- Workspaces ---------------------------------------------------------
CREATE POLICY "workspaces_select" ON public.sw_workspaces
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.sw_is_member(id) OR public.sw_is_invited(id));
CREATE POLICY "workspaces_insert" ON public.sw_workspaces
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "workspaces_update_admin" ON public.sw_workspaces
  FOR UPDATE TO authenticated
  USING (public.sw_is_workspace_admin(id)) WITH CHECK (public.sw_is_workspace_admin(id));
CREATE POLICY "workspaces_delete_owner" ON public.sw_workspaces
  FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- --- Members ------------------------------------------------------------
CREATE POLICY "members_select" ON public.sw_workspace_members
  FOR SELECT TO authenticated USING (public.sw_is_member(workspace_id));
-- Admins add anyone; an invitee may add only themselves, and only with a real
-- invitation. This is the row written when someone accepts an invite.
CREATE POLICY "members_insert" ON public.sw_workspace_members
  FOR INSERT TO authenticated
  WITH CHECK (
    public.sw_is_workspace_admin(workspace_id)
    OR (user_id = auth.uid() AND public.sw_is_invited(workspace_id))
  );
CREATE POLICY "members_update_admin" ON public.sw_workspace_members
  FOR UPDATE TO authenticated
  USING (public.sw_is_workspace_admin(workspace_id))
  WITH CHECK (public.sw_is_workspace_admin(workspace_id));
-- Admins remove members; anyone may remove themselves (leave a workspace).
CREATE POLICY "members_delete" ON public.sw_workspace_members
  FOR DELETE TO authenticated
  USING (public.sw_is_workspace_admin(workspace_id) OR user_id = auth.uid());

-- --- Invitations --------------------------------------------------------
CREATE POLICY "invitations_select" ON public.sw_workspace_invitations
  FOR SELECT TO authenticated
  USING (
    public.sw_is_workspace_admin(workspace_id)
    OR lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
CREATE POLICY "invitations_insert_admin" ON public.sw_workspace_invitations
  FOR INSERT TO authenticated WITH CHECK (public.sw_is_workspace_admin(workspace_id));
-- The invitee updates status to accepted/declined; admins can cancel.
CREATE POLICY "invitations_update" ON public.sw_workspace_invitations
  FOR UPDATE TO authenticated
  USING (
    public.sw_is_workspace_admin(workspace_id)
    OR lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
CREATE POLICY "invitations_delete_admin" ON public.sw_workspace_invitations
  FOR DELETE TO authenticated USING (public.sw_is_workspace_admin(workspace_id));

-- --- Content tables -----------------------------------------------------
-- Same shape for all of them: you may touch a row only if you are a member of
-- the workspace it belongs to, and you may not move a row into a workspace you
-- are not a member of (that is what the WITH CHECK clause prevents).

CREATE POLICY "projects_all" ON public.sw_projects
  FOR ALL TO authenticated
  USING (public.sw_is_member(workspace_id)) WITH CHECK (public.sw_is_member(workspace_id));

CREATE POLICY "tasks_all" ON public.sw_tasks
  FOR ALL TO authenticated
  USING (public.sw_is_member(workspace_id)) WITH CHECK (public.sw_is_member(workspace_id));

CREATE POLICY "ideas_all" ON public.sw_ideas
  FOR ALL TO authenticated
  USING (public.sw_is_member(workspace_id)) WITH CHECK (public.sw_is_member(workspace_id));

CREATE POLICY "knowledge_all" ON public.sw_knowledge
  FOR ALL TO authenticated
  USING (public.sw_is_member(workspace_id)) WITH CHECK (public.sw_is_member(workspace_id));

CREATE POLICY "decisions_all" ON public.sw_decisions
  FOR ALL TO authenticated
  USING (public.sw_is_member(workspace_id)) WITH CHECK (public.sw_is_member(workspace_id));

CREATE POLICY "comments_all" ON public.sw_comments
  FOR ALL TO authenticated
  USING (public.sw_is_member(workspace_id)) WITH CHECK (public.sw_is_member(workspace_id));

-- Activities are an audit log: members read and append, nobody edits history.
CREATE POLICY "activities_select" ON public.sw_activities
  FOR SELECT TO authenticated USING (public.sw_is_member(workspace_id));
CREATE POLICY "activities_insert" ON public.sw_activities
  FOR INSERT TO authenticated WITH CHECK (public.sw_is_member(workspace_id));

CREATE POLICY "attachments_select" ON public.sw_attachments
  FOR SELECT TO authenticated USING (public.sw_is_member(workspace_id));
CREATE POLICY "attachments_insert" ON public.sw_attachments
  FOR INSERT TO authenticated WITH CHECK (public.sw_is_member(workspace_id));
-- Uploader or workspace admin, matching what the API route already enforces.
CREATE POLICY "attachments_delete" ON public.sw_attachments
  FOR DELETE TO authenticated
  USING (
    public.sw_is_member(workspace_id)
    AND (uploaded_by = auth.uid() OR public.sw_is_workspace_admin(workspace_id))
  );

-- Column privilege, not a policy: RLS lets you update your own profile row, and
-- sw_profiles.role used to grant admin in the UI, so any member could promote
-- themselves. Real authority lives in sw_workspace_members.role, which is
-- governed by the member policies above.
REVOKE UPDATE (role) ON public.sw_profiles FROM authenticated;

-- --- Notification settings ----------------------------------------------
-- Holds Slack/Telegram/Discord webhooks and bot tokens: strictly self-only.
CREATE POLICY "notification_settings_all" ON public.sw_notification_settings
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- =============================================================================
-- STEP 4 — Verify
-- =============================================================================
-- a) No permissive leftovers. Every row should show a real predicate, never
--    the bare `true` that this migration exists to remove:
--
--   SELECT tablename, policyname, cmd, qual::text, with_check::text
--   FROM pg_policies WHERE schemaname='public' AND tablename LIKE 'sw\_%'
--   ORDER BY tablename, cmd;
--
-- b) Nothing left unassigned. Every count must be 0:
--
--   SELECT 'sw_tasks' AS tbl, count(*) FROM public.sw_tasks WHERE workspace_id IS NULL
--   UNION ALL SELECT 'sw_projects', count(*) FROM public.sw_projects WHERE workspace_id IS NULL
--   UNION ALL SELECT 'sw_ideas', count(*) FROM public.sw_ideas WHERE workspace_id IS NULL
--   UNION ALL SELECT 'sw_knowledge', count(*) FROM public.sw_knowledge WHERE workspace_id IS NULL
--   UNION ALL SELECT 'sw_decisions', count(*) FROM public.sw_decisions WHERE workspace_id IS NULL
--   UNION ALL SELECT 'sw_comments', count(*) FROM public.sw_comments WHERE workspace_id IS NULL
--   UNION ALL SELECT 'sw_activities', count(*) FROM public.sw_activities WHERE workspace_id IS NULL
--   UNION ALL SELECT 'sw_attachments', count(*) FROM public.sw_attachments WHERE workspace_id IS NULL;
--
-- c) In the app: sign in as a member of workspace A and confirm you can see A's
--    tasks; then call GET /api/tasks directly and confirm the response contains
--    nothing from workspace B. That request is what leaked everything before.
--
-- d) Privilege escalation is closed. As a normal member this must fail:
--
--   UPDATE public.sw_profiles SET role = 'admin' WHERE id = auth.uid();
--   -- expected: ERROR permission denied for column role


-- =============================================================================
-- STEP 5 — Optional hardening, only once the app is verified working
-- =============================================================================
-- Makes it impossible to create a new orphan row. Run only after STEP 4(b)
-- returns all zeros, otherwise these statements fail.
--
--   ALTER TABLE public.sw_projects    ALTER COLUMN workspace_id SET NOT NULL;
--   ALTER TABLE public.sw_tasks       ALTER COLUMN workspace_id SET NOT NULL;
--   ALTER TABLE public.sw_ideas       ALTER COLUMN workspace_id SET NOT NULL;
--   ALTER TABLE public.sw_knowledge   ALTER COLUMN workspace_id SET NOT NULL;
--   ALTER TABLE public.sw_decisions   ALTER COLUMN workspace_id SET NOT NULL;
--   ALTER TABLE public.sw_comments    ALTER COLUMN workspace_id SET NOT NULL;
--   ALTER TABLE public.sw_activities  ALTER COLUMN workspace_id SET NOT NULL;
--   ALTER TABLE public.sw_attachments ALTER COLUMN workspace_id SET NOT NULL;
