import { useState, useEffect, lazy, Suspense } from 'react';
import type { AIRequest, User, Project } from './types';
import { signOut } from './services/auth';
import { supabase, authService, projectsService, subscriptions } from './services/supabase';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { isAdminEmail } from './lib/roles';
import './App.css';

// Import critical components directly for faster initial load
import Login from './components/Login';
import Header from './components/Header';

// Lazy load heavy components
const DashboardOverview = lazy(() => import('./components/DashboardOverview'));
const UserDashboard = lazy(() => import('./components/UserDashboard'));
const ProjectsSection = lazy(() => import('./components/ProjectsSection'));
const AIRequestModal = lazy(() => import('./components/AIRequestModal'));
const AdminConsole = lazy(() => import('./components/AdminConsole'));

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdminConsole, setShowAdminConsole] = useState(false);
  
  // Metrics state - we'll load this from Supabase
  const [userMetrics, setUserMetrics] = useState<any>(null);
  const [metricsLoaded, setMetricsLoaded] = useState(false);

  // Check for existing session on app load
  useEffect(() => {
    // Check for Supabase auth session
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session check:', session?.user ? 'User found' : 'No user');
        
        if (session?.user) {
          console.log('Attempting to get user from database...');
          
          // Add timeout for initial load too
          const timeoutPromise = new Promise<null>((resolve) => {
            setTimeout(() => {
              console.log('Initial getCurrentUser timeout - using fallback user');
              resolve(null);
            }, 500); // 500ms timeout for initial load
          });
          
          try {
            const dbUser = await Promise.race([authService.getCurrentUser(), timeoutPromise]);
            if (dbUser) {
              console.log('Database user found:', dbUser.email);
              setUser(dbUser);
            } else {
              console.log('Using fallback user for initial load');
              // Create fallback user from session
              const fallbackUser = {
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                picture: session.user.user_metadata?.picture || session.user.user_metadata?.avatar_url,
                isAdmin: isAdminEmail(session.user.email || '')
              };
              setUser(fallbackUser);
            }
          } catch (getUserError) {
            console.error('Error getting user:', getUserError);
            // Create fallback user
            const fallbackUser = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || 'User',
              picture: session.user.user_metadata?.picture || session.user.user_metadata?.avatar_url,
              isAdmin: isAdminEmail(session.user.email || '')
            };
            setUser(fallbackUser);
          }
        } else {
          console.log('No session found');
          // Clear any stale localStorage data
          localStorage.removeItem('ascendco_user');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // Clear session on error
        await supabase.auth.signOut();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      console.log('Auth state change:', event, session?.user?.email);
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('Processing sign in for:', session.user.email);
        
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise<null>((resolve) => {
          setTimeout(() => {
            console.log('getCurrentUser timeout - using fallback user');
            resolve(null);
          }, 1000); // 1 second timeout
        });
        
        const userPromise = authService.getCurrentUser();
        
        try {
          const dbUser = await Promise.race([userPromise, timeoutPromise]);
          
          if (dbUser) {
            console.log('Database user loaded:', dbUser.email, 'isAdmin:', dbUser.isAdmin);
            setUser(dbUser);
          } else {
            console.log('Using fallback user due to timeout or error');
            // Create a fallback user from session data
            const fallbackUser = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              picture: session.user.user_metadata?.picture || session.user.user_metadata?.avatar_url,
              isAdmin: isAdminEmail(session.user.email || '')
            };
            setUser(fallbackUser);
          }
        } catch (error) {
          console.error('Error during user loading:', error);
          // Create fallback user
          const fallbackUser = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || 'User',
            picture: session.user.user_metadata?.picture || session.user.user_metadata?.avatar_url,
            isAdmin: isAdminEmail(session.user.email || '')
          };
          setUser(fallbackUser);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setUser(null);
        localStorage.removeItem('ascendco_user');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch projects when user is authenticated with a slight delay to prioritize UI
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsData = await projectsService.getProjects();
        setProjects(projectsData);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      }
    };

    if (user) {
      // Delay project fetch to prioritize initial render
      const timer = setTimeout(fetchProjects, 100);

      // Subscribe to real-time project updates
      const projectsChannel = subscriptions.subscribeToProjects?.((payload) => {
        console.log('Project update:', payload);
        fetchProjects(); // Refetch all projects on any change
      });

      return () => {
        clearTimeout(timer);
        if (projectsChannel) {
          subscriptions.unsubscribe(projectsChannel);
        }
      };
    }
  }, [user]);

  // Load metrics from Supabase
  useEffect(() => {
    const loadMetrics = async () => {
      if (!user) return;

      try {
        const { metricsService } = await import('./services/supabase');
        const metrics = await metricsService.getDashboardMetrics(user.id);
        setUserMetrics(metrics);
      } catch (error) {
        console.error('Error loading metrics:', error);
        // Set default metrics on error
        setUserMetrics({
          totalActiveProjects: 0,
          yourActiveProjects: 0,
          deniedRequests: 0,
          totalRequests: 0,
          completedRequests: 0,
          inProgressRequests: 0
        });
      } finally {
        setMetricsLoaded(true);
      }
    };

    if (user) {
      loadMetrics();
    }
  }, [user]);

  const handleLogin = async (userData: User) => {
    console.log('handleLogin called with:', userData.email);
    // For Google OAuth, we'll rely on the Supabase auth state change
    // to properly set the user after database user creation
    setUser(userData);
    
    // Store temporarily in localStorage as backup
    localStorage.setItem('ascendco_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ascendco_user');
    signOut();
  };

  const handleNewRequest = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAdminClick = () => {
    setShowAdminConsole(true);
  };

  const handleBackToDashboard = () => {
    setShowAdminConsole(false);
  };

  const handleSubmitRequest = async (requestData: Omit<AIRequest, 'id' | 'submittedAt' | 'userId' | 'userEmail' | 'userName'>) => {
    if (!user) return;

    // Close modal immediately for better UX
    setIsModalOpen(false);

    // The AIRequestModal already saves to Supabase via requestsService.createRequest()
    // The UserDashboard will automatically refresh via real-time subscriptions
    // We just need to refresh the metrics
    try {
      const { metricsService } = await import('./services/supabase');
      const metrics = await metricsService.getDashboardMetrics(user.id);
      setUserMetrics(metrics);
      console.log('Metrics refreshed after new request submission');
    } catch (error) {
      console.error('Error refreshing metrics after submission:', error);
    }
  };

  // Show loading spinner while checking for existing session
  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Show login screen if user is not authenticated
  if (!user) {
    return (
      <Suspense fallback={
        <div className="app-loading">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      }>
        <Login onLogin={handleLogin} />
      </Suspense>
    );
  }

  // Show admin console if requested
  if (showAdminConsole && user?.isAdmin) {
    return (
      <Suspense fallback={
        <div className="app-loading">
          <div className="loading-spinner"></div>
          <p>Loading Admin Console...</p>
        </div>
      }>
        <AdminConsole user={user} onBack={handleBackToDashboard} />
      </Suspense>
    );
  }

  // Show loading until metrics are ready
  if (!metricsLoaded && user) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Suspense fallback={
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <div className="loading-spinner"></div>
        </div>
      }>
        <Header 
          onNewRequest={handleNewRequest} 
          user={user} 
          onLogout={handleLogout}
          onAdminClick={handleAdminClick}
        />
      </Suspense>
      
      <main className="main-content">
        {/* Always show metrics overview */}
        <Suspense fallback={<div className="metric-card-skeleton" />}>
          <DashboardOverview 
            metrics={userMetrics} 
          />
        </Suspense>
        
        {/* Always show user dashboard */}
        <Suspense fallback={<div className="dashboard-skeleton" />}>
          <UserDashboard user={user} />
        </Suspense>

        {/* Always show projects section */}
        <Suspense fallback={<div className="projects-skeleton" />}>
          <ProjectsSection projects={projects} />
        </Suspense>
      </main>

      <Suspense fallback={null}>
        {isModalOpen && (
          <AIRequestModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleSubmitRequest}
            user={user}
          />
        )}
      </Suspense>
    </div>
  );
}

export default App;