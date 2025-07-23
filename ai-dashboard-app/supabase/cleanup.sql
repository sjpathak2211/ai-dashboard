-- Cleanup script to remove all objects before fresh install
-- WARNING: This will DELETE ALL DATA! Only use if you want to start completely fresh

-- Drop all policies first
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can view their own requests" ON public.ai_requests;
DROP POLICY IF EXISTS "Users can create requests" ON public.ai_requests;
DROP POLICY IF EXISTS "Users can update their own requests" ON public.ai_requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON public.ai_requests;
DROP POLICY IF EXISTS "Admins can update all requests" ON public.ai_requests;
DROP POLICY IF EXISTS "Users can view their own activities" ON public.activity_log;
DROP POLICY IF EXISTS "Users can view activities for their requests" ON public.activity_log;
DROP POLICY IF EXISTS "Admins can view all activities" ON public.activity_log;
DROP POLICY IF EXISTS "Everyone can view backlog status" ON public.backlog_status;
DROP POLICY IF EXISTS "Only admins can update backlog status" ON public.backlog_status;
DROP POLICY IF EXISTS "Everyone can view projects" ON public.projects;
DROP POLICY IF EXISTS "Only admins can manage projects" ON public.projects;

-- Drop triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS log_request_changes ON public.ai_requests;
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_ai_requests_updated_at ON public.ai_requests;
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
DROP TRIGGER IF EXISTS update_backlog_status_updated_at ON public.backlog_status;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS log_request_status_change();
DROP FUNCTION IF EXISTS log_activity(activity_type, TEXT, TEXT, UUID, UUID, JSONB);
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS public.activity_log CASCADE;
DROP TABLE IF EXISTS public.ai_requests CASCADE;
DROP TABLE IF EXISTS public.backlog_status CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop types
DROP TYPE IF EXISTS activity_type CASCADE;
DROP TYPE IF EXISTS backlog_status CASCADE;
DROP TYPE IF EXISTS backlog_status_enum CASCADE;
DROP TYPE IF EXISTS department_type CASCADE;
DROP TYPE IF EXISTS request_priority CASCADE;
DROP TYPE IF EXISTS request_status CASCADE;