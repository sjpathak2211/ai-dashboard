import React, { useState, useEffect } from 'react';
import { X, Send, AlertTriangle, Clock, Info, Bot } from 'lucide-react';
import type { AIRequest, Department, Priority, User, BacklogInfo } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { requestsService, backlogService } from '../services/supabase';
import MarshalChat from './MarshalChat';

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
      <div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] p-4"
        onClick={onClose}
      >
        <motion.div
          className="bg-white bg-gradient-to-br from-white to-white/95 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-gradient-to-r before:from-cyan-500 before:via-blue-500 before:to-blue-600 before:rounded-t-2xl"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          <>
            {/* Header */}
            <div className="flex justify-between items-center px-8 py-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Submit New AI Request</h2>
              <button
                className="bg-transparent border-none text-gray-400 cursor-pointer p-2 rounded-md transition-all duration-200 flex items-center justify-center hover:bg-gray-100 hover:text-gray-600"
                onClick={onClose}
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>

            {/* Backlog Status Warning */}
            <div className={`flex items-start gap-4 px-8 py-6 border-b border-gray-200 relative ${
              backlogStatus.status === 'clear'
                ? 'bg-gradient-to-br from-emerald-500/5 to-emerald-500/[0.02] border-l-4 border-l-emerald-500'
                : backlogStatus.status === 'busy'
                ? 'bg-gradient-to-br from-amber-500/5 to-amber-500/[0.02] border-l-4 border-l-amber-500'
                : 'bg-gradient-to-br from-red-500/5 to-red-500/[0.02] border-l-4 border-l-red-600'
            }`}>
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mt-1 ${
                backlogStatus.status === 'clear'
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-400 text-white'
                  : backlogStatus.status === 'busy'
                  ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white'
                  : 'bg-gradient-to-br from-red-600 to-pink-400 text-white'
              }`}>
                {backlogStatus.status === 'clear' && <Info size={20} />}
                {backlogStatus.status === 'busy' && <Clock size={20} />}
                {backlogStatus.status === 'swamped' && <AlertTriangle size={20} />}
              </div>
              <div className="flex-1">
                <h4 className={`text-base font-semibold mb-2 ${
                  backlogStatus.status === 'clear'
                    ? 'text-emerald-700'
                    : backlogStatus.status === 'busy'
                    ? 'text-amber-700'
                    : 'text-red-700'
                }`}>
                  {backlogStatus.status === 'clear' && 'Good News!'}
                  {backlogStatus.status === 'busy' && 'Please Note'}
                  {backlogStatus.status === 'swamped' && 'Important Notice'}
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">{backlogStatus.message}</p>
                <span className="text-xs text-gray-500">
                  Estimated response time: <strong className="text-gray-700 font-semibold">{backlogStatus.estimatedWaitTime}</strong>
                </span>
              </div>
            </div>

            {/* Marshal AI Button */}
            <div className="my-5 text-center px-8">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-cyan-500 to-blue-600 text-white border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-300 shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/30"
                onClick={() => setShowMarshalChat(true)}
              >
                <Bot size={20} />
                <span>Generate with Marshal AI</span>
              </button>
              <p className="mt-2 text-[13px] text-gray-600">Let Marshal help you create a comprehensive request</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 py-8 flex flex-col gap-6">
              {/* Title */}
              <div className="flex flex-col gap-2">
                <label htmlFor="title" className="font-semibold text-gray-700 text-sm">
                  Project/Idea Title *
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`px-3.5 py-3.5 border rounded-lg text-sm bg-white/80 backdrop-blur-sm transition-all duration-300 font-[inherit] focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_0_3px_rgba(6,182,212,0.1)] focus:bg-white focus:scale-[1.01] ${
                    errors.title ? 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' : 'border-gray-300'
                  }`}
                  placeholder="Enter a descriptive title for your AI initiative"
                />
                {errors.title && <span className="text-red-500 text-xs font-medium">{errors.title}</span>}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <label htmlFor="description" className="font-semibold text-gray-700 text-sm">
                  Description *
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`px-3.5 py-3.5 border rounded-lg text-sm bg-white/80 backdrop-blur-sm transition-all duration-300 font-[inherit] resize-y min-h-[80px] focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_0_3px_rgba(6,182,212,0.1)] focus:bg-white focus:scale-[1.01] ${
                    errors.description ? 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' : 'border-gray-300'
                  }`}
                  placeholder="Describe the AI initiative, its goals, and expected outcomes"
                  rows={4}
                />
                {errors.description && <span className="text-red-500 text-xs font-medium">{errors.description}</span>}
              </div>

              {/* Department and Priority Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="department" className="font-semibold text-gray-700 text-sm">
                    Department/Team *
                  </label>
                  <select
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className={`px-3.5 py-3.5 border rounded-lg text-sm bg-white/80 backdrop-blur-sm transition-all duration-300 font-[inherit] focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_0_3px_rgba(6,182,212,0.1)] focus:bg-white focus:scale-[1.01] ${
                      errors.department ? 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {errors.department && <span className="text-red-500 text-xs font-medium">{errors.department}</span>}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="priority" className="font-semibold text-gray-700 text-sm">
                    Priority Level *
                  </label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className={`px-3.5 py-3.5 border rounded-lg text-sm bg-white/80 backdrop-blur-sm transition-all duration-300 font-[inherit] focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_0_3px_rgba(6,182,212,0.1)] focus:bg-white focus:scale-[1.01] ${
                      errors.priority ? 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Priority</option>
                    {priorities.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                  {errors.priority && <span className="text-red-500 text-xs font-medium">{errors.priority}</span>}
                </div>
              </div>

              {/* Estimated Impact */}
              <div className="flex flex-col gap-2">
                <label htmlFor="estimatedImpact" className="font-semibold text-gray-700 text-sm">
                  Estimated Impact *
                </label>
                <textarea
                  id="estimatedImpact"
                  value={formData.estimatedImpact}
                  onChange={(e) => handleInputChange('estimatedImpact', e.target.value)}
                  className={`px-3.5 py-3.5 border rounded-lg text-sm bg-white/80 backdrop-blur-sm transition-all duration-300 font-[inherit] resize-y min-h-[80px] focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_0_3px_rgba(6,182,212,0.1)] focus:bg-white focus:scale-[1.01] ${
                    errors.estimatedImpact ? 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' : 'border-gray-300'
                  }`}
                  placeholder="Describe the expected impact, benefits, and potential metrics"
                  rows={3}
                />
                {errors.estimatedImpact && <span className="text-red-500 text-xs font-medium">{errors.estimatedImpact}</span>}
              </div>

              {/* Contact Info */}
              <div className="flex flex-col gap-2">
                <label htmlFor="contactInfo" className="font-semibold text-gray-700 text-sm">
                  Contact Information *
                </label>
                <input
                  id="contactInfo"
                  type="email"
                  value={formData.contactInfo}
                  onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                  className={`px-3.5 py-3.5 border rounded-lg text-sm bg-white/80 backdrop-blur-sm transition-all duration-300 font-[inherit] focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_0_3px_rgba(6,182,212,0.1)] focus:bg-white focus:scale-[1.01] ${
                    errors.contactInfo ? 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' : 'border-gray-300'
                  }`}
                  placeholder="your.email@ascendcohealth.com"
                />
                {errors.contactInfo && <span className="text-red-500 text-xs font-medium">{errors.contactInfo}</span>}
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-between gap-4 px-8 py-6 border-t border-gray-200 bg-gray-50 -mx-8 -mb-8 rounded-b-2xl">
                <button
                  type="button"
                  className="min-w-[120px] justify-center px-6 py-3 rounded-lg font-semibold text-sm cursor-pointer transition-all duration-200 border-none bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-100 hover:border-gray-400"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-w-[120px] justify-center px-6 py-3 rounded-lg font-semibold text-sm cursor-pointer transition-all duration-200 border-none bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center gap-2 hover:-translate-y-px hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
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
