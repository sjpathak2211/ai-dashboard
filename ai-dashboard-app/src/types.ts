export type ProjectStatus = 'Planning' | 'In Progress' | 'Testing' | 'Complete' | 'On Hold' | 'Denied';
export type BacklogStatus = 'clear' | 'busy' | 'swamped';
export type Priority = 'High' | 'Medium' | 'Low';
export type Department = 'Clinical Operations' | 'IT' | 'Research' | 'Quality Assurance' | 'Administration' | 'Finance';

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  isAdmin?: boolean;
}

export interface AIRequest {
  id: string;
  title: string;
  description: string;
  department: Department;
  priority: Priority;
  estimatedImpact: string;
  contactInfo: string;
  submittedAt: Date;
  status: ProjectStatus;
  userId: string;
  userEmail: string;
  userName: string;
  progress?: number;
  lastUpdated?: Date;
  adminNotes?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  assignedTeam: string;
  startDate: Date;
  estimatedCompletion: Date;
  priority: Priority;
  department: Department;
  budget?: number;
  tags: string[];
}

export interface DashboardMetrics {
  totalActiveProjects: number;
  yourActiveProjects: number;
  deniedRequests: number;
  totalRequests: number;
  completedRequests: number;
  inProgressRequests: number;
}

export interface BacklogInfo {
  status: BacklogStatus;
  message: string;
  estimatedWaitTime: string;
}

export interface ActivityItem {
  id: string;
  type: 'project_created' | 'project_updated' | 'request_submitted' | 'project_completed' | 'request_updated' | 'status_changed' | 'project_converted';
  title: string;
  description: string;
  timestamp: Date;
  user: string;
  userId?: string;
}

export interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

export interface DecodedGoogleToken {
  iss: string;
  sub: string;
  aud: string;
  iat: number;
  exp: number;
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
}