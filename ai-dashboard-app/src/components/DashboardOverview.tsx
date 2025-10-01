import React from 'react';
import { Activity, CheckCircle, Clock, TrendingUp, XCircle, BarChart3 } from 'lucide-react';
import type { DashboardMetrics } from '../types';
import { Card } from './ui';

interface DashboardOverviewProps {
  metrics: DashboardMetrics;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ metrics }) => {
  const metricCards = [
    {
      icon: BarChart3,
      value: metrics.totalActiveProjects,
      label: 'Total Active Projects',
      sublabel: 'Across all users',
      iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
      iconColor: 'text-white',
      changeColor: 'text-primary-600'
    },
    {
      icon: Activity,
      value: metrics.yourActiveProjects,
      label: 'Your Active Projects',
      sublabel: 'Currently in progress',
      iconBg: 'bg-gradient-to-br from-accent-cyan-500 to-accent-cyan-600',
      iconColor: 'text-white',
      changeColor: 'text-success'
    },
    {
      icon: XCircle,
      value: metrics.deniedRequests,
      label: 'Denied',
      sublabel: 'Requests Denied',
      iconBg: 'bg-gradient-to-br from-error to-error-dark',
      iconColor: 'text-white',
      changeColor: 'text-error'
    },
    {
      icon: TrendingUp,
      value: metrics.totalRequests,
      label: 'Total Requests',
      sublabel: 'All time submissions',
      iconBg: 'bg-gradient-to-br from-neutral-500 to-neutral-600',
      iconColor: 'text-white',
      changeColor: 'text-primary-600'
    },
    {
      icon: CheckCircle,
      value: metrics.completedRequests,
      label: 'Completed',
      sublabel: 'Successfully delivered',
      iconBg: 'bg-gradient-to-br from-success to-success-dark',
      iconColor: 'text-white',
      changeColor: 'text-success'
    },
    {
      icon: Clock,
      value: metrics.inProgressRequests,
      label: 'In Review',
      sublabel: 'Requests to be Reviewed',
      iconBg: 'bg-gradient-to-br from-warning to-warning-dark',
      iconColor: 'text-white',
      changeColor: 'text-warning'
    }
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card
              key={index}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-14 h-14 rounded-xl ${card.iconBg} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={24} className={card.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-3xl font-bold text-neutral-800 mb-1">{card.value}</h3>
                  <p className="text-sm font-semibold text-neutral-700 mb-1">{card.label}</p>
                  <span className={`text-xs font-medium ${card.changeColor}`}>{card.sublabel}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardOverview;
