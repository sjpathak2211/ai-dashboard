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
  Rocket
} from 'lucide-react';
import type { AIRequest, BacklogStatus, ProjectStatus, User, BacklogInfo, Department, Priority } from '../types';
import { requestsService, backlogService, subscriptions, projectsService } from '../services/supabase';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Spinner } from './ui/Spinner';

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

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [requestsData, backlogData] = await Promise.all([
          requestsService.getAllRequests(),
          backlogService.getBacklogStatus()
        ]);

        setRequests(requestsData);
        setFilteredRequests(requestsData);
        setBacklogInfo(backlogData);
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


    return () => {
      if (requestsChannel) subscriptions.unsubscribe(requestsChannel);
      if (backlogChannel) subscriptions.unsubscribe(backlogChannel);
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
    const iconClass = "w-4 h-4";
    switch (status) {
      case 'Planning':
        return <Clock size={16} className={`${iconClass} text-warning`} />;
      case 'In Progress':
        return <TrendingUp size={16} className={`${iconClass} text-accent-teal`} />;
      case 'Testing':
        return <AlertCircle size={16} className={`${iconClass} text-purple-500`} />;
      case 'Complete':
        return <CheckCircle size={16} className={`${iconClass} text-success`} />;
      case 'On Hold':
        return <XCircle size={16} className={`${iconClass} text-gray-400`} />;
      case 'Denied':
        return <XCircle size={16} className={`${iconClass} text-error`} />;
      default:
        return <Clock size={16} className={`${iconClass} text-gray-500`} />;
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
      <div className="min-h-screen bg-gray-50">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Spinner size="lg" />
          <p className="text-gray-600">Loading admin console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-8 py-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2 transition-transform hover:-translate-x-0.5"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">Admin Console</h1>
        </div>
      </div>

      {/* Admin Metrics */}
      <div className="max-w-7xl mx-auto px-8 mt-6">
        <div className="grid grid-cols-5 gap-4">
          <Card className="flex items-center gap-4 p-5 transition-transform hover:-translate-y-0.5 hover:shadow-lg">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-blue to-accent-teal flex items-center justify-center text-white">
              <BarChart3 size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{requests.length}</h3>
              <p className="text-sm text-gray-600">Total Requests</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-5 transition-transform hover:-translate-y-0.5 hover:shadow-lg">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-warning to-yellow-400 flex items-center justify-center text-white">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{requests.filter(r => r.status === 'Planning').length}</h3>
              <p className="text-sm text-gray-600">Pending Review</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-5 transition-transform hover:-translate-y-0.5 hover:shadow-lg">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent-teal to-cyan-500 flex items-center justify-center text-white">
              <TrendingUp size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{requests.filter(r => r.status === 'In Progress').length}</h3>
              <p className="text-sm text-gray-600">In Progress</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-5 transition-transform hover:-translate-y-0.5 hover:shadow-lg">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-success to-green-400 flex items-center justify-center text-white">
              <CheckCircle size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{requests.filter(r => r.status === 'Complete').length}</h3>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-5 transition-transform hover:-translate-y-0.5 hover:shadow-lg">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-error to-red-400 flex items-center justify-center text-white">
              <XCircle size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{requests.filter(r => r.status === 'Denied').length}</h3>
              <p className="text-sm text-gray-600">Denied</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Backlog Status Management */}
      <div className="max-w-7xl mx-auto px-8 mt-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Backlog Status</h2>
        <Card className="p-8">
          <div className="grid grid-cols-3 gap-6 items-end">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Current Status</label>
              <Select
                value={backlogInfo.status}
                onChange={(e) => setBacklogInfo(prev => ({ ...prev, status: e.target.value as BacklogStatus }))}
                style={{ borderColor: getBacklogStatusColor(backlogInfo.status) }}
              >
                <option value="clear">Clear - Ready for new requests</option>
                <option value="busy">Busy - Limited availability</option>
                <option value="swamped">Swamped - High wait times</option>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Status Message</label>
              <textarea
                value={backlogInfo.message}
                onChange={(e) => setBacklogInfo(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Describe current workload..."
                rows={2}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm transition-all focus:outline-none focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 resize-vertical"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Estimated Wait Time</label>
              <Input
                type="text"
                value={backlogInfo.estimatedWaitTime}
                onChange={(e) => setBacklogInfo(prev => ({ ...prev, estimatedWaitTime: e.target.value }))}
                placeholder="e.g., 2-3 weeks"
              />
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <Button
              onClick={handleBacklogStatusUpdate}
              disabled={isSavingBacklog}
              className="bg-gradient-to-r from-primary-blue to-accent-teal shadow-lg"
            >
              {isSavingBacklog ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Update Status
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-8 mt-4">
        <Card className="p-5">
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg mb-4 transition-all focus-within:border-primary-blue focus-within:ring-2 focus-within:ring-primary-blue/20">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700"
            />
          </div>

          <div className="flex gap-4 flex-wrap">
            <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Department</label>
              <Select
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
              </Select>
            </div>

            <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Priority</label>
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as Priority | 'All')}
              >
                <option value="All">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </Select>
            </div>

            <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</label>
              <Select
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
              </Select>
            </div>
          </div>
        </Card>
      </div>

      {/* Request Management */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRequests.map(request => {
            const isExpanded = expandedCard === request.id;

            return (
              <motion.div
                key={request.id}
                layout
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className={`${
                  isExpanded
                    ? 'col-span-full bg-gradient-to-b from-white to-gray-50 shadow-2xl border-primary-blue'
                    : 'shadow-sm hover:shadow-lg hover:-translate-y-0.5'
                } relative bg-white rounded-lg border border-gray-200 p-5 cursor-pointer transition-all overflow-hidden`}
                style={isExpanded ? { cursor: 'default' } : {}}
              >
                <div
                  className="w-full"
                  onClick={() => handleRequestClick(request.id)}
                >
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      <Badge variant="secondary" className="text-xs">
                        {request.department}
                      </Badge>
                    </div>
                    <Badge
                      variant={
                        request.priority === 'High' ? 'error' :
                        request.priority === 'Medium' ? 'warning' :
                        'success'
                      }
                      className="uppercase text-xs font-semibold"
                    >
                      {request.priority}
                    </Badge>
                  </div>

                  <h3 className="text-base font-semibold text-gray-800 mb-2 line-clamp-2 leading-tight">
                    {request.title}
                  </h3>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                    {request.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1.5">
                      <UserIcon size={12} className="text-gray-400" />
                      <span>{request.userName.split(' ')[0]}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-gray-400" />
                      <span>{new Date(request.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-100 gap-4">
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent-teal transition-all"
                          style={{ width: `${request.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-600 min-w-[30px]">
                        {request.progress || 0}%
                      </span>
                    </div>

                    {requestUpdates[request.id] && requestUpdates[request.id].length > 0 && (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 rounded-full text-xs font-semibold text-gray-600">
                        <MessageSquare size={12} className="text-gray-500" />
                        <span>{requestUpdates[request.id].length}</span>
                      </div>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 pt-4 border-t border-gray-200 grid gap-6"
                  >
                    <div className="p-4 bg-white rounded-lg border border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Full Description</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{request.description}</p>
                    </div>

                    <div className="p-4 bg-white rounded-lg border border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Estimated Impact</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{request.estimatedImpact}</p>
                    </div>

                    <div className="p-4 bg-white rounded-lg border border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Contact Information</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{request.contactInfo}</p>
                    </div>

                    <div className="p-6 bg-white rounded-lg border border-gray-100">
                      <h4 className="text-base font-semibold text-gray-800 mb-4">Admin Controls</h4>
                      <div className="grid grid-cols-2 gap-6 mb-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-gray-700">Status</label>
                          <Select
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
                          </Select>
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-gray-700">Progress</label>
                          <div className="flex items-center gap-4">
                            <div className="flex-1 relative h-5 flex items-center">
                              <div
                                className="absolute left-0 top-1/2 -translate-y-1/2 h-2 bg-gradient-to-r from-accent-teal to-cyan-500 rounded-full pointer-events-none z-[1] transition-all"
                                style={{ width: `${request.progress}%` }}
                              />
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={request.progress}
                                onChange={(e) => handleProgressChange(request.id, parseInt(e.target.value))}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full h-2 bg-gray-200 rounded-full outline-none relative z-[2] appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-3 [&::-webkit-slider-thumb]:border-accent-teal [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-[3] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:hover:shadow-lg"
                              />
                            </div>
                            <div className="min-w-[60px] px-3 py-1.5 bg-accent-teal text-white rounded-full text-sm font-semibold text-center shadow-md">
                              {request.progress}%
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
                        <textarea
                          value={editedNotes[request.id] || request.adminNotes || ''}
                          onChange={(e) => setEditedNotes({ ...editedNotes, [request.id]: e.target.value })}
                          onBlur={() => handleNotesSave(request.id, editedNotes[request.id])}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Add internal notes..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-vertical text-sm leading-relaxed min-h-[100px] transition-all focus:outline-none focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20"
                        />
                      </div>

                      {request.status === 'Planning' && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConvertToProject(request);
                          }}
                          className="mt-4 bg-accent-teal hover:bg-cyan-600 flex items-center gap-2"
                        >
                          <Rocket size={16} />
                          Convert to Active Project
                        </Button>
                      )}
                    </div>

                    <div className="p-6 bg-white rounded-lg border border-gray-100">
                      <h4 className="text-base font-semibold text-gray-800 mb-4">Update Timeline</h4>
                      <div className="flex gap-2 mb-4">
                        <Input
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
                          className="flex-1"
                        />
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (newUpdate[request.id]?.trim()) {
                              handleAddUpdate(request.id, newUpdate[request.id].trim());
                              setNewUpdate({ ...newUpdate, [request.id]: '' });
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>

                      <div className="max-h-[200px] overflow-y-auto flex flex-col gap-3">
                        {requestUpdates[request.id]?.map((update, index) => (
                          <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <MessageSquare size={14} className="text-gray-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm text-gray-700 leading-relaxed mb-1">{update.text}</p>
                              <span className="text-xs text-gray-500">
                                {new Date(update.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )) || <p className="text-center text-gray-500 italic text-sm py-4">No updates yet</p>}
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
