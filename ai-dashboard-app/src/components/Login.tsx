import React, { useState } from 'react';
import { Shield, AlertCircle } from 'lucide-react';
import { authService } from '../services/supabase';
import type { User } from '../types';
import logoPath from '../assets/ascendco-logo-new.png';
import './Login.css';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = () => {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError('');
      console.log('Initiating Supabase Google OAuth...');
      
      const result = await authService.signInWithGoogle();
      // The result has provider and url properties
      // If there was an error, it would have thrown
      console.log('OAuth redirect initiated', result);
      // The auth state change will handle setting the user
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src={logoPath} alt="Ascendco Health" className="login-logo" />
          <h1>AI Progress Dashboard</h1>
          <p className="login-subtitle">Ascendco Health</p>
        </div>

        <div className="login-content">
          <div className="login-security-info">
            <Shield className="security-icon" size={24} />
            <div className="security-text">
              <h3>Secure Access</h3>
              <p>This dashboard is restricted to Ascendco Health team members. Please sign in with your @ascendcohealth.com email address.</p>
            </div>
          </div>

          {error && (
            <div className="login-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="login-button-container">
            {isLoading ? (
              <div className="login-loading">
                <div className="loading-spinner"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              <button 
                onClick={handleGoogleSignIn}
                className="google-signin-button"
                disabled={isLoading}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" className="google-icon">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            )}
          </div>

          <div className="login-footer">
            <p className="login-help">
              Having trouble signing in? Make sure you're using your Ascendco Health email address or contact IT support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;