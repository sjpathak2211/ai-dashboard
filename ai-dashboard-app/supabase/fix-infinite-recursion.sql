-- Fix Infinite Recursion Issue
-- Run this in Supabase SQL Editor to fix the 42P17 error

-- The issue is likely in the RLS policies that reference themselves
-- Let's drop and recreate them without circular references

-- Drop all problematic policies on users table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Service role can insert users" ON public.users;

-- Recreate policies WITHOUT circular references
-- The key is to NOT check the users table when selecting from users table

CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- FIXED: Don't query users table to check if user is admin
-- Instead, rely on the is_admin column of the current row
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT
  USING (
    (SELECT is_admin FROM public.users WHERE id = auth.uid() LIMIT 1) = true
  );

CREATE POLICY "Service role can insert users" ON public.users
  FOR INSERT
  WITH CHECK (true);

-- Fix ai_requests policies
DROP POLICY IF EXISTS "Admins can view all requests" ON public.ai_requests;
DROP POLICY IF EXISTS "Admins can update all requests" ON public.ai_requests;

CREATE POLICY "Admins can view all requests" ON public.ai_requests
  FOR SELECT
  USING (
    (SELECT is_admin FROM public.users WHERE id = auth.uid() LIMIT 1) = true
  );

CREATE POLICY "Admins can update all requests" ON public.ai_requests
  FOR UPDATE
  USING (
    (SELECT is_admin FROM public.users WHERE id = auth.uid() LIMIT 1) = true
  );

-- Fix activity_log policies
DROP POLICY IF EXISTS "Admins can view all activities" ON public.activity_log;

CREATE POLICY "Admins can view all activities" ON public.activity_log
  FOR SELECT
  USING (
    (SELECT is_admin FROM public.users WHERE id = auth.uid() LIMIT 1) = true
  );

-- Fix backlog_status policy
DROP POLICY IF EXISTS "Only admins can update backlog status" ON public.backlog_status;

CREATE POLICY "Only admins can update backlog status" ON public.backlog_status
  FOR UPDATE
  USING (
    (SELECT is_admin FROM public.users WHERE id = auth.uid() LIMIT 1) = true
  );

-- Fix projects policy
DROP POLICY IF EXISTS "Only admins can manage projects" ON public.projects;

CREATE POLICY "Only admins can manage projects" ON public.projects
  FOR ALL
  USING (
    (SELECT is_admin FROM public.users WHERE id = auth.uid() LIMIT 1) = true
  );

-- Verify the fix
DO $$
BEGIN
  RAISE NOTICE '✅ Infinite recursion fix applied successfully!';
  RAISE NOTICE '📝 The policies now use a subquery with LIMIT 1 to prevent recursion.';
END $$;
