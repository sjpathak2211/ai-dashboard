# Google OAuth Setup Guide

This guide will help you set up Google OAuth for the AI Progress Dashboard.

## Prerequisites

- A Google Cloud Console account
- Access to create projects and OAuth credentials
- Your application's domain (e.g., `http://localhost:5173` for development)

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click on the project dropdown and select "New Project"
3. Give your project a name (e.g., "AI Progress Dashboard")
4. Click "Create"

### 2. Enable Google Sign-In API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google Sign-In API" or "Google Identity Services"
3. Click on it and then click "Enable"

### 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "Internal" for organization-only access
   - Fill in the required fields (app name, support email, etc.)
   - Add your domain to authorized domains
   - Save and continue

### 4. Configure OAuth Client

1. Application type: Select "Web application"
2. Name: "AI Progress Dashboard"
3. Authorized JavaScript origins:
   - For development: `http://localhost:5173`
   - For production: Your production URL (e.g., `https://dashboard.ascendcohealth.com`)
4. Click "Create"

### 5. Copy Your Client ID

1. After creation, you'll see your Client ID
2. Copy this ID (it looks like: `123456789012-abcdefghijklmnop.apps.googleusercontent.com`)

### 6. Configure the Application

1. Create a `.env` file in the project root (copy from `.env.example`)
2. Add your Client ID:
   ```
   VITE_GOOGLE_CLIENT_ID=your-client-id-here
   ```
3. Restart the development server

## Admin User Configuration

To grant admin access to specific users, update the `ADMIN_EMAILS` array in `src/services/auth.ts`:

```typescript
const ADMIN_EMAILS = [
  'shyam.pathak@ascendcohealth.com',
  'admin@ascendcohealth.com',
  // Add more admin emails as needed
];
```

Admin users will see an "Admin Console" button in the header that provides access to:
- View and manage all AI requests
- Update request status and progress
- Add admin notes
- Manage backlog status
- Approve, deny, or defer requests

## Testing

### With Google OAuth Configured

1. Start the development server: `npm run dev`
2. Click "Sign in with Google"
3. Use your @ascendcohealth.com email to sign in
4. Admin users will see the "Admin Console" button

### Without Google OAuth (Demo Mode)

If Google OAuth is not configured, the app will show a demo login screen with test users:
- **Shyam Pathak** (Admin) - Full access to Admin Console
- **Sarah Johnson** - Has active requests
- **Lisa Rodriguez** - Has active requests
- **Mike Chen** - Has pending requests
- **John Doe** - Has completed requests
- **New User** - No requests (empty state)

## Troubleshooting

### "Failed to load Google authentication"
- Check that the Google Sign-In script is loaded in `index.html`
- Verify your Client ID is correct
- Check browser console for errors

### "Please sign in with your @ascendcohealth.com email address"
- The app is configured to only accept @ascendcohealth.com emails
- To change this, modify the `isValidDomain` function in `src/services/auth.ts`

### Admin Console not showing
- Verify the user's email is in the `ADMIN_EMAILS` list
- Check that `isAdmin` is set to `true` for the user

## Security Notes

- Never commit your `.env` file to version control
- Keep your Client ID secure
- For production, ensure proper domain restrictions are set in Google Cloud Console
- Consider implementing backend validation for admin access