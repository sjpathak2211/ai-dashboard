import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Clock, CheckCircle, AlertCircle, TrendingUp, User, Calendar, Activity, Users, Edit2 } from 'lucide-react';
import type { AIRequest, User as UserType, ActivityItem } from '../types';
import { requestsService, activityService, subscriptions } from '../services/supabase';
import EditRequestModal from './EditRequestModal';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

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
        return <Clock size={16} className="text-slate-500" />;
      case 'In Progress':
        return <TrendingUp size={16} className="text-cyan-600" />;
      case 'Testing':
        return <AlertCircle size={16} className="text-amber-600" />;
      case 'Complete':
        return <CheckCircle size={16} className="text-emerald-600" />;
      default:
        return <Clock size={16} />;
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
      <div className="flex flex-col gap-8 p-8 max-w-[1400px] mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <Card className="relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-gradient-to-r before:from-primary-blue before:via-tech-cyan before:to-primary-blue before:bg-[length:200%_100%] before:animate-[gradientShift_3s_ease-in-out_infinite]">
        <div className="flex items-center gap-6">
          {user.picture ? (
            <img
              src={user.picture}
              alt={user.name}
              className="w-20 h-20 rounded-full shadow-[0_8px_24px_rgba(0,188,212,0.2)] border-[3px] border-white/90 transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_32px_rgba(0,188,212,0.3)]"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-blue to-tech-cyan flex items-center justify-center text-white shadow-[0_8px_24px_rgba(0,188,212,0.2)] border-[3px] border-white/90 transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_32px_rgba(0,188,212,0.3)]">
              <User size={24} />
            </div>
          )}
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-br from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2 leading-tight">
              Welcome back, {user.name.split(' ')[0]}!
            </h2>
            <p className="text-slate-500 text-lg font-medium">Here's your AI request dashboard</p>
          </div>
        </div>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Your Requests Section */}
        <Card className="relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-primary-blue/30 before:to-transparent transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:border-tech-cyan/20">
          <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-slate-100 relative after:absolute after:bottom-[-2px] after:left-0 after:w-[60px] after:h-[2px] after:bg-gradient-to-r after:from-primary-blue after:to-tech-cyan after:rounded-[1px]">
            <h3 className="text-2xl font-bold text-slate-800 m-0">Your Requests</h3>
            <Badge variant="outline" className="text-sm font-semibold bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200">
              {userRequests.length} total requests
            </Badge>
          </div>

          <div className="flex flex-col gap-5">
            {userRequests.length > 0 ? (
              userRequests.slice(0, 5).map((request) => (
                <div
                  key={request.id}
                  className="relative p-6 border border-slate-200 rounded-xl transition-all duration-300 bg-gradient-to-br from-white to-slate-50 overflow-hidden before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-gradient-to-br before:from-primary-blue before:to-tech-cyan before:opacity-0 before:transition-opacity before:duration-300 hover:border-tech-cyan hover:translate-x-2 hover:shadow-[0_8px_24px_rgba(0,188,212,0.15)] hover:before:opacity-100"
                >
                  <div className="flex justify-between items-start mb-4 gap-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-slate-800 mb-3 leading-snug">{request.title}</h4>
                      <Badge
                        variant={
                          request.status === 'Complete' ? 'success' :
                          request.status === 'In Progress' ? 'info' :
                          request.status === 'Testing' ? 'warning' :
                          'default'
                        }
                        className="flex items-center gap-2 w-fit text-xs font-bold uppercase tracking-wide border-2"
                      >
                        {getStatusIcon(request.status)}
                        {request.status}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEditRequest(request);
                      }}
                      title="Edit request"
                      className="flex-shrink-0 border border-slate-300 hover:bg-slate-50 hover:text-primary-blue hover:border-primary-blue"
                    >
                      <Edit2 size={16} />
                    </Button>
                  </div>

                  <p className="text-slate-500 text-[0.95rem] leading-relaxed mb-4">{request.description}</p>

                  <div className="flex gap-6 mb-3">
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                      <Calendar size={14} className="text-slate-400" />
                      <span>Submitted: {formatDate(request.submittedAt)}</span>
                    </div>
                    {request.progress !== undefined && request.progress > 0 && (
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                        <TrendingUp size={14} className="text-slate-400" />
                        <span>Progress: {request.progress}%</span>
                      </div>
                    )}
                  </div>

                  {request.adminNotes && (
                    <div className="bg-gradient-to-br from-tech-cyan/8 to-tech-cyan/4 border border-tech-cyan/20 rounded-lg p-4 text-sm text-slate-600 leading-relaxed">
                      <strong className="text-cyan-700 font-semibold">Latest Update:</strong> {request.adminNotes}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-12 min-h-[200px] bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200">
                <AlertCircle size={48} className="text-slate-300 mb-6" />
                <h4 className="text-xl text-slate-600 mb-3 font-semibold">No requests yet</h4>
                <p className="text-slate-500 text-base leading-relaxed">Submit your first AI request to get started!</p>
              </div>
            )}
          </div>
        </Card>

        {/* Progress Section */}
        <Card className="relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-primary-blue/30 before:to-transparent transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:border-tech-cyan/20">
          <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-slate-100 relative after:absolute after:bottom-[-2px] after:left-0 after:w-[60px] after:h-[2px] after:bg-gradient-to-r after:from-primary-blue after:to-tech-cyan after:rounded-[1px]">
            <h3 className="text-2xl font-bold text-slate-800 m-0">Your Request Progress</h3>
            <Badge variant="outline" className="text-sm font-semibold bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200">
              {activeRequests.length} active
            </Badge>
          </div>

          <div className="min-h-[300px]">
            {activeRequests.length > 0 ? (
              <div className="flex flex-col gap-8">
                <Suspense fallback={
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin"></div>
                  </div>
                }>
                  <ProgressChart data={progressData} />
                </Suspense>

                <div className="flex flex-col gap-6">
                  {activeRequests.map((request) => (
                    <div
                      key={request.id}
                      className="p-6 bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,188,212,0.1)] hover:border-tech-cyan/30"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                          <span className="text-base font-semibold text-slate-800">{request.title}</span>
                          <Badge variant="info" className="bg-gradient-to-br from-tech-cyan/10 to-tech-cyan/5 px-3 py-1 rounded-xl">
                            {request.progress}%
                          </Badge>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded overflow-hidden relative">
                          <div
                            className="h-full bg-gradient-to-r from-primary-blue to-tech-cyan rounded transition-all duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)] relative overflow-hidden after:absolute after:top-0 after:left-[-100%] after:w-full after:h-full after:bg-gradient-to-r after:from-transparent after:via-white/60 after:to-transparent after:animate-[shimmer_2s_infinite]"
                            style={{ width: `${request.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center min-h-[300px] bg-gradient-to-br from-red-50/50 to-red-50/20 border-2 border-dashed border-red-300 rounded-2xl text-center relative overflow-hidden before:absolute before:top-[-50%] before:left-[-50%] before:w-[200%] before:h-[200%] before:bg-[radial-gradient(circle,rgba(239,68,68,0.03)_0%,transparent_70%)] before:animate-[pulse_4s_ease-in-out_infinite]">
                <div className="max-w-xs relative z-10">
                  <AlertCircle
                    size={64}
                    className="text-red-500 mx-auto mb-6 opacity-80 animate-[bounce_2s_infinite]"
                  />
                  <h4 className="text-xl font-bold text-red-600 mb-3 leading-snug">
                    You have no active requests right now!
                  </h4>
                  <p className="text-slate-500 text-base leading-relaxed">
                    Once your requests are approved and moved to active status, you'll see their progress here.
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <Card className="relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-primary-blue/30 before:to-transparent transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:border-tech-cyan/20">
        <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-slate-100 relative after:absolute after:bottom-[-2px] after:left-0 after:w-[60px] after:h-[2px] after:bg-gradient-to-r after:from-primary-blue after:to-tech-cyan after:rounded-[1px]">
          <h3 className="text-2xl font-bold text-slate-800 m-0">Recent Activity</h3>
          <Calendar size={20} className="text-slate-500" />
        </div>
        <div className="flex flex-col gap-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="relative flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-white to-slate-50 border border-slate-200 transition-all duration-300 overflow-hidden before:absolute before:top-0 before:left-0 before:w-[3px] before:h-full before:bg-gradient-to-br before:from-primary-blue before:to-tech-cyan before:opacity-0 before:transition-opacity before:duration-300 hover:translate-x-1 hover:shadow-[0_4px_16px_rgba(0,188,212,0.1)] hover:border-tech-cyan/30 hover:before:opacity-100"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-tech-cyan/10 to-tech-cyan/5 rounded-full flex items-center justify-center text-cyan-700 border border-tech-cyan/20">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-slate-800 mb-2 leading-snug">
                  {activity.title}
                </h4>
                <p className="text-sm text-slate-500 leading-relaxed mb-3">
                  {activity.description}
                </p>
                <div className="flex gap-4 text-xs">
                  <span className="text-cyan-700 font-medium">{activity.user}</span>
                  <span className="text-slate-400">{formatTimeAgo(activity.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

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
