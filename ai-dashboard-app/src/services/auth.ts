import type { GoogleCredentialResponse, DecodedGoogleToken, User } from '../types';

// Utility to decode JWT token
export const decodeGoogleToken = (credential: string): DecodedGoogleToken => {
  const base64Url = credential.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
};

// Check if email domain is allowed
export const isValidDomain = (email: string): boolean => {
  return email.endsWith('@ascendcohealth.com');
};

// Admin users list - in production, this should come from a backend API
const ADMIN_EMAILS = [
  'shyam.pathak@ascendcohealth.com',
  'admin@ascendcohealth.com',
  // Add more admin emails as needed
];

// TEMPORARY: Development bypass - REMOVE IN PRODUCTION
export const DEV_BYPASS_USER: User = {
  id: 'dev-admin-001',
  email: 'shyam.pathak@ascendcohealth.com',
  name: 'Shyam Pathak (Dev)',
  picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  isAdmin: true
};

// Check if user is an admin
export const isAdminUser = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email);
};

// Convert Google response to User object
export const createUserFromGoogle = (tokenData: DecodedGoogleToken): User => {
  return {
    id: tokenData.sub,
    email: tokenData.email,
    name: tokenData.name,
    picture: tokenData.picture,
    isAdmin: isAdminUser(tokenData.email)
  };
};

// Initialize Google Sign-In
export const initializeGoogleAuth = (onSuccess: (user: User) => void, onError: (error: string) => void) => {
  if (typeof window !== 'undefined' && window.google) {
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id-here',
      callback: (response: GoogleCredentialResponse) => {
        try {
          const tokenData = decodeGoogleToken(response.credential);
          
          if (!isValidDomain(tokenData.email)) {
            onError('Please sign in with your @ascendcohealth.com email address.');
            return;
          }
          
          const user = createUserFromGoogle(tokenData);
          onSuccess(user);
        } catch {
          onError('Authentication failed. Please try again.');
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true
    });
  }
};

// Render Google Sign-In button
export const renderGoogleSignInButton = (elementId: string) => {
  if (typeof window !== 'undefined' && window.google) {
    window.google.accounts.id.renderButton(
      document.getElementById(elementId),
      {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        shape: 'rectangular',
        text: 'signin_with',
        logo_alignment: 'left'
      }
    );
  }
};

// Sign out
export const signOut = () => {
  if (typeof window !== 'undefined' && window.google) {
    window.google.accounts.id.disableAutoSelect();
  }
};

// Add type declarations for Google Identity Services
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (element: HTMLElement | null, config: {
            theme?: 'outline' | 'filled_blue' | 'filled_black';
            size?: 'large' | 'medium' | 'small';
            type?: 'standard' | 'icon';
            shape?: 'rectangular' | 'pill' | 'circle' | 'square';
            text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
            logo_alignment?: 'left' | 'center';
          }) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}