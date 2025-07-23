-- AI Progress Dashboard Schema for Supabase
-- For a fresh Supabase project installation

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE request_status AS ENUM (
  'Planning', 
  'In Progress', 
  'Testing', 
  'Complete', 
  'On Hold', 
  'Denied'
);

CREATE TYPE request_priority AS ENUM ('High', 'Medium', 'Low');

CREATE TYPE department_type AS ENUM (
  'Clinical Operations', 
  'IT', 
  'Research', 
  'Quality Assurance', 
  'Administration', 
  'Finance'
);

CREATE TYPE backlog_status_enum AS ENUM ('clear', 'busy', 'swamped');

CREATE TYPE activity_type AS ENUM (
  'project_created',
  'project_updated',
  'request_submitted',
  'project_completed',
  'request_updated',
  'status_changed',
  'progress_updated',
  'admin_note_added'
);

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  picture TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Requests table
CREATE TABLE public.ai_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  department department_type NOT NULL,
  priority request_priority NOT NULL,
  estimated_impact TEXT NOT NULL,
  contact_info TEXT NOT NULL,
  status request_status DEFAULT 'Planning',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  admin_notes TEXT,
  user_id UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Log table
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type activity_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id),
  request_id UUID REFERENCES public.ai_requests(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backlog Status table (single row)
CREATE TABLE public.backlog_status (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Ensures only one row
  status backlog_status_enum DEFAULT 'clear',
  message TEXT DEFAULT 'Available for new requests',
  estimated_wait_time TEXT DEFAULT '1-2 days',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES public.users(id)
);

-- Projects table (for the general projects showcase)
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status request_status NOT NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  assigned_team TEXT NOT NULL,
  priority request_priority NOT NULL,
  department department_type NOT NULL,
  budget DECIMAL(10, 2),
  tags TEXT[] DEFAULT '{}',
  start_date DATE NOT NULL,
  estimated_completion DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_ai_requests_user_id ON public.ai_requests(user_id);
CREATE INDEX idx_ai_requests_status ON public.ai_requests(status);
CREATE INDEX idx_ai_requests_created_at ON public.ai_requests(created_at DESC);
CREATE INDEX idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX idx_activity_log_request_id ON public.activity_log(request_id);
CREATE INDEX idx_activity_log_created_at ON public.activity_log(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_requests_updated_at BEFORE UPDATE ON public.ai_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_backlog_status_updated_at BEFORE UPDATE ON public.backlog_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log activities
CREATE OR REPLACE FUNCTION log_activity(
  p_type activity_type,
  p_title TEXT,
  p_description TEXT,
  p_user_id UUID,
  p_request_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.activity_log (type, title, description, user_id, request_id, metadata)
  VALUES (p_type, p_title, p_description, p_user_id, p_request_id, p_metadata)
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log request status changes
CREATE OR REPLACE FUNCTION log_request_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM log_activity(
      'status_changed'::activity_type,
      NEW.title,
      format('Status changed from %s to %s', OLD.status, NEW.status),
      NEW.user_id,
      NEW.id,
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'updated_by', current_setting('app.current_user_id', true)
      )
    );
  END IF;
  
  IF OLD.progress IS DISTINCT FROM NEW.progress THEN
    PERFORM log_activity(
      'progress_updated'::activity_type,
      NEW.title,
      format('Progress updated from %s%% to %s%%', OLD.progress, NEW.progress),
      NEW.user_id,
      NEW.id,
      jsonb_build_object(
        'old_progress', OLD.progress,
        'new_progress', NEW.progress,
        'updated_by', current_setting('app.current_user_id', true)
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_request_changes
  AFTER UPDATE ON public.ai_requests
  FOR EACH ROW
  EXECUTE FUNCTION log_request_status_change();

-- Insert initial backlog status
INSERT INTO public.backlog_status (status, message, estimated_wait_time)
VALUES ('busy', 'Currently working on several high-priority projects. New requests may take longer than usual.', '2-3 weeks');

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backlog_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- AI Requests policies
CREATE POLICY "Users can view their own requests" ON public.ai_requests
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create requests" ON public.ai_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own requests" ON public.ai_requests
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all requests" ON public.ai_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can update all requests" ON public.ai_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Activity log policies
CREATE POLICY "Users can view their own activities" ON public.activity_log
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view activities for their requests" ON public.activity_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ai_requests
      WHERE id = activity_log.request_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all activities" ON public.activity_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- System can insert activities
CREATE POLICY "System can insert activities" ON public.activity_log
  FOR INSERT WITH CHECK (true);

-- Backlog status policies
CREATE POLICY "Everyone can view backlog status" ON public.backlog_status
  FOR SELECT USING (true);

CREATE POLICY "Only admins can update backlog status" ON public.backlog_status
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Projects policies (public showcase)
CREATE POLICY "Everyone can view projects" ON public.projects
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage projects" ON public.projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, picture, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    CASE 
      WHEN NEW.email IN ('shyam.pathak@ascendcohealth.com', 'admin@ascendcohealth.com') 
      THEN true 
      ELSE false 
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;