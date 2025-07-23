import React from 'react';
import { Plus, LogOut, User as UserIcon, AlertCircle, Clock, CheckCircle, Settings } from 'lucide-react';
import logoPath from '../assets/ascendco-logo-new.png';
import type { User } from '../types';
import { currentBacklogStatus } from '../data/mockData';
import './Header.css';

interface HeaderProps {
  onNewRequest: () => void;
  user?: User;
  onLogout?: () => void;
  onAdminClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNewRequest, user, onLogout, onAdminClick }) => {
  const getBacklogStatusIcon = (status: string) => {
    switch (status) {
      case 'clear':
        return <CheckCircle size={16} className="backlog-icon clear" />;
      case 'busy':
        return <Clock size={16} className="backlog-icon busy" />;
      case 'swamped':
        return <AlertCircle size={16} className="backlog-icon swamped" />;
      default:
        return <Clock size={16} className="backlog-icon busy" />;
    }
  };

  const getBacklogStatusText = (status: string) => {
    switch (status) {
      case 'clear':
        return 'Available';
      case 'busy':
        return 'Busy';
      case 'swamped':
        return 'Swamped';
      default:
        return 'Busy';
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <div className="logo">
            <img src={logoPath} alt="Ascendco Health" className="logo-image" />
            <div className="logo-text">
              <h1>AI Progress Dashboard</h1>
              <span className="company-name">Ascendco Health</span>
            </div>
          </div>
        </div>

        <div className="header-right">
          <div className="backlog-status" title={currentBacklogStatus.message}>
            {getBacklogStatusIcon(currentBacklogStatus.status)}
            <span className="backlog-text">
              Backlog: {getBacklogStatusText(currentBacklogStatus.status)}
            </span>
            <span className="backlog-wait-time">
              ({currentBacklogStatus.estimatedWaitTime})
            </span>
          </div>
          
          {user?.isAdmin && onAdminClick && (
            <button 
              onClick={onAdminClick}
              className="admin-console-btn"
            >
              <Settings size={20} />
              Admin Console
            </button>
          )}
          
          <button 
            onClick={onNewRequest}
            className="new-request-btn"
          >
            <Plus size={20} />
            New Request
          </button>
          
          {user && (
            <div className="user-menu">
              <div className="user-info">
                {user.picture ? (
                  <img src={user.picture} alt={user.name} className="user-avatar-small" />
                ) : (
                  <div className="user-avatar-placeholder-small">
                    <UserIcon size={16} />
                  </div>
                )}
                <div className="user-details-header">
                  <span className="user-name">{user.name}</span>
                  <span className="user-email">{user.email}</span>
                </div>
              </div>
              
              {onLogout && (
                <button 
                  onClick={onLogout}
                  className="logout-btn"
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;