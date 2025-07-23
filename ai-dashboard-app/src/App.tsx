import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Login from './components/Login';
import DemoLogin from './components/DemoLogin';
import Header from './components/Header';
import DashboardOverview from './components/DashboardOverview';
import UserDashboard from './components/UserDashboard';
import ProjectsSection from './components/ProjectsSection';
import AIRequestModal from './components/AIRequestModal';
import AdminConsole from './components/AdminConsole';
import { getUserRequests, getUserMetrics } from './data/mockData';
import type { AIRequest, User, Project } from './types';
import { signOut, DEV_BYPASS_USER } from './services/auth';
import { supabase, authService, projectsService, subscriptions } from './services/supabase';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import './App.css';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdminConsole, setShowAdminConsole] = useState(false);

  // Check for existing session on app load
  useEffect(() => {
    // Check for Supabase auth session
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const dbUser = await authService.getCurrentUser();
          if (dbUser) {
            setUser(dbUser);
          }
        } else {
          // Fallback to saved user or dev bypass
          const savedUser = localStorage.getItem('ascendco_user');
          if (savedUser) {
            try {
              setUser(JSON.parse(savedUser));
            } catch (error) {
              console.error('Error loading saved user:', error);
              localStorage.removeItem('ascendco_user');
            }
          } else if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
            // Use dev bypass if Supabase not configured
            setUser(DEV_BYPASS_USER);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const dbUser = await authService.getCurrentUser();
        if (dbUser) {
          setUser(dbUser);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('ascendco_user');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch projects when user is authenticated
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
      fetchProjects();

      // Subscribe to real-time project updates
      const projectsChannel = subscriptions.subscribeToProjects?.((payload) => {
        console.log('Project update:', payload);
        fetchProjects(); // Refetch all projects on any change
      });

      return () => {
        if (projectsChannel) {
          subscriptions.unsubscribe(projectsChannel);
        }
      };
    }
  }, [user]);


  const handleLogin = (userData: User) => {
    setUser(userData);
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

  const handleSubmitRequest = (requestData: Omit<AIRequest, 'id' | 'submittedAt' | 'userId' | 'userEmail' | 'userName'>) => {
    if (!user) return;

    const newRequest: AIRequest = {
      ...requestData,
      id: `req-${Date.now()}`,
      submittedAt: new Date(),
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      progress: 0,
      lastUpdated: new Date()
    };
    
    // In a real app, this would be sent to your backend API
    console.log('New AI request submitted:', newRequest);
    
    // You could also update local state here to show the new request immediately
    // For now, we'll just close the modal
    setIsModalOpen(false);
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
    const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
                                 import.meta.env.VITE_SUPABASE_URL !== 'https://your-project.supabase.co' &&
                                 import.meta.env.VITE_SUPABASE_ANON_KEY &&
                                 import.meta.env.VITE_SUPABASE_ANON_KEY !== 'your-anon-key-here';
    
    return isSupabaseConfigured ? (
      <Login onLogin={handleLogin} />
    ) : (
      <DemoLogin onLogin={handleLogin} />
    );
  }

  // Show admin console if requested
  if (showAdminConsole && user?.isAdmin) {
    return <AdminConsole user={user} onBack={handleBackToDashboard} />;
  }

  // Get user-specific data
  const userRequests = getUserRequests(user.email);
  const hasRequests = userRequests.length > 0;
  const userMetrics = getUserMetrics(user.email);

  return (
    <div className="app">
      
      <Header 
        onNewRequest={handleNewRequest} 
        user={user} 
        onLogout={handleLogout}
        onAdminClick={user?.isAdmin ? handleAdminClick : undefined}
      />
      
      <main className="main-content">
        {hasRequests ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <DashboardOverview 
                metrics={userMetrics} 
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <UserDashboard user={user} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ProjectsSection projects={projects} />
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="welcome-section"
          >
            <UserDashboard user={user} />
          </motion.div>
        )}
      </main>

      <AIRequestModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitRequest}
        user={user}
      />
    </div>
  );
}

export default App;