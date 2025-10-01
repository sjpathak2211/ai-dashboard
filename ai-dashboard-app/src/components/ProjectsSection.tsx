import React, { useState } from 'react';
import type { Project, ProjectStatus } from '../types';
import { Calendar, Users, Tag, Filter, Search, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Input } from './ui/Input';
import { Select } from './ui/Select';

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
        return <Clock size={16} className="text-gray-600" />;
      case 'In Progress':
        return <TrendingUp size={16} className="text-accent-teal" />;
      case 'Testing':
        return <AlertCircle size={16} className="text-warning" />;
      case 'Complete':
        return <CheckCircle size={16} className="text-success" />;
      case 'On Hold':
        return <AlertCircle size={16} className="text-error" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  const getStatusClasses = (status: ProjectStatus) => {
    const baseClasses = "flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-md uppercase tracking-wide whitespace-nowrap border";
    switch (status) {
      case 'Planning':
        return `${baseClasses} bg-gradient-to-br from-gray-600/10 to-gray-600/5 text-gray-600 border-gray-600/20`;
      case 'In Progress':
        return `${baseClasses} bg-gradient-to-br from-accent-teal/15 to-accent-teal/5 text-accent-teal border-accent-teal/30 shadow-[0_0_10px_rgba(0,188,212,0.2)]`;
      case 'Testing':
        return `${baseClasses} bg-gradient-to-br from-warning/15 to-warning/5 text-warning border-warning/30`;
      case 'Complete':
        return `${baseClasses} bg-gradient-to-br from-success/15 to-success/5 text-success border-success/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]`;
      case 'On Hold':
        return `${baseClasses} bg-gradient-to-br from-error/15 to-error/5 text-error border-error/30`;
      default:
        return baseClasses;
    }
  };

  const getPriorityClasses = (priority: string) => {
    const baseClasses = "text-xs font-semibold px-2 py-1 rounded uppercase tracking-wider";
    switch (priority.toLowerCase()) {
      case 'high':
        return `${baseClasses} bg-error/10 text-error`;
      case 'medium':
        return `${baseClasses} bg-warning/10 text-warning`;
      case 'low':
        return `${baseClasses} bg-success/10 text-success`;
      default:
        return baseClasses;
    }
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
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center mb-8 gap-4 md:gap-8">
        <div className="flex items-baseline gap-4">
          <h2 className="text-[1.75rem] font-bold text-gray-800">All AI Projects</h2>
          <span className="text-sm text-gray-500 font-medium">{filteredProjects.length} projects</span>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center">
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-[250px] pl-10 pr-3 py-3 text-sm border border-gray-300 rounded-lg bg-white/80 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:border-accent-teal focus:shadow-[0_0_0_3px_rgba(0,188,212,0.1)] focus:bg-white focus:scale-[1.02]"
            />
          </div>

          <div className="relative flex items-center">
            <Filter size={16} className="absolute left-3 text-gray-400 pointer-events-none z-10" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as ProjectStatus | 'All')}
              className="w-full pl-10 pr-10 py-3 text-sm border border-gray-300 rounded-lg bg-white/80 backdrop-blur-sm cursor-pointer transition-all duration-300 appearance-none focus:outline-none focus:border-accent-teal focus:shadow-[0_0_0_3px_rgba(0,188,212,0.1)] focus:bg-white focus:scale-[1.02]"
              style={{
                backgroundImage: `url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 5"><path fill="%2300BCD4" d="M2 0L0 2h4zm0 5L0 3h4z"/></svg>')`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '0.5rem'
              }}
            >
              {statusFilters.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(380px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(380px,1fr))] gap-6">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white bg-gradient-to-br from-white to-white/95 rounded-xl p-6 shadow-sm border border-white/20 backdrop-blur-sm transition-all duration-300 flex flex-col gap-4 relative overflow-hidden group hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-xl hover:border-accent-teal/20 before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-gradient-to-r before:from-transparent before:via-accent-teal before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
          >
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 leading-snug mb-2">{project.title}</h3>
                <div className="flex gap-2 items-center flex-wrap">
                  <span className={getPriorityClasses(project.priority)}>
                    {project.priority}
                  </span>
                  <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded font-medium">
                    {project.department}
                  </span>
                </div>
              </div>

              <div className={getStatusClasses(project.status)}>
                {getStatusIcon(project.status)}
                {project.status}
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed text-sm">{project.description}</p>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm font-semibold text-accent-teal">{project.progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent-teal to-primary-blue rounded-full transition-all duration-500 relative overflow-hidden after:content-[''] after:absolute after:top-0 after:left-[-100%] after:w-full after:h-full after:bg-gradient-to-r after:from-transparent after:via-white/40 after:to-transparent after:animate-[shimmer_2s_infinite]"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users size={14} className="text-gray-400 flex-shrink-0" />
                <span>{project.assignedTeam}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                <span>{formatDate(project.estimatedCompletion)}</span>
              </div>

              {project.budget && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-semibold text-gray-400 text-sm">$</span>
                  <span>{formatBudget(project.budget)}</span>
                </div>
              )}
            </div>

            {project.tags.length > 0 && (
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <Tag size={12} className="text-gray-400 flex-shrink-0" />
                <div className="flex flex-wrap gap-1">
                  {project.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[0.7rem] text-primary-blue bg-primary-blue/10 px-1.5 py-0.5 rounded font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="text-center max-w-md">
            <AlertCircle size={48} className="text-gray-300 mb-4 mx-auto" />
            <h3 className="text-xl text-gray-600 mb-2">No projects found</h3>
            <p className="text-gray-500 leading-relaxed">
              {searchTerm ?
                `No projects match your search for "${searchTerm}"` :
                `No projects with status "${filter}"`
              }
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
};

export default ProjectsSection;
