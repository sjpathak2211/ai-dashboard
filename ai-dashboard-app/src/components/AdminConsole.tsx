import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  BarChart3,
  TrendingUp,
  User as UserIcon,
  Save,
  Calendar,
  MessageSquare,
  Rocket,
  Activity
} from 'lucide-react';
import type { AIRequest, BacklogStatus, ProjectStatus, User, BacklogInfo, Department, Priority, ActivityItem } from '../types';
import { requestsService, backlogService, subscriptions, projectsService, activityService } from '../services/supabase';
import './AdminConsole.css';

interface AdminConsoleProps {
  user: User;
  onBack: () => void;
}

const AdminConsole: React.FC<AdminConsoleProps> = ({ onBack }) => {
  const [requests, setRequests] = useState<AIRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<AIRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<Department | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'All'>('All');
  const [editedNotes, setEditedNotes] = useState<{ [key: string]: string }>({});
  const [requestUpdates, setRequestUpdates] = useState<{ [key: string]: Array<{ text: string; timestamp: Date }> }>({});
  const [newUpdate, setNewUpdate] = useState<{ [key: string]: string }>({});
  const [backlogInfo, setBacklogInfo] = useState<BacklogInfo>({
    status: 'busy',
    message: 'Currently working on several high-priority projects.',
    estimatedWaitTime: '2-3 weeks'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingBacklog, setIsSavingBacklog] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [requestsData, backlogData, activitiesData] = await Promise.all([
          requestsService.getAllRequests(),
          backlogService.getBacklogStatus(),
          activityService.getRecentActivities(20) // Get last 20 activities
        ]);
        
        setRequests(requestsData);
        setFilteredRequests(requestsData);
        setBacklogInfo(backlogData);
        setRecentActivities(activitiesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscriptions
    const requestsChannel = subscriptions.subscribeToRequests(() => {
      requestsService.getAllRequests().then(setRequests);
    });

    const backlogChannel = subscriptions.subscribeToBacklogStatus(() => {
      backlogService.getBacklogStatus().then(setBacklogInfo);
    });

    const activityChannel = subscriptions.subscribeToActivities(() => {
      activityService.getRecentActivities(20).then(setRecentActivities);
    });

    return () => {
      if (requestsChannel) subscriptions.unsubscribe(requestsChannel);
      if (backlogChannel) subscriptions.unsubscribe(backlogChannel);
      if (activityChannel) subscriptions.unsubscribe(activityChannel);
    };
  }, []);

  // Filter requests when filters change
  useEffect(() => {
    let filtered = requests;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(request => 
        request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.userName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply department filter
    if (departmentFilter !== 'All') {
      filtered = filtered.filter(request => request.department === departmentFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'All') {
      filtered = filtered.filter(request => request.priority === priorityFilter);
    }

    // Apply status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    setFilteredRequests(filtered);
  }, [searchTerm, departmentFilter, priorityFilter, statusFilter, requests]);

  const handleStatusChange = async (requestId: string, newStatus: ProjectStatus) => {
    try {
      await requestsService.updateRequest(requestId, { status: newStatus });
      
      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: newStatus } : req
      ));
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleProgressChange = async (requestId: string, newProgress: number) => {
    try {
      await requestsService.updateRequest(requestId, { progress: newProgress });
      
      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, progress: newProgress } : req
      ));
    } catch (error) {
      console.error('Failed to update progress:', error);
      alert('Failed to update progress. Please try again.');
    }
  };


  const handleNotesSave = async (requestId: string, notes?: string) => {
    const notesToSave = notes !== undefined ? notes : editedNotes[requestId];
    
    try {
      await requestsService.updateRequest(requestId, { adminNotes: notesToSave });
      
      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, adminNotes: notesToSave } : req
      ));
    } catch (error) {
      console.error('Failed to save notes:', error);
      alert('Failed to save notes. Please try again.');
    }
  };

  const handleBacklogStatusUpdate = async () => {
    setIsSavingBacklog(true);
    try {
      await backlogService.updateBacklogStatus(backlogInfo);
      alert('Backlog status updated successfully!');
    } catch (error) {
      console.error('Failed to update backlog status:', error);
      alert('Failed to update backlog status. Please try again.');
    } finally {
      setIsSavingBacklog(false);
    }
  };

  const handleConvertToProject = async (request: AIRequest) => {
    try {
      // Create project from request
      await projectsService.createProjectFromRequest(request);
      
      // Update request status to indicate it's been converted
      await requestsService.updateRequest(request.id, { 
        status: 'In Progress' as ProjectStatus,
        adminNotes: `${request.adminNotes || ''}\n\n[Converted to project on ${new Date().toLocaleDateString()}]`
      });
      
      // Update local state
      const updatedRequests = requests.map(r => 
        r.id === request.id 
          ? { 
              ...r, 
              status: 'In Progress' as ProjectStatus,
              adminNotes: `${r.adminNotes || ''}\n\n[Converted to project on ${new Date().toLocaleDateString()}]`
            }
          : r
      );
      setRequests(updatedRequests);
      
      alert('Successfully converted request to project!');
    } catch (error) {
      console.error('Failed to convert request to project:', error);
      alert('Failed to convert request to project. Please try again.');
    }
  };

  const handleRequestClick = (requestId: string) => {
    setExpandedCard(expandedCard === requestId ? null : requestId);
  };

  const handleAddUpdate = (requestId: string, text: string) => {
    const updates = requestUpdates[requestId] || [];
    setRequestUpdates({
      ...requestUpdates,
      [requestId]: [...updates, { text, timestamp: new Date() }]
    });
  };

  const getStatusIcon = (status: ProjectStatus) => {
    switch (status) {
      case 'Planning':
        return <Clock size={16} className="status-icon planning" />;
      case 'In Progress':
        return <TrendingUp size={16} className="status-icon in-progress" />;
      case 'Testing':
        return <AlertCircle size={16} className="status-icon testing" />;
      case 'Complete':
        return <CheckCircle size={16} className="status-icon complete" />;
      case 'On Hold':
        return <XCircle size={16} className="status-icon on-hold" />;
      case 'Denied':
        return <XCircle size={16} className="status-icon denied" />;
      default:
        return <Clock size={16} className="status-icon" />;
    }
  };

  const getBacklogStatusColor = (status: BacklogStatus) => {
    switch (status) {
      case 'clear': return '#22C55E';
      case 'busy': return '#F59E0B';
      case 'swamped': return '#EF4444';
      default: return '#6B7280';
    }
  };

  if (isLoading) {
    return (
      <div className="admin-console">
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Loading admin console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-console">
      <div className="admin-header">
        <button onClick={onBack} className="back-button">
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <h1>Admin Console</h1>
      </div>

      {/* Admin Metrics */}
      <div className="admin-metrics">
        <div className="metric-card">
          <div className="metric-icon total">
            <BarChart3 size={24} />
          </div>
          <div className="metric-content">
            <h3>{requests.length}</h3>
            <p>Total Requests</p>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon pending">
            <Clock size={24} />
          </div>
          <div className="metric-content">
            <h3>{requests.filter(r => r.status === 'Planning').length}</h3>
            <p>Pending Review</p>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon in-progress">
            <TrendingUp size={24} />
          </div>
          <div className="metric-content">
            <h3>{requests.filter(r => r.status === 'In Progress').length}</h3>
            <p>In Progress</p>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon complete">
            <CheckCircle size={24} />
          </div>
          <div className="metric-content">
            <h3>{requests.filter(r => r.status === 'Complete').length}</h3>
            <p>Completed</p>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon denied">
            <XCircle size={24} />
          </div>
          <div className="metric-content">
            <h3>{requests.filter(r => r.status === 'Denied').length}</h3>
            <p>Denied</p>
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="recent-activity-section">
        <div className="section-header">
          <div className="header-left">
            <Activity size={20} />
            <h2>Recent Activity</h2>
            <span className="activity-count">({recentActivities.length} activities)</span>
          </div>
        </div>
        
        <div className="activity-feed">
          {recentActivities.length > 0 ? (
            recentActivities.slice(0, 10).map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  {activity.type === 'request_submitted' && <Rocket size={16} />}
                  {activity.type === 'status_changed' && <CheckCircle size={16} />}
                  {activity.type === 'request_updated' && <Save size={16} />}
                  {(activity.type === 'project_created' || activity.type === 'project_converted') && <BarChart3 size={16} />}
                  {(!['request_submitted', 'status_changed', 'request_updated', 'project_created', 'project_converted'].includes(activity.type)) && <Activity size={16} />}
                </div>
                <div className="activity-content">
                  <div className="activity-header">
                    <span className="activity-title">{activity.title}</span>
                    <span className="activity-time">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="activity-description">{activity.description}</p>
                  {activity.user && (
                    <span className="activity-user">
                      <UserIcon size={12} />
                      {activity.user}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="no-activities">No recent activities</p>
          )}
        </div>
        
        {recentActivities.length > 10 && (
          <div className="show-more">
            <button className="show-more-button">Show all activities</button>
          </div>
        )}
      </div>

      {/* Backlog Status Management */}
      <div className="backlog-management">
        <h2>Backlog Status</h2>
        <div className="backlog-controls">
          <div className="control-group">
            <label>Current Status</label>
            <select 
              value={backlogInfo.status} 
              onChange={(e) => setBacklogInfo(prev => ({ ...prev, status: e.target.value as BacklogStatus }))}
              style={{ borderColor: getBacklogStatusColor(backlogInfo.status) }}
            >
              <option value="clear">Clear - Ready for new requests</option>
              <option value="busy">Busy - Limited availability</option>
              <option value="swamped">Swamped - High wait times</option>
            </select>
          </div>
          
          <div className="control-group">
            <label>Status Message</label>
            <textarea
              value={backlogInfo.message}
              onChange={(e) => setBacklogInfo(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Describe current workload..."
              rows={2}
            />
          </div>
          
          <div className="control-group">
            <label>Estimated Wait Time</label>
            <input
              type="text"
              value={backlogInfo.estimatedWaitTime}
              onChange={(e) => setBacklogInfo(prev => ({ ...prev, estimatedWaitTime: e.target.value }))}
              placeholder="e.g., 2-3 weeks"
            />
          </div>
          
          <button 
            onClick={handleBacklogStatusUpdate}
            disabled={isSavingBacklog}
            className="update-backlog-btn"
          >
            {isSavingBacklog ? (
              <>
                <div className="spinner-small" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Update Status
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <div className="filter-group">
            <label>Department</label>
            <select 
              value={departmentFilter} 
              onChange={(e) => setDepartmentFilter(e.target.value as Department | 'All')}
            >
              <option value="All">All Departments</option>
              <option value="Patient Care">Patient Care</option>
              <option value="Medical Records">Medical Records</option>
              <option value="Billing">Billing</option>
              <option value="Clinical Research">Clinical Research</option>
              <option value="Operations">Operations</option>
              <option value="IT Systems">IT Systems</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Priority</label>
            <select 
              value={priorityFilter} 
              onChange={(e) => setPriorityFilter(e.target.value as Priority | 'All')}
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Status</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'All')}
            >
              <option value="All">All Status</option>
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="Testing">Testing</option>
              <option value="Complete">Complete</option>
              <option value="On Hold">On Hold</option>
              <option value="Denied">Denied</option>
            </select>
          </div>
        </div>
      </div>

      {/* Request Management */}
      <div className="request-management">
        {/* Request Cards */}
        <div className="request-cards-grid">
          {filteredRequests.map(request => {
            const isExpanded = expandedCard === request.id;
            
            return (
              <motion.div 
                key={request.id} 
                className={`request-card ${isExpanded ? 'expanded' : ''}`}
                layout
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <div 
                  className="card-preview"
                  onClick={() => handleRequestClick(request.id)}
                >
                  <div className="card-header">
                    <div className="card-badges">
                      {getStatusIcon(request.status)}
                      <span className="department-badge">{request.department}</span>
                    </div>
                    <span className={`priority-badge ${request.priority.toLowerCase()}`}>
                      {request.priority}
                    </span>
                  </div>
                  
                  <h3 className="card-title">{request.title}</h3>
                  
                  <p className="card-description">{request.description}</p>
                  
                  <div className="card-metadata">
                    <div className="metadata-row">
                      <UserIcon size={14} />
                      <span>{request.userName.split(' ')[0]}</span>
                    </div>
                    <div className="metadata-row">
                      <Calendar size={14} />
                      <span>{new Date(request.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="card-footer">
                    <div className="progress-indicator">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${request.progress || 0}%` }}
                        />
                      </div>
                      <span className="progress-text">{request.progress || 0}%</span>
                    </div>
                    
                    {requestUpdates[request.id] && requestUpdates[request.id].length > 0 && (
                      <div className="update-indicator">
                        <MessageSquare size={14} />
                        <span>{requestUpdates[request.id].length}</span>
                      </div>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <motion.div 
                    className="card-expanded-content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="expanded-section">
                      <h4>Full Description</h4>
                      <p>{request.description}</p>
                    </div>

                    <div className="expanded-section">
                      <h4>Estimated Impact</h4>
                      <p>{request.estimatedImpact}</p>
                    </div>

                    <div className="expanded-section">
                      <h4>Contact Information</h4>
                      <p>{request.contactInfo}</p>
                    </div>

                    <div className="admin-controls-section">
                      <h4>Admin Controls</h4>
                      <div className="controls-grid">
                        <div className="control-item">
                          <label>Status</label>
                          <select 
                            value={request.status} 
                            onChange={(e) => handleStatusChange(request.id, e.target.value as ProjectStatus)}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="Planning">Planning</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Testing">Testing</option>
                            <option value="Complete">Complete</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Denied">Denied</option>
                          </select>
                        </div>

                        <div className="control-item">
                          <label>Progress</label>
                          <div className="progress-control">
                            <div className="progress-bar-wrapper">
                              <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={request.progress} 
                                onChange={(e) => handleProgressChange(request.id, parseInt(e.target.value))}
                                onClick={(e) => e.stopPropagation()}
                                className="progress-slider"
                              />
                              <div className="progress-track-fill" style={{ width: `${request.progress}%` }} />
                            </div>
                            <div className="progress-value">
                              {request.progress}%
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="notes-section">
                        <label>Admin Notes</label>
                        <textarea
                          value={editedNotes[request.id] || request.adminNotes || ''}
                          onChange={(e) => setEditedNotes({ ...editedNotes, [request.id]: e.target.value })}
                          onBlur={() => handleNotesSave(request.id, editedNotes[request.id])}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Add internal notes..."
                          rows={3}
                        />
                      </div>

                      {request.status === 'Planning' && (
                        <button 
                          className="convert-project-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConvertToProject(request);
                          }}
                        >
                          <Rocket size={16} />
                          Convert to Active Project
                        </button>
                      )}
                    </div>

                    <div className="updates-section">
                      <h4>Update Timeline</h4>
                      <div className="update-form">
                        <input
                          type="text"
                          value={newUpdate[request.id] || ''}
                          onChange={(e) => setNewUpdate({ ...newUpdate, [request.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newUpdate[request.id]?.trim()) {
                              handleAddUpdate(request.id, newUpdate[request.id].trim());
                              setNewUpdate({ ...newUpdate, [request.id]: '' });
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Add an update..."
                        />
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (newUpdate[request.id]?.trim()) {
                              handleAddUpdate(request.id, newUpdate[request.id].trim());
                              setNewUpdate({ ...newUpdate, [request.id]: '' });
                            }
                          }}
                        >
                          Add
                        </button>
                      </div>
                      
                      <div className="updates-list">
                        {requestUpdates[request.id]?.map((update, index) => (
                          <div key={index} className="update-item">
                            <MessageSquare size={14} />
                            <div>
                              <p>{update.text}</p>
                              <span className="update-time">
                                {new Date(update.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )) || <p className="no-updates">No updates yet</p>}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default AdminConsole;