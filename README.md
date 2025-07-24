# AI Progress Dashboard - Deployment Guide

This guide will help you deploy the AI Progress Dashboard for Ascendco Health.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (for database and authentication)
- Deployment platform account (Vercel, Netlify, or similar)

## Deployment Steps

### 1. Prepare the Application

```bash
# Navigate to the app directory
cd ai-dashboard-app

# Install dependencies
npm install

# Build the application
npm run build
```

### 2. Environment Variables

Create a `.env.production` file with your production environment variables:

```env
VITE_SUPABASE_URL=your-production-supabase-url
VITE_SUPABASE_ANON_KEY=your-production-anon-key
VITE_ANTHROPIC_API_KEY=your-anthropic-api-key
```

### 3. Deployment Options

#### Option A: Deploy to GitHub Pages

GitHub Pages is a free hosting service for static sites. Here's a comprehensive guide:

**Step 1: Update Vite Configuration**

First, update `vite.config.ts` to set the correct base path:

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/ai-dashboard/', // Replace with your repository name
  // ... rest of your config
})
```

**Step 2: Install gh-pages**

```bash
cd ai-dashboard-app
npm install --save-dev gh-pages
```

**Step 3: Update package.json**

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    // ... existing scripts
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

**Step 4: Create GitHub Repository**

1. Go to GitHub and create a new repository named `ai-dashboard`
2. Don't initialize with README (you already have one)
3. Push your existing code:

```bash
git remote add origin https://github.com/YOUR_USERNAME/ai-dashboard.git
git branch -M main
git push -u origin main
```

**Step 5: Configure Environment Variables**

Since GitHub Pages doesn't support server-side environment variables, you'll need to:

1. Create a `.env.production` file:
```env
VITE_SUPABASE_URL=your-production-supabase-url
VITE_SUPABASE_ANON_KEY=your-production-anon-key
VITE_ANTHROPIC_API_KEY=your-anthropic-api-key
```

2. Make sure `.env.production` is in `.gitignore` (for security)

3. Build with environment variables:
```bash
npm run build
```

**Step 6: Handle Client-Side Routing**

GitHub Pages doesn't support client-side routing by default. Create a `404.html` in the public folder:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>AI Progress Dashboard</title>
    <script type="text/javascript">
      // Single Page Apps for GitHub Pages
      // https://github.com/rafgraph/spa-github-pages
      var pathSegmentsToKeep = 1;
      var l = window.location;
      l.replace(
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
        l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash
      );
    </script>
  </head>
  <body>
  </body>
</html>
```

Also update your `index.html`:

```html
<!-- Add this script to your index.html in the <head> section -->
<script type="text/javascript">
  (function(l) {
    if (l.search[1] === '/' ) {
      var decoded = l.search.slice(1).split('&').map(function(s) { 
        return s.replace(/~and~/g, '&')
      }).join('?');
      window.history.replaceState(null, null,
          l.pathname.slice(0, -1) + decoded + l.hash
      );
    }
  }(window.location))
</script>
```

**Step 7: Deploy**

```bash
npm run deploy
```

**Step 8: Enable GitHub Pages**

1. Go to your repository on GitHub
2. Go to Settings → Pages
3. Under "Source", select "Deploy from a branch"
4. Select `gh-pages` branch and `/ (root)` folder
5. Click Save

**Step 9: Update Supabase**

Add your GitHub Pages URL to Supabase:
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add `https://YOUR_USERNAME.github.io/ai-dashboard/` to Redirect URLs

**Important Considerations for GitHub Pages:**

1. **No Server-Side Code**: GitHub Pages only hosts static files, so the Express server for Claude API won't work. You'll need to:
   - Deploy the Express server separately (Heroku, Render, etc.)
   - Update the API URL in your frontend code to point to the deployed server
   - Handle CORS appropriately

2. **Environment Variables**: Since they're baked into the build, be extra careful:
   - Never commit `.env` files
   - Consider using GitHub Secrets with GitHub Actions for automated deployments

3. **Custom Domain** (Optional):
   - Create a `CNAME` file in the `public` folder with your domain
   - Configure DNS settings with your domain provider

