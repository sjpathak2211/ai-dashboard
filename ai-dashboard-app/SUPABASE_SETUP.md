# Supabase Setup Guide

This guide will help you set up Supabase for the AI Progress Dashboard.

## Prerequisites

- A Supabase account (Pro subscription recommended for better performance)
- Access to your Supabase project dashboard

## Step 1: Create Database Schema

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor (Database → SQL Editor)
3. Create a new query and paste the contents of `supabase/schema.sql`
4. Run the query to create all tables, types, and policies

## Step 2: Seed Initial Data (Optional)

1. In the SQL Editor, create another query
2. Paste the contents of `supabase/seed.sql`
3. Run the query to populate sample projects

## Step 3: Configure Authentication

### Enable Google OAuth in Supabase

1. Go to Authentication → Providers
2. Enable Google provider
3. Add your Google OAuth credentials:
   - **Client ID**: Your Google Client ID
   - **Client Secret**: Your Google Client Secret
4. Add redirect URLs:
   - `http://localhost:5173` (for development)
   - Your production URL

### Configure Auth Settings

1. Go to Authentication → Settings
2. Under "Site URL", add: `http://localhost:5173` (for development)
3. Under "Redirect URLs", add:
   - `http://localhost:5173`
   - Your production URL

## Step 4: Get Your API Keys

1. Go to Settings → API
2. Copy:
   - **Project URL**: This is your `VITE_SUPABASE_URL`
   - **Anon/Public Key**: This is your `VITE_SUPABASE_ANON_KEY`

## Step 5: Configure Environment Variables

1. Create a `.env` file in the project root
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 6: Configure Admin Users

Admin users are automatically detected based on their email. To add admin emails:

1. Edit the `handle_new_user()` function in the schema
2. Update the CASE statement to include admin emails:

```sql
CASE 
  WHEN NEW.email IN (
    'shyam.pathak@ascendcohealth.com', 
    'admin@ascendcohealth.com',
    'your-email@ascendcohealth.com'  -- Add more admin emails here
  ) 
  THEN true 
  ELSE false 
END
```

## Step 7: Test the Connection

1. Start your development server: `npm run dev`
2. Try to sign in with Google
3. Check that your user appears in the Supabase dashboard under Authentication → Users

## Database Structure

### Tables

1. **users** - User profiles (extends Supabase auth)
   - Automatically created when users sign up
   - Stores name, email, picture, and admin status

2. **ai_requests** - AI request tickets
   - Main table for tracking all requests
   - Linked to users table
   - Includes status, progress, and admin notes

3. **activity_log** - Activity tracking
   - Automatically logs status changes and updates
   - Used for the activity feed

4. **backlog_status** - Current backlog status
   - Single row table
   - Updated by admins

5. **projects** - Showcase projects
   - General AI projects for display

### Row Level Security (RLS)

The schema includes comprehensive RLS policies:
- Users can only see their own requests
- Admins can see and edit all requests
- Everyone can view projects and backlog status
- Only admins can update backlog status

## Real-time Features

The app uses Supabase real-time subscriptions for:
- Request status updates
- Progress changes
- New activities
- Backlog status changes

## Troubleshooting

### "Missing Supabase environment variables"
- Ensure your `.env` file exists and contains the correct values
- Restart your development server after adding environment variables

### Authentication Issues
- Check that Google OAuth is enabled in Supabase
- Verify redirect URLs are correctly configured
- Ensure your domain is whitelisted in Google Cloud Console

### Permission Errors
- Check that RLS policies are properly created
- Verify the user's admin status in the users table
- Check Supabase logs for detailed error messages

### Real-time Not Working
- Ensure you have real-time enabled for your tables
- Check WebSocket connection in browser dev tools
- Verify your Supabase plan supports real-time

## Production Deployment

1. Add your production URL to:
   - Supabase Authentication settings
   - Google OAuth authorized domains
   
2. Update environment variables in your deployment platform

3. Consider enabling:
   - Email rate limiting
   - Additional security policies
   - Database backups

## Next Steps

1. Customize the schema for your specific needs
2. Add additional indexes for performance
3. Set up database backups
4. Configure monitoring and alerts
5. Implement additional security measures as needed