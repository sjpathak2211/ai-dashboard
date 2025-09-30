import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tailwind.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'

// Handle GitHub Pages subdirectory redirect
if (window.location.pathname === '/' && window.location.hostname === 'sjpathak2211.github.io') {
  // Check if we have auth tokens in the URL
  if (window.location.hash.includes('access_token')) {
    // Redirect to the app subdirectory with the auth tokens
    window.location.href = '/ai-dashboard/' + window.location.hash;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
