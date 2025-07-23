import type { Project, AIRequest, DashboardMetrics, ActivityItem, BacklogInfo } from '../types';

export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'AI-Powered Patient Triage System',
    description: 'Implement machine learning algorithms to automatically prioritize patient cases based on severity and urgency.',
    status: 'In Progress',
    progress: 65,
    assignedTeam: 'Clinical AI Team',
    startDate: new Date('2024-01-15'),
    estimatedCompletion: new Date('2024-03-30'),
    priority: 'High',
    department: 'Clinical Operations',
    budget: 150000,
    tags: ['ML', 'Patient Care', 'Automation']
  },
  {
    id: '2',
    title: 'Automated Medical Record Analysis',
    description: 'Natural language processing system to extract key insights from patient medical records.',
    status: 'Testing',
    progress: 85,
    assignedTeam: 'Data Science Team',
    startDate: new Date('2023-11-01'),
    estimatedCompletion: new Date('2024-02-15'),
    priority: 'High',
    department: 'IT',
    budget: 200000,
    tags: ['NLP', 'Medical Records', 'Analytics']
  },
  {
    id: '3',
    title: 'Predictive Surgery Scheduling',
    description: 'AI system to optimize surgery scheduling based on historical data and resource availability.',
    status: 'Planning',
    progress: 25,
    assignedTeam: 'Operations AI Team',
    startDate: new Date('2024-02-01'),
    estimatedCompletion: new Date('2024-06-01'),
    priority: 'Medium',
    department: 'Clinical Operations',
    budget: 120000,
    tags: ['Scheduling', 'Optimization', 'Surgery']
  },
  {
    id: '4',
    title: 'Clinical Decision Support AI',
    description: 'AI assistant to provide real-time clinical decision support to healthcare providers.',
    status: 'Complete',
    progress: 100,
    assignedTeam: 'Clinical AI Team',
    startDate: new Date('2023-08-01'),
    estimatedCompletion: new Date('2023-12-15'),
    priority: 'High',
    department: 'Clinical Operations',
    budget: 300000,
    tags: ['Clinical Support', 'Real-time', 'AI Assistant']
  },
  {
    id: '5',
    title: 'Inventory Management Optimization',
    description: 'Machine learning system to predict and optimize medical supply inventory levels.',
    status: 'In Progress',
    progress: 40,
    assignedTeam: 'Supply Chain AI Team',
    startDate: new Date('2024-01-01'),
    estimatedCompletion: new Date('2024-04-30'),
    priority: 'Medium',
    department: 'Administration',
    budget: 80000,
    tags: ['Inventory', 'Supply Chain', 'Prediction']
  },
  {
    id: '6',
    title: 'AI-Enhanced Quality Metrics',
    description: 'Automated system for tracking and analyzing healthcare quality metrics using AI.',
    status: 'Planning',
    progress: 15,
    assignedTeam: 'Quality AI Team',
    startDate: new Date('2024-02-15'),
    estimatedCompletion: new Date('2024-07-01'),
    priority: 'Medium',
    department: 'Quality Assurance',
    budget: 95000,
    tags: ['Quality Metrics', 'Analytics', 'Automation']
  }
];

export const mockRequests: AIRequest[] = [
  {
    id: 'req-1',
    title: 'AI Chatbot for Patient Portal',
    description: 'Develop an AI-powered chatbot to help patients navigate the patient portal and answer common questions.',
    department: 'IT',
    priority: 'High',
    estimatedImpact: 'High - Could reduce support calls by 40%',
    contactInfo: 'sarah.johnson@ascendcohealth.com',
    submittedAt: new Date('2024-01-20'),
    status: 'In Progress',
    userId: 'user-sarah-123',
    userEmail: 'sarah.johnson@ascendcohealth.com',
    userName: 'Sarah Johnson',
    progress: 75,
    lastUpdated: new Date('2024-01-25'),
    adminNotes: 'Development progressing well, testing phase upcoming'
  },
  {
    id: 'req-2',
    title: 'Automated Appointment Reminders',
    description: 'Implement AI to optimize appointment reminder timing and content based on patient behavior patterns.',
    department: 'Clinical Operations',
    priority: 'Medium',
    estimatedImpact: 'Medium - Could reduce no-show rates by 25%',
    contactInfo: 'mike.chen@ascendcohealth.com',
    submittedAt: new Date('2024-01-22'),
    status: 'Planning',
    userId: 'user-mike-456',
    userEmail: 'mike.chen@ascendcohealth.com',
    userName: 'Mike Chen',
    progress: 0,
    lastUpdated: new Date('2024-01-22')
  },
  {
    id: 'req-3',
    title: 'Financial Risk Assessment AI',
    description: 'AI system to assess patient financial risk and recommend appropriate payment plans.',
    department: 'Finance',
    priority: 'High',
    estimatedImpact: 'High - Could improve collection rates by 30%',
    contactInfo: 'lisa.rodriguez@ascendcohealth.com',
    submittedAt: new Date('2024-01-25'),
    status: 'In Progress',
    userId: 'user-lisa-789',
    userEmail: 'lisa.rodriguez@ascendcohealth.com',
    userName: 'Lisa Rodriguez',
    progress: 45,
    lastUpdated: new Date('2024-01-26'),
    adminNotes: 'Initial analysis complete, working on algorithm development'
  },
  {
    id: 'req-4',
    title: 'Patient Sentiment Analysis Tool',
    description: 'AI tool to analyze patient feedback and sentiment from surveys and reviews.',
    department: 'Quality Assurance',
    priority: 'Medium',
    estimatedImpact: 'Medium - Could improve patient satisfaction tracking by 60%',
    contactInfo: 'john.doe@ascendcohealth.com',
    submittedAt: new Date('2024-01-18'),
    status: 'Complete',
    userId: 'user-john-101',
    userEmail: 'john.doe@ascendcohealth.com',
    userName: 'John Doe',
    progress: 100,
    lastUpdated: new Date('2024-01-24'),
    adminNotes: 'Successfully deployed and integrated with patient portal'
  },
  {
    id: 'req-5',
    title: 'Voice-to-Text Clinical Notes',
    description: 'AI system to convert doctor dictations into structured clinical notes.',
    department: 'Clinical Operations',
    priority: 'Low',
    estimatedImpact: 'Low - Would save 10 minutes per consultation',
    contactInfo: 'sarah.johnson@ascendcohealth.com',
    submittedAt: new Date('2024-01-15'),
    status: 'Denied',
    userId: 'user-sarah-123',
    userEmail: 'sarah.johnson@ascendcohealth.com',
    userName: 'Sarah Johnson',
    progress: 0,
    lastUpdated: new Date('2024-01-16'),
    adminNotes: 'Denied due to low ROI and existing solutions available'
  },
  {
    id: 'req-6',
    title: 'AI Room Temperature Optimization',
    description: 'Machine learning system to automatically optimize room temperature in patient areas.',
    department: 'IT',
    priority: 'Low',
    estimatedImpact: 'Low - Minor energy savings',
    contactInfo: 'mike.chen@ascendcohealth.com',
    submittedAt: new Date('2024-01-10'),
    status: 'Denied',
    userId: 'user-mike-456',
    userEmail: 'mike.chen@ascendcohealth.com',
    userName: 'Mike Chen',
    progress: 0,
    lastUpdated: new Date('2024-01-12'),
    adminNotes: 'Denied - too niche, existing HVAC systems sufficient'
  }
];

