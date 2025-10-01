import React, { useState } from 'react';
import { Shield, AlertCircle } from 'lucide-react';
import { authService } from '../services/supabase';
import type { User } from '../types';
import logoPath from '../assets/ascendco-logo-new.png';
import { Spinner } from './ui';

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
      console.log('OAuth redirect initiated', result);
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-clinical-ghost to-accent-cyan-50 p-4">
      <div className="w-full max-w-md bg-clinical-white rounded-2xl shadow-clinical p-8 space-y-6 animate-fade-up">
        {/* Header */}
        <div className="text-center space-y-4">
          <img
            src={logoPath}
            alt="Ascendco Health"
            className="w-20 h-20 mx-auto rounded-xl shadow-md"
          />
          <div>
            <h1 className="text-3xl font-bold text-neutral-800">AI Progress Dashboard</h1>
            <p className="text-sm text-neutral-500 mt-1">Ascendco Health</p>
          </div>
        </div>

        {/* Security Info */}
        <div className="flex gap-4 p-4 bg-clinical-light rounded-xl border border-clinical-border">
          <Shield className="flex-shrink-0 text-primary-500" size={24} />
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-neutral-800">Secure Access</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              This dashboard is restricted to Ascendco Health team members. Please sign in with your @ascendcohealth.com email address.
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-error-light rounded-lg text-error-dark text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Sign In Button */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <Spinner size="md" />
              <span className="text-sm text-neutral-600">Signing in...</span>
            </div>
          ) : (
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-clinical-white border-2 border-neutral-300 rounded-xl font-semibold text-neutral-700 shadow-sm transition-all duration-200 hover:bg-neutral-50 hover:border-neutral-400 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
              disabled={isLoading}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" className="flex-shrink-0">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          )}
        </div>

        {/* Footer Help Text */}
        <div className="text-center">
          <p className="text-xs text-neutral-500 leading-relaxed">
            Having trouble signing in? Make sure you're using your Ascendco Health email address or contact IT support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
