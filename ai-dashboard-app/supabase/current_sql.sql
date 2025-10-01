-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.activity_log (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  type USER-DEFINED NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  user_id uuid NOT NULL,
  request_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT activity_log_pkey PRIMARY KEY (id),
  CONSTRAINT activity_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT activity_log_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.ai_requests(id)
);
CREATE TABLE public.ai_requests (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text NOT NULL,
  department USER-DEFINED NOT NULL,
  priority USER-DEFINED NOT NULL,
  estimated_impact text NOT NULL,
  contact_info text NOT NULL,
  status USER-DEFINED DEFAULT 'Planning'::request_status,
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  admin_notes text,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  submitted_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ai_requests_pkey PRIMARY KEY (id),
  CONSTRAINT ai_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.backlog_status (
  id integer NOT NULL DEFAULT 1 CHECK (id = 1),
  status USER-DEFINED DEFAULT 'clear'::backlog_status_enum,
  message text DEFAULT 'Available for new requests'::text,
  estimated_wait_time text DEFAULT '1-2 days'::text,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid,
  CONSTRAINT backlog_status_pkey PRIMARY KEY (id),
  CONSTRAINT backlog_status_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id)
);
CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text NOT NULL,
  status USER-DEFINED NOT NULL,
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  assigned_team text NOT NULL,
  priority USER-DEFINED NOT NULL,
  department USER-DEFINED NOT NULL,
  budget numeric,
  tags ARRAY DEFAULT '{}'::text[],
  start_date date NOT NULL,
  estimated_completion date NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT projects_pkey PRIMARY KEY (id)
);
CREATE TABLE public.request_history (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  request_id uuid NOT NULL,
  action text NOT NULL,
  details text NOT NULL,
  actor_name text NOT NULL,
  actor_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT request_history_pkey PRIMARY KEY (id),
  CONSTRAINT request_history_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.requests(id),
  CONSTRAINT request_history_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id)
);
CREATE TABLE public.requests (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  department text NOT NULL CHECK (department = ANY (ARRAY['client-success'::text, 'sales'::text, 'finance'::text, 'admin'::text, 'development'::text, 'data'::text, 'analytics'::text])),
  estimated_impact text NOT NULL CHECK (estimated_impact = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])),
  urgency text NOT NULL CHECK (urgency = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'urgent'::text])),
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'denied'::text])),
  stage text NOT NULL DEFAULT 'planning'::text CHECK (stage = ANY (ARRAY['planning'::text, 'developing'::text, 'testing'::text, 'complete'::text])),
  admin_notes text,
  submitted_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT requests_pkey PRIMARY KEY (id),
  CONSTRAINT requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  google_id text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  picture text,
  is_admin boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);