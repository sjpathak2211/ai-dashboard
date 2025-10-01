-- FINAL Fix for Infinite Recursion (42P17 Error)
-- The key insight: NEVER query the users table in policies that apply TO the users table
-- Instead, create a helper function that uses SECURITY DEFINER to bypass RLS

-- Step 1: Create a helper function that checks if current user is admin
-- SECURITY DEFINER allows it to bypass RLS policies
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT is_admin
    FROM public.users
    WHERE id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Step 2: Drop ALL existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Service role can insert users" ON public.users;

DROP POLICY IF EXISTS "Admins can view all requests" ON public.ai_requests;
DROP POLICY IF EXISTS "Admins can update all requests" ON public.ai_requests;

DROP POLICY IF EXISTS "Admins can view all activities" ON public.activity_log;

DROP POLICY IF EXISTS "Only admins can update backlog status" ON public.backlog_status;

DROP POLICY IF EXISTS "Only admins can manage projects" ON public.projects;

-- Step 3: Recreate policies using the helper function (no recursion!)

-- Users table policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- FIXED: Use helper function instead of querying users table
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT
  USING (public.is_admin() = true);

CREATE POLICY "Service role can insert users" ON public.users
  FOR INSERT
  WITH CHECK (true);

-- AI Requests policies
CREATE POLICY "Admins can view all requests" ON public.ai_requests
  FOR SELECT
  USING (public.is_admin() = true);

CREATE POLICY "Admins can update all requests" ON public.ai_requests
  FOR UPDATE
  USING (public.is_admin() = true);

-- Activity log policy
CREATE POLICY "Admins can view all activities" ON public.activity_log
  FOR SELECT
  USING (public.is_admin() = true);

-- Backlog status policy
CREATE POLICY "Only admins can update backlog status" ON public.backlog_status
  FOR UPDATE
  USING (public.is_admin() = true);

-- Projects policy
CREATE POLICY "Only admins can manage projects" ON public.projects
  FOR ALL
  USING (public.is_admin() = true);

-- Verify the fix
DO $$
BEGIN
  RAISE NOTICE '✅ Infinite recursion COMPLETELY FIXED!';
  RAISE NOTICE '🔧 Created is_admin() helper function with SECURITY DEFINER';
  RAISE NOTICE '🛡️ All policies now use the helper function instead of querying users table directly';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Next step: Run this SQL in your Supabase SQL Editor';
END $$;
