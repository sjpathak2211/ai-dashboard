import React, { useState, useEffect } from 'react';
import { X, Send, AlertTriangle, Clock, Info, Bot } from 'lucide-react';
import type { AIRequest, Department, Priority, User, BacklogInfo } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { requestsService, backlogService } from '../services/supabase';
import MarshalChat from './MarshalChat';
import './AIRequestModal.css';

interface AIRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: Omit<AIRequest, 'id' | 'submittedAt' | 'userId' | 'userEmail' | 'userName'>) => void;
  user?: User;
}

const AIRequestModal: React.FC<AIRequestModalProps> = ({ isOpen, onClose, onSubmit, user }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '' as Department,
    priority: '' as Priority,
    estimatedImpact: '',
    contactInfo: user?.email || ''
  });
  
  const [backlogStatus, setBacklogStatus] = useState<BacklogInfo>({
    status: 'busy',
    message: 'Currently working on several high-priority projects. New requests may take longer than usual.',
    estimatedWaitTime: '2-3 weeks'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showMarshalChat, setShowMarshalChat] = useState(false);

  // Fetch backlog status when modal opens
  useEffect(() => {
    if (isOpen) {
      backlogService.getBacklogStatus()
        .then(setBacklogStatus)
        .catch(error => console.error('Failed to fetch backlog status:', error));
    }
  }, [isOpen]);
  
  // Update contact info when user changes
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, contactInfo: user.email }));
    }
  }, [user?.email]);

  const departments: Department[] = [
    'Clinical Operations',
    'IT',
    'Research',
    'Quality Assurance',
    'Administration',
    'Finance'
  ];

  const priorities: Priority[] = ['High', 'Medium', 'Low'];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.priority) newErrors.priority = 'Priority is required';
    if (!formData.estimatedImpact.trim()) newErrors.estimatedImpact = 'Estimated impact is required';
    if (!formData.contactInfo.trim()) newErrors.contactInfo = 'Contact information is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.contactInfo && !emailRegex.test(formData.contactInfo)) {
      newErrors.contactInfo = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    await handleFinalSubmit();
  };

  const handleFinalSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Save to Supabase
      const savedRequest = await requestsService.createRequest({
        ...formData,
        status: 'Planning',
        progress: 0
      });
      
      console.log('Request saved successfully:', savedRequest);
      
      // Call the original onSubmit for any additional handling
      onSubmit({
        ...formData,
        status: 'Planning'
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        department: '' as Department,
        priority: '' as Priority,
        estimatedImpact: '',
        contactInfo: user?.email || ''
      });
      
      // Reset errors
      setErrors({});
      
      // Close modal
      onClose();
    } catch (error: any) {
      console.error('Failed to submit request:', error);
      const errorMessage = error?.message || 'Failed to submit request. Please try again.';
      alert(errorMessage);
      // Don't close modal on error
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleMarshalGenerate = (fields: { title: string; description: string; estimatedImpact: string }) => {
    setFormData(prev => ({
      ...prev,
      title: fields.title,
      description: fields.description,
      estimatedImpact: fields.estimatedImpact
    }));
    setShowMarshalChat(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div 
          className="modal-content"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          <>
              <div className="modal-header">
                <h2>Submit New AI Request</h2>
                <button 
                  className="close-button" 
                  onClick={onClose}
                  aria-label="Close modal"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Backlog Status Warning */}
              <div className={`backlog-warning ${backlogStatus.status}`}>
                <div className="backlog-warning-icon">
                  {backlogStatus.status === 'clear' && <Info size={20} />}
                  {backlogStatus.status === 'busy' && <Clock size={20} />}
                  {backlogStatus.status === 'swamped' && <AlertTriangle size={20} />}
                </div>
                <div className="backlog-warning-content">
                  <h4>
                    {backlogStatus.status === 'clear' && 'Good News!'}
                    {backlogStatus.status === 'busy' && 'Please Note'}
                    {backlogStatus.status === 'swamped' && 'Important Notice'}
                  </h4>
                  <p>{backlogStatus.message}</p>
                  <span className="backlog-estimate">
                    Estimated response time: <strong>{backlogStatus.estimatedWaitTime}</strong>
                  </span>
                </div>
              </div>

              {/* Marshal AI Button */}
              <div className="marshal-button-container">
                <button
                  type="button"
                  className="marshal-button"
                  onClick={() => setShowMarshalChat(true)}
                >
                  <Bot size={20} />
                  <span>Generate with Marshal AI</span>
                </button>
                <p className="marshal-hint">Let Marshal help you create a comprehensive request</p>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label htmlFor="title">Project/Idea Title *</label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={errors.title ? 'error' : ''}
                    placeholder="Enter a descriptive title for your AI initiative"
                  />
                  {errors.title && <span className="error-text">{errors.title}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description *</label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className={errors.description ? 'error' : ''}
                    placeholder="Describe the AI initiative, its goals, and expected outcomes"
                    rows={4}
                  />
                  {errors.description && <span className="error-text">{errors.description}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="department">Department/Team *</label>
                    <select
                      id="department"
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className={errors.department ? 'error' : ''}
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    {errors.department && <span className="error-text">{errors.department}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="priority">Priority Level *</label>
                    <select
                      id="priority"
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className={errors.priority ? 'error' : ''}
                    >
                      <option value="">Select Priority</option>
                      {priorities.map(priority => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                    {errors.priority && <span className="error-text">{errors.priority}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="estimatedImpact">Estimated Impact *</label>
                  <textarea
                    id="estimatedImpact"
                    value={formData.estimatedImpact}
                    onChange={(e) => handleInputChange('estimatedImpact', e.target.value)}
                    className={errors.estimatedImpact ? 'error' : ''}
                    placeholder="Describe the expected impact, benefits, and potential metrics"
                    rows={3}
                  />
                  {errors.estimatedImpact && <span className="error-text">{errors.estimatedImpact}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="contactInfo">Contact Information *</label>
                  <input
                    id="contactInfo"
                    type="email"
                    value={formData.contactInfo}
                    onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                    className={errors.contactInfo ? 'error' : ''}
                    placeholder="your.email@ascendcohealth.com"
                  />
                  {errors.contactInfo && <span className="error-text">{errors.contactInfo}</span>}
                </div>

                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="secondary" 
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="primary"
                    disabled={isSubmitting}
                  >
                    <Send size={16} />
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </>
        </motion.div>
      </div>

      <MarshalChat
        isOpen={showMarshalChat}
        onClose={() => setShowMarshalChat(false)}
        onFormGenerated={handleMarshalGenerate}
      />
    </AnimatePresence>
  );
};

export default AIRequestModal;