import React, { useEffect, useState } from 'react';
import { Shield, AlertCircle, KeyRound } from 'lucide-react';
import { initializeGoogleAuth, renderGoogleSignInButton, DEV_BYPASS_USER } from '../services/auth';
import type { User } from '../types';
import logoPath from '../assets/ascendco-logo-new.png';
import './Login.css';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      initializeGoogleAuth(
        (user: User) => {
          setError('');
          onLogin(user);
        },
        (errorMessage: string) => {
          setError(errorMessage);
        }
      );
      
      // Small delay to ensure Google script is loaded
      setTimeout(() => {
        renderGoogleSignInButton('google-signin-button');
        setIsLoading(false);
      }, 500);
    };

    // Check if Google script is loaded
    if (window.google) {
      initAuth();
    } else {
      // Wait for Google script to load
      const checkGoogleLoaded = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogleLoaded);
          initAuth();
        }
      }, 100);
      
      // Cleanup interval after 10 seconds
      setTimeout(() => {
        clearInterval(checkGoogleLoaded);
        if (!window.google) {
          setError('Failed to load Google authentication. Please refresh the page.');
          setIsLoading(false);
        }
      }, 10000);
    }
  }, [onLogin]);

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
                <span>Loading authentication...</span>
              </div>
            ) : (
              <div id="google-signin-button" className="google-signin-wrapper"></div>
            )}
          </div>

          <div className="login-footer">
            <p className="login-help">
              Having trouble signing in? Make sure you're using your Ascendco Health email address or contact IT support.
            </p>
            
            {/* TEMPORARY DEV BYPASS - REMOVE IN PRODUCTION */}
            {process.env.NODE_ENV === 'development' && (
              <div className="dev-bypass-section">
                <div className="dev-bypass-divider">
                  <span>Development Only</span>
                </div>
                <button 
                  onClick={() => onLogin(DEV_BYPASS_USER)}
                  className="dev-bypass-btn"
                >
                  <KeyRound size={16} />
                  Quick Admin Access (Dev)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;