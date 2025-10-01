import React from 'react';
import { Plus, LogOut, User as UserIcon, AlertCircle, Clock, CheckCircle, Settings } from 'lucide-react';
import logoPath from '../assets/ascendco-logo-new.png';
import type { User } from '../types';
import { currentBacklogStatus } from '../data/mockData';
import { cn } from '../lib/utils';

interface HeaderProps {
  onNewRequest: () => void;
  user?: User;
  onLogout?: () => void;
  onAdminClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNewRequest, user, onLogout, onAdminClick }) => {
  const getBacklogStatusIcon = (status: string) => {
    const iconClasses = "flex-shrink-0";
    switch (status) {
      case 'clear':
        return <CheckCircle size={16} className={cn(iconClasses, "text-[#00d084]")} />;
      case 'busy':
        return <Clock size={16} className={cn(iconClasses, "text-[#fcb900]")} />;
      case 'swamped':
        return <AlertCircle size={16} className={cn(iconClasses, "text-error")} />;
      default:
        return <Clock size={16} className={cn(iconClasses, "text-[#fcb900]")} />;
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
    <header className="sticky top-0 z-[100] bg-clinical-white/95 backdrop-blur-xl border-b border-clinical-border shadow-sm transition-all duration-300 before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-accent-cyan-500 before:to-transparent before:opacity-50">
      <div className="max-w-[1600px] mx-auto px-8 py-4 flex justify-between items-center gap-8">
        {/* Left: Logo */}
        <div className="flex items-center">
          <div className="flex items-center gap-4">
            <img
              src={logoPath}
              alt="Ascendco Health"
              className="w-10 h-10 rounded-lg shadow-xs transition-transform duration-300 hover:scale-105"
            />
            <div>
              <h1 className="text-2xl font-bold text-neutral-800 m-0">AI Progress Dashboard</h1>
              <span className="text-sm text-neutral-500 font-medium">Ascendco Health</span>
            </div>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center justify-end gap-4">
          {/* Backlog Status */}
          <div
            className="flex items-center gap-2 px-4 py-3 bg-clinical-white/90 rounded-xl border border-clinical-border backdrop-blur-sm shadow-sm transition-all duration-300 cursor-help hover:-translate-y-0.5 hover:shadow-md"
            title={currentBacklogStatus.message}
          >
            {getBacklogStatusIcon(currentBacklogStatus.status)}
            <span className="text-sm font-semibold text-neutral-700 max-lg:hidden">
              Backlog: {getBacklogStatusText(currentBacklogStatus.status)}
            </span>
            <span className="text-xs text-neutral-500 font-medium max-lg:hidden">
              ({currentBacklogStatus.estimatedWaitTime})
            </span>
          </div>

          {/* Admin Console Button */}
          {user?.isAdmin && onAdminClick && (
            <button
              onClick={onAdminClick}
              className="relative overflow-hidden flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-semibold text-base shadow-md transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg whitespace-nowrap before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-all before:duration-500 hover:before:left-full"
            >
              <Settings size={20} />
              Admin Console
            </button>
          )}

          {/* New Request Button */}
          <button
            onClick={onNewRequest}
            className="relative overflow-hidden flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-accent-cyan-500 to-accent-cyan-600 text-white rounded-xl font-semibold text-base shadow-md transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg whitespace-nowrap max-md:flex-1 max-md:justify-center before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-all before:duration-500 hover:before:left-full"
          >
            <Plus size={20} />
            New Request
          </button>

          {/* User Menu */}
          {user && (
            <div className="flex items-center gap-4 px-2 py-2 bg-clinical-white/10 rounded-xl border border-clinical-border backdrop-blur-sm max-md:flex-shrink-0">
              <div className="flex items-center gap-3">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border-2 border-clinical-white shadow-xs"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center text-white shadow-xs">
                    <UserIcon size={16} />
                  </div>
                )}
                <div className="flex flex-col items-start max-md:hidden">
                  <span className="text-sm font-semibold text-neutral-800 leading-tight">{user.name}</span>
                  <span className="text-xs text-neutral-500 leading-tight">{user.email}</span>
                </div>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="bg-transparent border border-neutral-300 text-neutral-600 p-2 rounded-lg transition-all duration-200 flex items-center justify-center hover:bg-error hover:border-error hover:text-white hover:-translate-y-0.5"
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
