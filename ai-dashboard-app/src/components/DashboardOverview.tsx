import React from 'react';
import { Activity, CheckCircle, Clock, TrendingUp, XCircle, BarChart3 } from 'lucide-react';
import type { DashboardMetrics } from '../types';
import './DashboardOverview.css';

interface DashboardOverviewProps {
  metrics: DashboardMetrics;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ metrics }) => {
  // Removed chart data - now using UserDashboard for user-specific content

  return (
    <div className="dashboard-overview">
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon total-active">
            <BarChart3 size={24} />
          </div>
          <div className="metric-content">
            <h3>{metrics.totalActiveProjects}</h3>
            <p>Total Active Projects</p>
            <span className="metric-change primary">Across all users</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon active">
            <Activity size={24} />
          </div>
          <div className="metric-content">
            <h3>{metrics.yourActiveProjects}</h3>
            <p>Your Active Projects</p>
            <span className="metric-change positive">Currently in progress</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon denied">
            <XCircle size={24} />
          </div>
          <div className="metric-content">
            <h3>{metrics.deniedRequests}</h3>
            <p>Denied</p>
            <span className="metric-change negative">Requests Denied</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon requests">
            <TrendingUp size={24} />
          </div>
          <div className="metric-content">
            <h3>{metrics.totalRequests}</h3>
            <p>Total Requests</p>
            <span className="metric-change primary">All time submissions</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon completed">
            <CheckCircle size={24} />
          </div>
          <div className="metric-content">
            <h3>{metrics.completedRequests}</h3>
            <p>Completed</p>
            <span className="metric-change positive">Successfully delivered</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon in-progress">
            <Clock size={24} />
          </div>
          <div className="metric-content">
            <h3>{metrics.inProgressRequests}</h3>
            <p>In Review</p>
            <span className="metric-change warning">Requests to be Reviewed</span>
          </div>
        </div>
      </div>

      {/* Charts section removed - replaced by UserDashboard component */}
      {/* Recent Activity section moved to UserDashboard component */}
    </div>
  );
};

export default DashboardOverview;