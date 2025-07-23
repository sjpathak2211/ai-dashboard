-- For testing without authentication, you have two options:

-- OPTION 1: Temporarily remove the foreign key constraint (for dev only!)
-- Run these commands in order:

-- 1. Drop the foreign key constraint
ALTER TABLE public.users DROP CONSTRAINT users_id_fkey;

-- 2. Insert the dev user
INSERT INTO public.users (id, email, name, picture, is_admin)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'dev@example.com',
  'Dev User',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  true
)
ON CONFLICT (id) DO NOTHING;

-- 3. When you're done testing and ready for production, restore the constraint:
-- ALTER TABLE public.users ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- OPTION 2: Use Supabase Dashboard to create a user
-- 1. Go to Authentication > Users in Supabase Dashboard
-- 2. Click "Create user"
-- 3. Use email: dev@example.com
-- 4. Note the generated user ID
-- 5. Update the code to use that ID instead of '00000000-0000-0000-0000-000000000000'