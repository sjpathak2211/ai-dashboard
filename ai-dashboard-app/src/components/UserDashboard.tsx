import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Clock, CheckCircle, AlertCircle, TrendingUp, User, Calendar, Activity, Users, Edit2 } from 'lucide-react';
import type { AIRequest, User as UserType, ActivityItem } from '../types';
import { requestsService, activityService, subscriptions } from '../services/supabase';
import EditRequestModal from './EditRequestModal';
import './UserDashboard.css';

// Lazy load the chart component
const ProgressChart = lazy(() => import('./ProgressChart'));

interface UserDashboardProps {
  user: UserType;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user }) => {
  const [userRequests, setUserRequests] = useState<AIRequest[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRequest, setEditingRequest] = useState<AIRequest | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    // Fetch user requests
    const fetchData = async () => {
      try {
        // Fetch both in parallel for better performance
        const [requests, allActivities] = await Promise.all([
          requestsService.getUserRequests(user.id),
          activityService.getRecentActivities(10) // Get ALL recent activities, not just user's
        ]);
        
        setUserRequests(requests);
        setActivities(allActivities);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Subscribe to real-time updates
    const requestsChannel = subscriptions.subscribeToRequests((payload) => {
      if (payload.new?.user_id === user.id || payload.old?.user_id === user.id) {
        fetchData();
      }
    });

    const activitiesChannel = subscriptions.subscribeToActivities(() => {
      // Update with ALL recent activities, not just user's
      activityService.getRecentActivities(10).then(setActivities);
    });

    return () => {
      subscriptions.unsubscribe(requestsChannel);
      subscriptions.unsubscribe(activitiesChannel);
    };
  }, [user.id]);

  const activeRequests = userRequests.filter(req => 
    req.status === 'In Progress' || req.status === 'Testing'
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Planning':
        return <Clock size={16} className="status-icon planning" />;
      case 'In Progress':
        return <TrendingUp size={16} className="status-icon in-progress" />;
      case 'Testing':
        return <AlertCircle size={16} className="status-icon testing" />;
      case 'Complete':
        return <CheckCircle size={16} className="status-icon complete" />;
      default:
        return <Clock size={16} className="status-icon" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project_created': return <Users size={16} />;
      case 'project_updated': return <Activity size={16} />;
      case 'request_submitted': return <Clock size={16} />;
      case 'request_updated': return <TrendingUp size={16} />;
      case 'project_completed': return <CheckCircle size={16} />;
      default: return <Activity size={16} />;
    }
  };

  // Generate progress data for active requests
  const generateProgressData = (requests: AIRequest[]) => {
    if (requests.length === 0) return [];
    
    return requests.map(request => ({
      name: request.title.substring(0, 20) + (request.title.length > 20 ? '...' : ''),
      progress: request.progress || 0,
      id: request.id
    }));
  };

  const progressData = generateProgressData(activeRequests);

  const handleEditRequest = (request: AIRequest) => {
    console.log('Edit button clicked for request:', request);
    setEditingRequest(request);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditingRequest(null);
    setIsEditModalOpen(false);
  };

  const handleRequestUpdate = () => {
    // Refresh data after update
    const fetchData = async () => {
      try {
        const requests = await requestsService.getUserRequests(user.id);
        setUserRequests(requests);
      } catch (error) {
        console.error('Failed to refresh requests:', error);
      }
    };
    fetchData();
  };

  if (isLoading) {
    return (
      <div className="user-dashboard">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      <div className="user-dashboard-header">
        <div className="user-info">
          {user.picture ? (
            <img src={user.picture} alt={user.name} className="user-avatar" />
          ) : (
            <div className="user-avatar-placeholder">
              <User size={24} />
            </div>
          )}
          <div className="user-details">
            <h2>Welcome back, {user.name.split(' ')[0]}!</h2>
            <p>Here's your AI request dashboard</p>
          </div>
        </div>
      </div>

      <div className="user-dashboard-content">
        <div className="user-dashboard-section">
          <div className="section-header">
            <h3>Your Requests</h3>
            <span className="request-count">{userRequests.length} total requests</span>
          </div>
          
          <div className="requests-list">
            {userRequests.length > 0 ? (
              userRequests.slice(0, 5).map((request) => (
                <div key={request.id} className="request-item">
                  <div className="request-item-header">
                    <div className="request-title-section">
                      <h4>{request.title}</h4>
                      <div className={`request-status ${request.status.toLowerCase().replace(' ', '-')}`}>
                        {getStatusIcon(request.status)}
                        {request.status}
                      </div>
                    </div>
                    <button 
                      className="edit-request-button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Button clicked!');
                        alert('Edit button clicked for: ' + request.title);
                        handleEditRequest(request);
                      }}
                      title="Edit request"
                      type="button"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                  
                  <p className="request-description">{request.description}</p>
                  
                  <div className="request-meta">
                    <div className="meta-item">
                      <Calendar size={14} />
                      <span>Submitted: {formatDate(request.submittedAt)}</span>
                    </div>
                    {request.progress !== undefined && request.progress > 0 && (
                      <div className="meta-item">
                        <TrendingUp size={14} />
                        <span>Progress: {request.progress}%</span>
                      </div>
                    )}
                  </div>
                  
                  {request.adminNotes && (
                    <div className="admin-notes">
                      <strong>Latest Update:</strong> {request.adminNotes}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="empty-state">
                <AlertCircle size={48} className="empty-state-icon" />
                <h4>No requests yet</h4>
                <p>Submit your first AI request to get started!</p>
              </div>
            )}
          </div>
        </div>

        <div className="user-dashboard-section">
          <div className="section-header">
            <h3>Your Request Progress</h3>
            <span className="active-count">{activeRequests.length} active</span>
          </div>
          
          <div className="progress-section">
            {activeRequests.length > 0 ? (
              <div className="progress-chart-container">
                <Suspense fallback={
                  <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="loading-spinner"></div>
                  </div>
                }>
                  <ProgressChart data={progressData} />
                </Suspense>
                
                <div className="active-requests-details">
                  {activeRequests.map((request) => (
                    <div key={request.id} className="active-request-detail">
                      <div className="request-progress-bar">
                        <div className="progress-info">
                          <span className="request-name">{request.title}</span>
                          <span className="progress-percentage">{request.progress}%</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${request.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="no-active-requests">
                <div className="no-active-content">
                  <AlertCircle size={64} className="no-active-icon" />
                  <h4>You have no active requests right now!</h4>
                  <p>Once your requests are approved and moved to active status, you'll see their progress here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="recent-activity-section">
        <div className="section-header">
          <h3>Recent Activity</h3>
          <Calendar size={20} className="activity-header-icon" />
        </div>
        <div className="activity-list">
          {activities.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-item-icon">
                {getActivityIcon(activity.type)}
              </div>
              <div className="activity-item-content">
                <h4>{activity.title}</h4>
                <p>{activity.description}</p>
                <div className="activity-meta">
                  <span className="activity-user">{activity.user}</span>
                  <span className="activity-time">{formatTimeAgo(activity.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <EditRequestModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        request={editingRequest}
        onUpdate={handleRequestUpdate}
      />
    </div>
  );
};

export default UserDashboard;