import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, AlertCircle, CheckCircle, User, Calendar, Flag, Mail, ChevronRight, MessageSquare, Send } from 'lucide-react';
import type { AIRequest, ProjectStatus } from '../types';
import './RequestDetailModal.css';

interface RequestDetailModalProps {
  request: AIRequest;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (requestId: string, status: ProjectStatus) => void;
  onProgressChange: (requestId: string, progress: number) => void;
  onNotesChange: (requestId: string, notes: string) => void;
  onCreateProject: (request: AIRequest) => void;
  updates: Array<{ text: string; timestamp: Date }>;
  onAddUpdate: (text: string) => void;
}

const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  request,
  isOpen,
  onClose,
  onStatusChange,
  onProgressChange,
  onNotesChange,
  onCreateProject,
  updates,
  onAddUpdate
}) => {
  const [adminNotes, setAdminNotes] = useState(request.adminNotes || '');
  const [newUpdate, setNewUpdate] = useState('');

  const getStatusIcon = (status: ProjectStatus) => {
    switch (status) {
      case 'Complete': return <CheckCircle className="status-icon complete" size={20} />;
      case 'In Progress': return <Clock className="status-icon in-progress" size={20} />;
      case 'On Hold': return <AlertCircle className="status-icon on-hold" size={20} />;
      case 'Denied': return <AlertCircle className="status-icon denied" size={20} />;
      default: return <Clock className="status-icon planning" size={20} />;
    }
  };

  const handleNotesBlur = () => {
    if (adminNotes !== request.adminNotes) {
      onNotesChange(request.id, adminNotes);
    }
  };

  const handleAddUpdate = () => {
    if (newUpdate.trim()) {
      onAddUpdate(newUpdate.trim());
      setNewUpdate('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div 
            className="request-detail-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="modal-header">
              <div className="modal-title-section">
                {getStatusIcon(request.status)}
                <div>
                  <h2>{request.title}</h2>
                  <p className="request-id">ID: {request.id}</p>
                </div>
              </div>
              <button className="close-btn" onClick={onClose}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-content-grid">
                {/* Left Column - Main Details */}
                <div className="modal-main-content">
                  <section className="detail-section">
                    <h3>Description</h3>
                    <p className="description-text">{request.description}</p>
                  </section>

                  <section className="detail-section">
                    <h3>Estimated Impact</h3>
                    <p className="impact-text">{request.estimatedImpact}</p>
                  </section>

                  <section className="detail-section">
                    <h3>Admin Controls</h3>
                    <div className="admin-controls-grid">
                      <div className="control-item">
                        <label>Status</label>
                        <select 
                          value={request.status} 
                          onChange={(e) => onStatusChange(request.id, e.target.value as ProjectStatus)}
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

                      <div className="control-item">
                        <label>Progress ({request.progress}%)</label>
                        <div className="progress-control">
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={request.progress} 
                            onChange={(e) => onProgressChange(request.id, parseInt(e.target.value))}
                            className="progress-slider"
                          />
                          <div className="progress-bar-container">
                            <div 
                              className="progress-bar-fill" 
                              style={{ width: `${request.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="notes-section">
                      <label>Admin Notes</label>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        onBlur={handleNotesBlur}
                        placeholder="Add internal notes..."
                        className="admin-notes-textarea"
                        rows={4}
                      />
                    </div>

                    {request.status === 'Planning' && (
                      <button 
                        onClick={() => onCreateProject(request)}
                        className="create-project-btn"
                      >
                        <ChevronRight size={20} />
                        Convert to Active Project
                      </button>
                    )}
                  </section>
                </div>

                {/* Right Column - Metadata & Updates */}
                <div className="modal-sidebar">
                  <section className="metadata-section">
                    <h3>Request Information</h3>
                    <div className="metadata-list">
                      <div className="metadata-item">
                        <User size={16} />
                        <div>
                          <span className="metadata-label">Submitted by</span>
                          <span className="metadata-value">{request.userName}</span>
                        </div>
                      </div>
                      
                      <div className="metadata-item">
                        <Mail size={16} />
                        <div>
                          <span className="metadata-label">Contact</span>
                          <span className="metadata-value">{request.contactInfo}</span>
                        </div>
                      </div>
                      
                      <div className="metadata-item">
                        <Calendar size={16} />
                        <div>
                          <span className="metadata-label">Submitted</span>
                          <span className="metadata-value">
                            {new Date(request.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="metadata-item">
                        <Flag size={16} />
                        <div>
                          <span className="metadata-label">Priority</span>
                          <span className={`priority-badge ${request.priority.toLowerCase()}`}>
                            {request.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="updates-section">
                    <h3>Update Timeline</h3>
                    <div className="updates-list">
                      {updates.length === 0 ? (
                        <p className="no-updates">No updates yet</p>
                      ) : (
                        updates.map((update, index) => (
                          <motion.div 
                            key={index} 
                            className="update-item"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <MessageSquare size={14} />
                            <div className="update-content">
                              <p>{update.text}</p>
                              <span className="update-time">
                                {new Date(update.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                    
                    <div className="add-update-form">
                      <input
                        type="text"
                        value={newUpdate}
                        onChange={(e) => setNewUpdate(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddUpdate()}
                        placeholder="Add an update..."
                        className="update-input"
                      />
                      <button 
                        onClick={handleAddUpdate}
                        disabled={!newUpdate.trim()}
                        className="update-submit-btn"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RequestDetailModal;