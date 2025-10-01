import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { AIRequest, Department, Priority } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { requestsService } from '../services/supabase';

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
    <AnimatePresence mode="wait">
      {isOpen && request && (
        <motion.div
          key="edit-modal-overlay"
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1001]"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}>
        <motion.div
          className="bg-white rounded-2xl shadow-2xl max-w-[600px] w-[90%] max-h-[90vh] overflow-y-auto p-8 relative"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Edit Request</h2>
            <button
              className="bg-transparent border-none text-gray-400 cursor-pointer p-2 rounded-lg transition-all duration-200 flex items-center justify-center hover:bg-gray-100 hover:text-gray-600"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wider">Title (Cannot be edited)</label>
            <p className="text-base font-semibold text-gray-800 m-0">{request.title}</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="description" className="text-sm font-semibold text-gray-700">Description *</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={`p-3 border rounded-lg text-sm font-inherit transition-all duration-200 bg-white text-gray-800 resize-y min-h-[100px] focus:outline-none focus:border-primary-blue focus:ring-4 focus:ring-primary-blue/10 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe the AI initiative, its goals, and expected outcomes"
                rows={4}
              />
              {errors.description && <span className="text-xs text-red-500 mt-1">{errors.description}</span>}
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="department" className="text-sm font-semibold text-gray-700">Department/Team *</label>
                <select
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className={`p-3 border rounded-lg text-sm font-inherit transition-all duration-200 bg-white text-gray-800 focus:outline-none focus:border-primary-blue focus:ring-4 focus:ring-primary-blue/10 ${
                    errors.department ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {errors.department && <span className="text-xs text-red-500 mt-1">{errors.department}</span>}
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="priority" className="text-sm font-semibold text-gray-700">Priority Level *</label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className={`p-3 border rounded-lg text-sm font-inherit transition-all duration-200 bg-white text-gray-800 focus:outline-none focus:border-primary-blue focus:ring-4 focus:ring-primary-blue/10 ${
                    errors.priority ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Priority</option>
                  {priorities.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
                {errors.priority && <span className="text-xs text-red-500 mt-1">{errors.priority}</span>}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="estimatedImpact" className="text-sm font-semibold text-gray-700">Estimated Impact *</label>
              <textarea
                id="estimatedImpact"
                value={formData.estimatedImpact}
                onChange={(e) => handleInputChange('estimatedImpact', e.target.value)}
                className={`p-3 border rounded-lg text-sm font-inherit transition-all duration-200 bg-white text-gray-800 resize-y min-h-[100px] focus:outline-none focus:border-primary-blue focus:ring-4 focus:ring-primary-blue/10 ${
                  errors.estimatedImpact ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe the expected impact, benefits, and potential metrics"
                rows={3}
              />
              {errors.estimatedImpact && <span className="text-xs text-red-500 mt-1">{errors.estimatedImpact}</span>}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="contactInfo" className="text-sm font-semibold text-gray-700">Contact Information *</label>
              <input
                id="contactInfo"
                type="email"
                value={formData.contactInfo}
                onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                className={`p-3 border rounded-lg text-sm font-inherit transition-all duration-200 bg-white text-gray-800 focus:outline-none focus:border-primary-blue focus:ring-4 focus:ring-primary-blue/10 ${
                  errors.contactInfo ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="your.email@ascendcohealth.com"
              />
              {errors.contactInfo && <span className="text-xs text-red-500 mt-1">{errors.contactInfo}</span>}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onClose}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 bg-gradient-to-r from-primary-blue to-electric-cyan text-white border-none hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isSaving}
              >
                <Save size={16} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditRequestModal;
