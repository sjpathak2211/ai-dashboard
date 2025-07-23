import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  BarChart3,
  TrendingUp,
  User as UserIcon,
  Edit3,
  Save,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { AIRequest, BacklogStatus, ProjectStatus, User, BacklogInfo, Project, Department, Priority } from '../types';
import { requestsService, backlogService, subscriptions, projectsService } from '../services/supabase';
import './AdminConsole.css';

interface AdminConsoleProps {
  user: User;
  onBack: () => void;
}

const AdminConsole: React.FC<AdminConsoleProps> = ({ user, onBack }) => {
  const [requests, setRequests] = useState<AIRequest[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<AIRequest[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<Department | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'All'>('All');
  const [editingRequest, setEditingRequest] = useState<string | null>(null);
  const [editedNotes, setEditedNotes] = useState<{ [key: string]: string }>({});
  const [backlogInfo, setBacklogInfo] = useState<BacklogInfo>({
    status: 'busy',
    message: 'Currently working on several high-priority projects.',
    estimatedWaitTime: '2-3 weeks'
  });
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set());
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingBacklog, setIsSavingBacklog] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allRequests, allProjects, backlogData] = await Promise.all([
          requestsService.getAllRequests(),
          projectsService.getProjects(),
          backlogService.getBacklogStatus()
        ]);
        setRequests(allRequests);
        setProjects(allProjects);
        setBacklogInfo(backlogData);
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Subscribe to real-time updates
    const requestsChannel = subscriptions.subscribeToRequests(() => {
      requestsService.getAllRequests().then(setRequests);
    });

    const projectsChannel = subscriptions.subscribeToProjects(() => {
      projectsService.getProjects().then(setProjects);
    });

    const backlogChannel = subscriptions.subscribeToBacklogStatus(() => {
      backlogService.getBacklogStatus().then(setBacklogInfo);
    });

    return () => {
      subscriptions.unsubscribe(requestsChannel);
      subscriptions.unsubscribe(projectsChannel);
      subscriptions.unsubscribe(backlogChannel);
    };
  }, []);

  // Calculate metrics
  const metrics = {
    totalRequests: requests.length,
    pendingReview: requests.filter(r => r.status === 'Planning').length,
    inProgress: requests.filter(r => r.status === 'In Progress').length,
    completed: requests.filter(r => r.status === 'Complete').length,
    denied: requests.filter(r => r.status === 'Denied').length,
  };

  useEffect(() => {
    // Filter requests based on all filters
    let filtered = requests;
    
    if (searchTerm) {
      filtered = filtered.filter(request => 
        request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (departmentFilter !== 'All') {
      filtered = filtered.filter(request => request.department === departmentFilter);
    }
    
    if (priorityFilter !== 'All') {
      filtered = filtered.filter(request => request.priority === priorityFilter);
    }
    
    if (statusFilter !== 'All') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }
    
    setFilteredRequests(filtered);
  }, [requests, searchTerm, departmentFilter, priorityFilter, statusFilter]);

  useEffect(() => {
    // Filter projects based on search and status
    let filtered = projects;
    
    if (searchTerm) {
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.assignedTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'All') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }
    
    setFilteredProjects(filtered);
  }, [projects, searchTerm, statusFilter]);

  const handleStatusChange = async (requestId: string, newStatus: ProjectStatus) => {
    try {
      await requestsService.updateRequest(requestId, { status: newStatus });
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: newStatus, lastUpdated: new Date() }
          : req
      ));
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleProgressChange = async (requestId: string, newProgress: number) => {
    try {
      await requestsService.updateRequest(requestId, { progress: newProgress });
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, progress: newProgress, lastUpdated: new Date() }
          : req
      ));
    } catch (error) {
      console.error('Failed to update progress:', error);
      alert('Failed to update progress. Please try again.');
    }
  };

  const handleNotesEdit = (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (request) {
      setEditingRequest(requestId);
      setEditedNotes({ ...editedNotes, [requestId]: request.adminNotes || '' });
    }
  };

  const handleNotesSave = async (requestId: string) => {
    try {
      await requestsService.updateRequest(requestId, { adminNotes: editedNotes[requestId] });
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, adminNotes: editedNotes[requestId], lastUpdated: new Date() }
          : req
      ));
      setEditingRequest(null);
    } catch (error) {
      console.error('Failed to save notes:', error);
      alert('Failed to save notes. Please try again.');
    }
  };

  const handleBacklogStatusUpdate = async () => {
    setIsSavingBacklog(true);
    try {
      await backlogService.updateBacklogStatus({
        status: backlogInfo.status,
        message: backlogInfo.message,
        estimatedWaitTime: backlogInfo.estimatedWaitTime
      });
      alert('Backlog status updated successfully!');
    } catch (error) {
      console.error('Failed to update backlog status:', error);
      alert('Failed to update backlog status. Please try again.');
    } finally {
      setIsSavingBacklog(false);
    }
  };

  const toggleRequestExpanded = (requestId: string) => {
    setExpandedRequests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
      } else {
        newSet.add(requestId);
      }
      return newSet;
    });
  };

  const toggleProjectExpanded = (projectId: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const handleConvertToProject = async (request: AIRequest) => {
    try {
      // Create project from request
      await projectsService.createProjectFromRequest(request);
      
      // Update request status to indicate it's been converted
      await requestsService.updateRequest(request.id, { 
        status: 'In Progress',
        adminNotes: `Converted to project on ${new Date().toLocaleDateString()}`
      });
      
      // Refresh data
      const [updatedRequests, updatedProjects] = await Promise.all([
        requestsService.getAllRequests(),
        projectsService.getProjects()
      ]);
      setRequests(updatedRequests);
      setProjects(updatedProjects);
      
      alert('Successfully converted request to project!');
    } catch (error) {
      console.error('Failed to convert request to project:', error);
      alert('Failed to convert request to project. Please try again.');
    }
  };

  const handleProjectStatusChange = async (projectId: string, newStatus: ProjectStatus) => {
    try {
      await projectsService.updateProject(projectId, { status: newStatus });
      setProjects(prev => prev.map(proj => 
        proj.id === projectId 
          ? { ...proj, status: newStatus }
          : proj
      ));
    } catch (error) {
      console.error('Failed to update project status:', error);
      alert('Failed to update project status. Please try again.');
    }
  };

  const handleProjectProgressChange = async (projectId: string, newProgress: number) => {
    try {
      await projectsService.updateProject(projectId, { progress: newProgress });
      setProjects(prev => prev.map(proj => 
        proj.id === projectId 
          ? { ...proj, progress: newProgress }
          : proj
      ));
    } catch (error) {
      console.error('Failed to update project progress:', error);
      alert('Failed to update project progress. Please try again.');
    }
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
      case 'Denied':
        return <XCircle size={16} className="status-icon denied" />;
      case 'On Hold':
        return <Clock size={16} className="status-icon on-hold" />;
      default:
        return <Clock size={16} className="status-icon" />;
    }
  };

  if (isLoading) {
    return (
      <div className="admin-console">
        <div className="loading-state">
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
        <div className="admin-user-info">
          {user.picture ? (
            <img src={user.picture} alt={user.name} className="admin-avatar" />
          ) : (
            <div className="admin-avatar-placeholder">
              <UserIcon size={16} />
            </div>
          )}
          <span>{user.name}</span>
        </div>
      </div>


      {/* Metrics Overview */}
      <div className="admin-metrics">
        <div className="metric-card admin">
          <div className="metric-icon total">
            <BarChart3 size={24} />
          </div>
          <div className="metric-content">
            <h3>{metrics.totalRequests}</h3>
            <p>Total Requests</p>
          </div>
        </div>
        <div className="metric-card admin">
          <div className="metric-icon pending">
            <Clock size={24} />
          </div>
          <div className="metric-content">
            <h3>{metrics.pendingReview}</h3>
            <p>Pending Review</p>
          </div>
        </div>
        <div className="metric-card admin">
          <div className="metric-icon in-progress">
            <TrendingUp size={24} />
          </div>
          <div className="metric-content">
            <h3>{metrics.inProgress}</h3>
            <p>In Progress</p>
          </div>
        </div>
        <div className="metric-card admin">
          <div className="metric-icon complete">
            <CheckCircle size={24} />
          </div>
          <div className="metric-content">
            <h3>{metrics.completed}</h3>
            <p>Completed</p>
          </div>
        </div>
        <div className="metric-card admin">
          <div className="metric-icon denied">
            <XCircle size={24} />
          </div>
          <div className="metric-content">
            <h3>{metrics.denied}</h3>
            <p>Denied</p>
          </div>
        </div>
      </div>

      {/* Backlog Status Management */}
      <div className="backlog-management">
        <h2>Backlog Status Management</h2>
        <div className="backlog-controls">
          <div className="backlog-field">
            <label>Current Status</label>
            <select 
              value={backlogInfo.status} 
              onChange={(e) => setBacklogInfo(prev => ({ ...prev, status: e.target.value as BacklogStatus }))}
              className="backlog-select"
            >
              <option value="clear">Clear - Available for new requests</option>
              <option value="busy">Busy - Working on several projects</option>
              <option value="swamped">Swamped - At capacity</option>
            </select>
          </div>
          <div className="backlog-field">
            <label>Status Message</label>
            <textarea
              value={backlogInfo.message}
              onChange={(e) => setBacklogInfo(prev => ({ ...prev, message: e.target.value }))}
              className="backlog-textarea"
              rows={2}
            />
          </div>
          <div className="backlog-field">
            <label>Estimated Wait Time</label>
            <input
              type="text"
              value={backlogInfo.estimatedWaitTime}
              onChange={(e) => setBacklogInfo(prev => ({ ...prev, estimatedWaitTime: e.target.value }))}
              className="backlog-input"
              placeholder="e.g., 1-2 weeks"
            />
          </div>
          <button onClick={handleBacklogStatusUpdate} className="update-backlog-btn" disabled={isSavingBacklog}>
            <Save size={16} />
            {isSavingBacklog ? 'Updating...' : 'Update Backlog Status'}
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="admin-filters-section">
        <h2>Filters</h2>
        <div className="admin-filters">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label>Department</label>
            <select 
              value={departmentFilter} 
              onChange={(e) => setDepartmentFilter(e.target.value as Department | 'All')}
            >
              <option value="All">All Departments</option>
              <option value="Clinical Operations">Clinical Operations</option>
              <option value="IT">IT</option>
              <option value="Research">Research</option>
              <option value="Quality Assurance">Quality Assurance</option>
              <option value="Administration">Administration</option>
              <option value="Finance">Finance</option>
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
      {/* Request Management */}
      <div className="request-management">

        {/* Request List */}
        <div className="request-list">
          {filteredRequests.map(request => (
            <div key={request.id} className={`request-item ${expandedRequests.has(request.id) ? 'expanded' : ''}`}>
              <div className="request-header" onClick={() => toggleRequestExpanded(request.id)}>
                <div className="request-info">
                  {getStatusIcon(request.status)}
                  <div>
                    <h3>{request.title}</h3>
                    <p className="request-meta">
                      {request.userName} • {request.department} • {new Date(request.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button className="expand-btn">
                  {expandedRequests.has(request.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>

              {expandedRequests.has(request.id) && (
                <div className="request-details">
                  <div className="detail-section">
                    <h4>Description</h4>
                    <p>{request.description}</p>
                  </div>

                  <div className="detail-section">
                    <h4>Impact</h4>
                    <p>{request.estimatedImpact}</p>
                  </div>

                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Priority</label>
                      <span className={`priority-badge ${request.priority.toLowerCase()}`}>
                        {request.priority}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Contact</label>
                      <span>{request.contactInfo}</span>
                    </div>
                    <div className="detail-item">
                      <label>Last Updated</label>
                      <span>{request.lastUpdated ? new Date(request.lastUpdated).toLocaleDateString() : 'Never'}</span>
                    </div>
                  </div>

                  <div className="admin-controls">
                    <div className="control-group">
                      <label>Status</label>
                      <select 
                        value={request.status} 
                        onChange={(e) => handleStatusChange(request.id, e.target.value as ProjectStatus)}
                        className="status-select"
                      >
                        <option value="Planning">Planning</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Testing">Testing</option>
                        <option value="Complete">Complete</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Denied">Denied</option>
                      </select>
                    </div>

                    <div className="control-group">
                      <label>Progress</label>
                      <div className="progress-control">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={request.progress || 0}
                          onChange={(e) => handleProgressChange(request.id, parseInt(e.target.value))}
                          className="progress-slider"
                        />
                        <span className="progress-value">{request.progress || 0}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="admin-notes">
                    <div className="notes-header">
                      <h4>Admin Notes</h4>
                      {editingRequest !== request.id && (
                        <button onClick={() => handleNotesEdit(request.id)} className="edit-notes-btn">
                          <Edit3 size={16} />
                          Edit
                        </button>
                      )}
                    </div>
                    {editingRequest === request.id ? (
                      <div className="notes-editor">
                        <textarea
                          value={editedNotes[request.id] || ''}
                          onChange={(e) => setEditedNotes({ ...editedNotes, [request.id]: e.target.value })}
                          placeholder="Add notes about this request..."
                          rows={3}
                        />
                        <div className="notes-actions">
                          <button onClick={() => handleNotesSave(request.id)} className="save-notes-btn">
                            <Save size={16} />
                            Save
                          </button>
                          <button onClick={() => setEditingRequest(null)} className="cancel-notes-btn">
                            <X size={16} />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="notes-content">
                        {request.adminNotes || 'No notes added yet.'}
                      </p>
                    )}
                  </div>

                  <div className="quick-actions">
                    <button 
                      onClick={() => handleStatusChange(request.id, 'In Progress')}
                      className="action-btn approve"
                      disabled={request.status === 'In Progress'}
                    >
                      Approve & Start
                    </button>
                    <button 
                      onClick={() => handleStatusChange(request.id, 'On Hold')}
                      className="action-btn defer"
                      disabled={request.status === 'On Hold'}
                    >
                      Defer
                    </button>
                    <button 
                      onClick={() => handleStatusChange(request.id, 'Denied')}
                      className="action-btn deny"
                      disabled={request.status === 'Denied'}
                    >
                      Deny
                    </button>
                    {(request.status === 'In Progress' || request.status === 'Planning') && (
                      <button 
                        onClick={() => handleConvertToProject(request)}
                        className="action-btn convert"
                        title="Convert this approved request to a showcase project"
                      >
                        <Rocket size={16} />
                        Convert to Project
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminConsole;