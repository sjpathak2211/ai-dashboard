# Development Setup Guide

## Quick Setup for Testing (Without Google OAuth)

Since Google OAuth isn't configured yet, follow these steps to test the application:

### 1. Create a Test User in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Users**
3. Click **"Add user"** > **"Create new user"**
4. Fill in:
   - Email: `dev@example.com`
   - Password: Any password (e.g., `devpassword123`)
5. Click **"Create user"**
6. Copy the generated User ID (it will look like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

### 2. Update the Dev User ID in Code

Open `/src/services/supabase.ts` and update line 143:

```typescript
const userId = user.data.user?.id || 'YOUR-COPIED-USER-ID-HERE';
```

Replace `'00000000-0000-0000-0000-000000000000'` with the actual User ID you copied.

### 3. Add User to the Users Table

Run this SQL in your Supabase SQL Editor:

```sql
INSERT INTO public.users (id, email, name, picture, is_admin)
VALUES (
  'YOUR-COPIED-USER-ID-HERE',  -- Replace with your actual user ID
  'dev@example.com',
  'Dev User',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  true
);
```

### 4. You're Ready!

Now you can:
- Submit AI requests
- View them in the Admin Console
- Test all features without authentication

### When Ready for Production

1. Set up Google OAuth in Google Cloud Console
2. Configure OAuth in Supabase
3. Re-enable RLS policies
4. Remove the dev user ID fallback from the code