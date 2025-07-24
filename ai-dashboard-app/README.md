# AI Progress Dashboard - Ascendco Health

A modern, interactive dashboard for tracking AI-related work and initiatives across Ascendco Health organization.

## Features

### 🎯 Dashboard Overview
- **Key Metrics**: Active projects, completed projects, in-review status, and total requests
- **Visual Charts**: Progress tracking over time and project status distribution
- **Recent Activity**: Real-time feed of project updates and submissions

### 📝 AI Request Submission
- **Comprehensive Form**: Capture project details, department, priority, and impact
- **Shortcut Integration**: Auto-generate formatted stories for project management
- **Form Validation**: Ensure all required information is provided

### 📊 Project Management
- **Project Cards**: Detailed view of current AI initiatives
- **Status Tracking**: Planning, In Progress, Testing, Complete, On Hold
- **Progress Indicators**: Visual progress bars and completion percentages
- **Search & Filter**: Find projects by status, title, or description

### 🎨 Design Features
- **Ascendco Health Branding**: Professional healthcare blue color scheme
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Smooth Animations**: Framer Motion powered interactions
- **Accessibility**: Proper focus management and keyboard navigation

## Technology Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS Custom Properties with modern layout techniques
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **State Management**: React hooks

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## Project Structure

```
src/
├── components/           # React components
│   ├── Header.tsx       # Main navigation header
│   ├── DashboardOverview.tsx  # Metrics and charts
│   ├── ProjectsSection.tsx    # Project cards and filtering
│   ├── AIRequestModal.tsx     # Request submission modal
│   └── *.css           # Component-specific styles
├── data/
│   └── mockData.ts     # Sample data for demonstration
├── types.ts            # TypeScript type definitions
├── App.tsx             # Main application component
├── App.css             # Application-wide styles
├── index.css           # Global styles and CSS variables
└── main.tsx            # Application entry point
```

## Sample Data

The dashboard comes pre-populated with realistic sample data including:

- **6 AI Projects** across different departments and stages
- **3 Recent Requests** from various teams
- **Realistic Metrics** showing progress and activity
- **Activity Timeline** with recent updates

## Customization

### Colors
Update CSS custom properties in `src/index.css`:
```css
:root {
  --primary-blue: #0066cc;
  --accent-teal: #00BCD4;
  /* ... other variables */
}
```

### Data Source
Replace mock data in `src/data/mockData.ts` with real API calls or database connections.

### Branding
- Update logo placeholder in `Header.tsx`
- Modify company name references
- Adjust color scheme as needed

## Deployment

The application can be deployed to any static hosting service:

1. **Build the project**: `npm run build`
2. **Deploy the `dist` folder** to your hosting service

Compatible with:
- Vercel
- Netlify  ..
- AWS S3 + CloudFront
- Azure Static Web Apps
- GitHub Pages

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Contributing

1. Follow the existing code style
2. Add TypeScript types for new features
3. Test responsive design on multiple screen sizes
4. Ensure accessibility standards are met

## License

MIT License - see LICENSE file for details.

---

Built with ❤️ for Ascendco Health's AI initiatives.