**Automated Deployment with GitHub Actions:**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        cd ai-dashboard-app
        npm ci
        
    - name: Build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        VITE_ANTHROPIC_API_KEY: ${{ secrets.VITE_ANTHROPIC_API_KEY }}
      run: |
        cd ai-dashboard-app
        npm run build
        
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./ai-dashboard-app/dist
```

Then add your secrets in GitHub:
1. Go to Settings → Secrets and variables → Actions
2. Add your environment variables as secrets

#### Option B: Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Follow the prompts:
   - Link to existing project or create new
   - Set the root directory to `ai-dashboard-app`
   - Use build command: `npm run build`
   - Output directory: `dist`

4. Set environment variables in Vercel dashboard:
   - Go to Project Settings > Environment Variables
   - Add all variables from `.env.production`

#### Option B: Deploy to Netlify

1. Install Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```

2. Deploy:
   ```bash
   netlify deploy
   ```

3. For production deployment:
   ```bash
   netlify deploy --prod
   ```

4. Configuration:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Set environment variables in Netlify dashboard

#### Option C: Deploy to AWS S3 + CloudFront

1. Build the application:
   ```bash
   npm run build
   ```

2. Upload the `dist` folder to your S3 bucket

3. Configure S3 for static website hosting

4. Set up CloudFront distribution for HTTPS and caching

5. Configure environment variables through your build process

### 4. Supabase Configuration

1. **Database Setup**:
   - Ensure all tables are created (users, projects, ai_requests, backlog_status, updates)
   - Apply Row Level Security (RLS) policies
   - Set up database triggers for timestamps

2. **Authentication**:
   - Enable Google OAuth provider in Supabase dashboard
   - Add your domain to authorized redirect URLs
   - Configure OAuth consent screen with Ascendco Health branding

3. **Security**:
   - Use service role key only for server-side operations
   - Ensure RLS policies restrict data access appropriately
   - Set up proper CORS configuration

### 5. Domain Configuration

1. Add custom domain in your deployment platform
2. Update DNS records to point to your deployment
3. Enable HTTPS (usually automatic with Vercel/Netlify)
4. Update Supabase redirect URLs to include your production domain

### 6. Post-Deployment Checklist

- [ ] Test Google OAuth login flow
- [ ] Verify admin users can access admin console
- [ ] Test AI request submission
- [ ] Verify real-time updates are working
- [ ] Check all environment variables are set correctly
- [ ] Test Marshal AI assistant functionality
- [ ] Verify data persistence in Supabase
- [ ] Monitor application performance

### 7. Express Server Deployment (for Claude API)

If using the Marshal AI assistant, deploy the Express proxy server:

1. Create a separate deployment for the server:
   ```bash
   cd server
   npm install
   ```

2. Deploy to a Node.js hosting service (Heroku, Railway, Render)

3. Set server environment variables:
   ```env
   PORT=3001
   ANTHROPIC_API_KEY=your-api-key
   ```

4. Update the Vite config proxy to point to your production server URL

## Monitoring and Maintenance

1. **Error Tracking**: Consider adding Sentry or similar error tracking
2. **Analytics**: Add Google Analytics or Plausible for usage tracking
3. **Backups**: Enable Supabase automatic backups
4. **Updates**: Regularly update dependencies for security patches

## Troubleshooting

### Common Issues

1. **White screen after deployment**:
   - Check browser console for errors
   - Verify all environment variables are set
   - Check network tab for failed API requests

2. **Authentication not working**:
   - Verify Supabase URL and anon key
   - Check OAuth redirect URLs include your domain
   - Ensure Google OAuth is enabled in Supabase

3. **Data not persisting**:
   - Check RLS policies in Supabase
   - Verify user has proper permissions
   - Check Supabase logs for errors

## Support

For issues specific to:
- Supabase: Check their documentation at https://supabase.io/docs
- Deployment platforms: Refer to platform-specific documentation
- Application bugs: Check the error boundary for detailed error messages

## Security Considerations

1. Never commit `.env` files to version control
2. Use environment variables for all sensitive data
3. Keep dependencies updated
4. Enable 2FA on all service accounts
5. Regularly review access logs
6. Implement rate limiting for API endpoints

---

Built with ❤️ for Ascendco Health