# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a modern, interactive AI Progress Dashboard built for Ascendco Health to track AI-related work and initiatives across the organization. It's a React-based single-page application with TypeScript, focusing on healthcare professional aesthetics and functionality.

## Development Commands

### Essential Commands
- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Build for production 
- `npm run lint` - Run ESLint for code quality
- `npm run preview` - Preview production build locally

### Directory Navigation
- Main application code: `cd ai-dashboard-app/`
- All npm commands should be run from `ai-dashboard-app/` directory

## Architecture Overview

### Technology Stack
- **React 19** with TypeScript for type safety
- **Vite** for fast development and building
- **Framer Motion** for smooth animations
- **Recharts** for data visualization
- **Lucide React** for icons
- **CSS Custom Properties** for theming

### Component Structure
```
src/components/
├── Header.tsx              # Navigation with company branding
├── DashboardOverview.tsx   # Metrics, charts, and activity feed
├── ProjectsSection.tsx     # Project cards with filtering/search
├── AIRequestModal.tsx      # Request submission with Shortcut integration
└── *.css                   # Component-specific styles
```

### Key Features Implemented
1. **Dashboard Overview** - Metrics cards, line/pie charts, recent activity
2. **AI Request Submission** - Modal form with Shortcut story generation
3. **Project Management** - Searchable/filterable project cards with progress tracking
4. **Responsive Design** - Mobile-first approach with breakpoints
5. **Ascendco Health Branding** - Professional healthcare blue color scheme

## Design System

### Color Palette (Ascendco Health)
- Primary Blue: `#0066cc` (--primary-blue)
- Accent Teal: `#00BCD4` (--accent-teal) 
- Gray Scale: `--gray-50` to `--gray-900`
- Status Colors: Success, Warning, Error, Info

### Typography
- Font Stack: Inter, system fonts
- Responsive sizing with CSS custom properties
- Consistent weight hierarchy (400, 500, 600, 700)

## Data Management

### Mock Data Location
- `src/data/mockData.ts` - Contains sample projects, requests, metrics, and activity
- Pre-populated with 6 AI projects across different healthcare departments
- Realistic healthcare use cases (patient triage, medical records, etc.)

### Type Definitions
- `src/types.ts` - All TypeScript interfaces and types
- Key types: `Project`, `AIRequest`, `DashboardMetrics`, `ActivityItem`

## Key Integrations

### Shortcut Story Generation
- AI request modal automatically formats submissions as Shortcut stories
- Includes project details, next steps checklist, and tracking ID
- Copy-to-clipboard functionality for easy import to Shortcut

### Responsive Breakpoints
- Desktop: 1024px+
- Tablet: 768px - 1023px
- Mobile: < 768px

## Development Guidelines

### State Management
- React hooks (useState) for local state
- No global state management library needed yet
- Consider Context API if complexity grows

### Styling Approach
- CSS Modules approach with component-specific .css files
- CSS Custom Properties for theming and consistency
- Flexbox and Grid for layouts
- Smooth transitions and hover effects

### Accessibility
- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management for modals
- Semantic HTML structure

## Deployment Notes

- Built as static SPA, deployable to any static host
- Production build outputs to `dist/` folder
- Compatible with Vercel, Netlify, AWS S3, etc.
- No backend dependencies required

## Future Enhancement Areas

- Real API integration (replace mock data)
- User authentication/authorization
- Dark mode toggle
- Export functionality for reports
- Email notifications for request updates
- Advanced filtering and sorting options