// Helper function to get user-specific requests
export const getUserRequests = (userEmail: string): AIRequest[] => {
  return mockRequests.filter(request => request.userEmail === userEmail);
};

// Helper function to get user's active requests
export const getUserActiveRequests = (userEmail: string): AIRequest[] => {
  return mockRequests.filter(request => 
    request.userEmail === userEmail && 
    (request.status === 'In Progress' || request.status === 'Testing')
  );
};

// Helper functions for calculating metrics
export const getUserMetrics = (userEmail: string): DashboardMetrics => {
  const userRequests = getUserRequests(userEmail);
  const allActiveProjects = mockRequests.filter(req => req.status === 'In Progress' || req.status === 'Testing').length;
  const userActiveProjects = userRequests.filter(req => req.status === 'In Progress' || req.status === 'Testing').length;
  const deniedRequests = userRequests.filter(req => req.status === 'Denied').length;
  const completedRequests = userRequests.filter(req => req.status === 'Complete').length;
  const inProgressRequests = userRequests.filter(req => req.status === 'In Progress').length;

  return {
    totalActiveProjects: allActiveProjects,
    yourActiveProjects: userActiveProjects,
    deniedRequests: deniedRequests,
    totalRequests: userRequests.length,
    completedRequests: completedRequests,
    inProgressRequests: inProgressRequests,
  };
};

export const mockMetrics: DashboardMetrics = {
  totalActiveProjects: 2, // Total across all users
  yourActiveProjects: 0, // Will be calculated per user
  deniedRequests: 0, // Will be calculated per user
  totalRequests: 0, // Will be calculated per user
  completedRequests: 0, // Will be calculated per user
  inProgressRequests: 0, // Will be calculated per user
};

// Current backlog status - can be updated by admin
export const currentBacklogStatus: BacklogInfo = {
  status: 'busy',
  message: 'I\'m currently working on several high-priority projects. New requests may take longer than usual.',
  estimatedWaitTime: '2-3 weeks'
};

export const mockActivity: ActivityItem[] = [
  {
    id: 'activity-1',
    type: 'request_updated',
    title: 'AI Chatbot for Patient Portal',
    description: 'Progress updated to 75% - Development progressing well',
    timestamp: new Date('2024-01-25T10:30:00'),
    user: 'Admin Team',
    userId: 'user-sarah-123'
  },
  {
    id: 'activity-2',
    type: 'request_submitted',
    title: 'Financial Risk Assessment AI',
    description: 'New AI request submitted by Finance team',
    timestamp: new Date('2024-01-25T09:15:00'),
    user: 'Lisa Rodriguez',
    userId: 'user-lisa-789'
  },
  {
    id: 'activity-3',
    type: 'request_updated',
    title: 'Financial Risk Assessment AI',
    description: 'Status updated to In Progress - Initial analysis complete',
    timestamp: new Date('2024-01-26T16:45:00'),
    user: 'Admin Team',
    userId: 'user-lisa-789'
  },
  {
    id: 'activity-4',
    type: 'project_completed',
    title: 'Patient Sentiment Analysis Tool',
    description: 'Request completed and deployed successfully',
    timestamp: new Date('2024-01-24T14:20:00'),
    user: 'Admin Team',
    userId: 'user-john-101'
  },
  {
    id: 'activity-5',
    type: 'request_submitted',
    title: 'Automated Appointment Reminders',
    description: 'New AI request submitted by Clinical Operations',
    timestamp: new Date('2024-01-22T11:30:00'),
    user: 'Mike Chen',
    userId: 'user-mike-456'
  }
];

// Helper function to get user-specific activity
export const getUserActivity = (userEmail: string): ActivityItem[] => {
  const userRequest = mockRequests.find(req => req.userEmail === userEmail);
  if (!userRequest) return [];
  
  return mockActivity.filter(activity => 
    activity.userId === userRequest.userId
  ).slice(0, 5); // Get most recent 5 activities
};