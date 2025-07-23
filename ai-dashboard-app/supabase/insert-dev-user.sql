-- Insert the dev user that matches the UUID in the code
INSERT INTO public.users (id, email, name, picture, is_admin)
VALUES (
  '5241162c-4d96-4a7a-b18e-eb9544f9e0d1',
  'shyam.pathak@ascendcohealth.com',
  'Shyam Pathak (Dev)',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  true
)
ON CONFLICT (id) DO NOTHING;