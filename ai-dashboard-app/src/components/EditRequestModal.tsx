import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { AIRequest, Department, Priority } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { requestsService } from '../services/supabase';
import './EditRequestModal.css';

interface EditRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: AIRequest | null;
  onUpdate: () => void;
}

const EditRequestModal: React.FC<EditRequestModalProps> = ({ isOpen, onClose, request, onUpdate }) => {
  const [formData, setFormData] = useState({
    description: '',
    department: '' as Department,
    priority: '' as Priority,
    estimatedImpact: '',
    contactInfo: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const departments: Department[] = [
    'Clinical Operations',
    'IT',
    'Research',
    'Quality Assurance',
    'Administration',
    'Finance'
  ];

  const priorities: Priority[] = ['High', 'Medium', 'Low'];

  useEffect(() => {
    if (request) {
      setFormData({
        description: request.description,
        department: request.department,
        priority: request.priority,
        estimatedImpact: request.estimatedImpact,
        contactInfo: request.contactInfo
      });
    }
  }, [request]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
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
    
    if (!validateForm() || !request) return;
    
    setIsSaving(true);
    try {
      await requestsService.updateRequest(request.id, {
        description: formData.description,
        department: formData.department,
        priority: formData.priority,
        estimatedImpact: formData.estimatedImpact,
        contactInfo: formData.contactInfo
      });
      
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to update request:', error);
      alert('Failed to update request. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && request && (
        <div className="modal-overlay" onClick={onClose}>
        <motion.div 
          className="edit-modal-content"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2>Edit Request</h2>
            <button 
              className="close-button" 
              onClick={onClose}
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>

          <div className="request-title-display">
            <label>Title (Cannot be edited)</label>
            <p className="title-readonly">{request.title}</p>
          </div>

          <form onSubmit={handleSubmit} className="modal-form">
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
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="primary"
                disabled={isSaving}
              >
                <Save size={16} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};

export default EditRequestModal;