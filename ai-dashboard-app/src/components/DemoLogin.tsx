import React, { useState } from 'react';
import { Shield, AlertCircle, User as UserIcon } from 'lucide-react';
import type { User } from '../types';
import logoPath from '../assets/ascendco-logo-new.png';
import './Login.css';
import './DemoLogin.css';

interface DemoLoginProps {
  onLogin: (user: User) => void;
}

const DemoLogin: React.FC<DemoLoginProps> = ({ onLogin }) => {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Demo users with different request statuses
  const demoUsers = [
    {
      id: 'admin-shyam-001',
      email: 'shyam.pathak@ascendcohealth.com',
      name: 'Shyam Pathak',
      picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      description: '⭐ ADMIN USER - Full access to Admin Console',
      isAdmin: true
    },
    {
      id: 'user-sarah-123',
      email: 'sarah.johnson@ascendcohealth.com',
      name: 'Sarah Johnson',
      picture: 'https://images.unsplash.com/photo-1494790108755-2616b723d168?w=150&h=150&fit=crop&crop=face',
      description: 'Has 1 active request (AI Chatbot) - 75% progress'
    },
    {
      id: 'user-lisa-789',
      email: 'lisa.rodriguez@ascendcohealth.com', 
      name: 'Lisa Rodriguez',
      picture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      description: 'Has 1 active request (Financial Risk AI) - 45% progress'
    },
    {
      id: 'user-mike-456',
      email: 'mike.chen@ascendcohealth.com',
      name: 'Mike Chen', 
      picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      description: 'Has 1 request in planning phase - no active progress'
    },
    {
      id: 'user-john-101',
      email: 'john.doe@ascendcohealth.com',
      name: 'John Doe',
      picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      description: 'Has 1 completed request - see full dashboard functionality'
    },
    {
      id: 'user-new-001',
      email: 'new.user@ascendcohealth.com',
      name: 'New User',
      description: 'No requests yet - see empty state'
    }
  ];

  const handleDemoLogin = () => {
    if (!selectedUser) {
      setError('Please select a demo user');
      return;
    }

    const user = demoUsers.find(u => u.id === selectedUser);
    if (user) {
      setError('');
      onLogin({
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        isAdmin: user.isAdmin || false
      });
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src={logoPath} alt="Ascendco Health" className="login-logo" />
          <h1>AI Progress Dashboard</h1>
          <p className="login-subtitle">Ascendco Health - Demo Mode</p>
        </div>

        <div className="login-content">
          <div className="login-security-info">
            <Shield className="security-icon" size={24} />
            <div className="security-text">
              <h3>Demo Authentication</h3>
              <p>Google OAuth is not configured yet. Select a demo user below to test the dashboard functionality with different user scenarios.</p>
            </div>
          </div>

          {error && (
            <div className="login-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="demo-users-section">
            <h3>Select Demo User:</h3>
            <div className="demo-users-list">
              {demoUsers.map((user) => (
                <div 
                  key={user.id}
                  className={`demo-user-card ${selectedUser === user.id ? 'selected' : ''}`}
                  onClick={() => setSelectedUser(user.id)}
                >
                  <div className="demo-user-info">
                    {user.picture ? (
                      <img src={user.picture} alt={user.name} className="demo-user-avatar" />
                    ) : (
                      <div className="demo-user-avatar-placeholder">
                        <UserIcon size={20} />
                      </div>
                    )}
                    <div className="demo-user-details">
                      <strong>{user.name}</strong>
                      <span className="demo-user-email">{user.email}</span>
                      <p className="demo-user-description">{user.description}</p>
                    </div>
                  </div>
                  <div className="demo-user-radio">
                    <input 
                      type="radio" 
                      name="demoUser" 
                      checked={selectedUser === user.id}
                      onChange={() => setSelectedUser(user.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="login-button-container">
            <button 
              onClick={handleDemoLogin}
              className="demo-login-button"
              disabled={!selectedUser}
            >
              Continue as {selectedUser ? demoUsers.find(u => u.id === selectedUser)?.name : 'Selected User'}
            </button>
          </div>

          <div className="login-footer">
            <p className="login-help">
              <strong>Note:</strong> This is demo mode. To enable Google OAuth, add your Google Client ID to the .env file and restart the server.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoLogin;