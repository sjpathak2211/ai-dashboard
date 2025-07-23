import React, { useState } from 'react';
import type { Project, ProjectStatus } from '../types';
import { Calendar, Users, Tag, Filter, Search, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import './ProjectsSection.css';

interface ProjectsSectionProps {
  projects: Project[];
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects }) => {
  const [filter, setFilter] = useState<ProjectStatus | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const statusFilters: (ProjectStatus | 'All')[] = ['All', 'Planning', 'In Progress', 'Testing', 'Complete', 'On Hold'];

  const filteredProjects = projects.filter(project => {
    const matchesFilter = filter === 'All' || project.status === filter;
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.assignedTeam.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
        return <AlertCircle size={16} className="status-icon on-hold" />;
      default:
        return <Clock size={16} className="status-icon" />;
    }
  };

  const getStatusClass = (status: ProjectStatus) => {
    return status.toLowerCase().replace(' ', '-');
  };

  const getPriorityClass = (priority: string) => {
    return priority.toLowerCase();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatBudget = (budget?: number) => {
    if (!budget) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(budget);
  };

  return (
    <div className="projects-section">
      <div className="projects-header">
        <div className="projects-title">
          <h2>All AI Projects</h2>
          <span className="projects-count">{filteredProjects.length} projects</span>
        </div>
        
        <div className="projects-controls">
          <div className="search-container">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-container">
            <Filter size={16} className="filter-icon" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as ProjectStatus | 'All')}
              className="filter-select"
            >
              {statusFilters.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="projects-grid">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            className="project-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="project-card-header">
              <div className="project-title-section">
                <h3 className="project-title">{project.title}</h3>
                <div className="project-meta">
                  <span className={`priority-badge ${getPriorityClass(project.priority)}`}>
                    {project.priority}
                  </span>
                  <span className="department-badge">{project.department}</span>
                </div>
              </div>
              
              <div className={`status-badge ${getStatusClass(project.status)}`}>
                {getStatusIcon(project.status)}
                {project.status}
              </div>
            </div>

            <p className="project-description">{project.description}</p>

            <div className="project-progress">
              <div className="progress-header">
                <span className="progress-label">Progress</span>
                <span className="progress-percentage">{project.progress}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            <div className="project-details">
              <div className="detail-item">
                <Users size={14} />
                <span>{project.assignedTeam}</span>
              </div>
              
              <div className="detail-item">
                <Calendar size={14} />
                <span>{formatDate(project.estimatedCompletion)}</span>
              </div>
              
              {project.budget && (
                <div className="detail-item">
                  <span className="budget-icon">$</span>
                  <span>{formatBudget(project.budget)}</span>
                </div>
              )}
            </div>

            {project.tags.length > 0 && (
              <div className="project-tags">
                <Tag size={12} />
                <div className="tags-list">
                  {project.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-content">
            <AlertCircle size={48} className="empty-state-icon" />
            <h3>No projects found</h3>
            <p>
              {searchTerm ? 
                `No projects match your search for "${searchTerm}"` : 
                `No projects with status "${filter}"`
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsSection;