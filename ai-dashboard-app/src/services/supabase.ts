import { supabase, getCurrentUser } from '../lib/supabase';
import { isAdminEmail } from '../lib/roles';
import type {
  AIRequest,
  Project,
  DashboardMetrics,
  ActivityItem,
  BacklogInfo,
  User,
  ProjectStatus,
  Priority,
  Department
} from '../types';

// Export supabase client
export { supabase };

// Convert Supabase user to our User type
export const convertSupabaseUser = (supabaseUser: any): User => {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    name: supabaseUser.name,
    picture: supabaseUser.picture,
    isAdmin: supabaseUser.is_admin
  };
};

// Convert database request to AIRequest type
const convertDbRequest = (dbRequest: any): AIRequest => {
  return {
    id: dbRequest.id,
    title: dbRequest.title,
    description: dbRequest.description,
    department: dbRequest.department as Department,
    priority: dbRequest.priority as Priority,
    estimatedImpact: dbRequest.estimated_impact,
    contactInfo: dbRequest.contact_info,
    status: dbRequest.status as ProjectStatus,
    progress: dbRequest.progress || 0,
    adminNotes: dbRequest.admin_notes,
    userId: dbRequest.user_id,
    userEmail: dbRequest.user?.email || '',
    userName: dbRequest.user?.name || '',
    submittedAt: new Date(dbRequest.submitted_at),
    lastUpdated: dbRequest.updated_at ? new Date(dbRequest.updated_at) : undefined
  };
};

// Auth Service
export const authService = {
  // Sign in with Google
  signInWithGoogle: async () => {
    // Use a specific auth redirect page that handles the OAuth callback
    const redirectTo = `${window.location.origin}/ai-dashboard/auth-redirect.html`;
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo,
        queryParams: {
          prompt: 'select_account'
        }
      }
    });
    
    if (error) throw error;
    return data;
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current session
  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  // Get user profile
  getUserProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return convertSupabaseUser(data);
  },

  // Get current user
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('getCurrentUser: No authenticated user');
        return null;
      }

      console.log('getCurrentUser: Auth user found:', user.email);
      console.log('getCurrentUser: Auth user metadata:', user.user_metadata);

      // First try to get existing user
      let { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      console.log('getCurrentUser: Database query result:', { 
        data: data ? 'found' : 'not found', 
        error: error?.code,
        errorMessage: error?.message 
      });
      
      // If user doesn't exist in public.users, create them
      if (error && error.code === 'PGRST116') {
        console.log('getCurrentUser: Creating new user in database');
        console.log('getCurrentUser: User metadata for creation:', {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.user_metadata?.full_name,
          picture: user.user_metadata?.picture || user.user_metadata?.avatar_url
        });
        
        // Check if user has required fields from OAuth
        const userName = user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0];
        
        if (user.email && userName) {
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email,
              name: userName,
              picture: user.user_metadata?.picture || user.user_metadata?.avatar_url,
              is_admin: isAdminEmail(user.email)
            })
            .select()
            .single();
          
          if (insertError) {
            console.error('Error creating user:', insertError);
            // Return a temporary user object for dev purposes
            return {
              id: user.id,
              email: user.email,
              name: userName,
              picture: user.user_metadata?.picture || user.user_metadata?.avatar_url,
              isAdmin: isAdminEmail(user.email)
            };
          }
          console.log('getCurrentUser: User created successfully');
          data = newUser;
        } else {
          console.error('User missing required OAuth data:', user);
          // Return a basic user object anyway
          return {
            id: user.id,
            email: user.email || '',
            name: userName || 'Unknown User',
            picture: user.user_metadata?.picture || user.user_metadata?.avatar_url,
            isAdmin: isAdminEmail(user.email || '')
          };
        }
      } else if (error) {
        console.error('Error fetching user:', error);
        // Return a fallback user object
        return {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.user_metadata?.full_name || 'Unknown User',
          picture: user.user_metadata?.picture || user.user_metadata?.avatar_url,
          isAdmin: isAdminEmail(user.email || '')
        };
      }
      
      return data ? convertSupabaseUser(data) : null;
    } catch (err) {
      console.error('getCurrentUser: Unexpected error:', err);
      return null;
    }
  }
};

// AI Requests Service
export const requestsService = {
  // Get all requests (admin only)
  getAllRequests: async () => {
    const { data, error } = await supabase
      .from('ai_requests')
      .select(`
        *,
        user:users(email, name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data.map(convertDbRequest);
  },

  // Get user's requests
  getUserRequests: async (userId: string) => {
    const { data, error } = await supabase
      .from('ai_requests')
      .select(`
        *,
        user:users(email, name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data.map(convertDbRequest);
  },

  // Create new request
  createRequest: async (request: Omit<AIRequest, 'id' | 'submittedAt' | 'userId' | 'userEmail' | 'userName'>) => {
    const user = await supabase.auth.getUser();
    
    if (!user.data.user?.id) {
      throw new Error('User not authenticated');
    }
    
    const userId = user.data.user.id;

    const { data, error } = await supabase
      .from('ai_requests')
      .insert({
        title: request.title,
        description: request.description,
        department: request.department,
        priority: request.priority,
        estimated_impact: request.estimatedImpact,
        contact_info: request.contactInfo,
        status: request.status || 'Planning',
        progress: request.progress || 0,
        user_id: userId
      })
      .select()
      .single();
    
    if (error) throw error;

    // Log activity (optional - don't fail if this errors)
    try {
      await supabase.rpc('log_activity', {
        p_type: 'request_submitted',
        p_title: data.title,
        p_description: 'New AI request submitted',
        p_user_id: userId,
        p_request_id: data.id
      });
    } catch (activityError) {
      console.warn('Failed to log activity:', activityError);
      // Continue anyway - the request was created successfully
    }

    return data;
  },

  // Update request (admin or request owner)
  updateRequest: async (requestId: string, updates: Partial<AIRequest>) => {
    // First get the current request data to track changes
    const { data: currentRequest } = await supabase
      .from('ai_requests')
      .select('*')
      .eq('id', requestId)
      .single();
    
    const updateData: any = {};
    const activityDescriptions: string[] = [];
    
    // Track each change for activity logging
    if (updates.status !== undefined && updates.status !== currentRequest?.status) {
      updateData.status = updates.status;
      activityDescriptions.push(`Status changed from "${currentRequest?.status}" to "${updates.status}"`);
    }
    if (updates.progress !== undefined && updates.progress !== currentRequest?.progress) {
      updateData.progress = updates.progress;
      activityDescriptions.push(`Progress updated from ${currentRequest?.progress}% to ${updates.progress}%`);
    }
    if (updates.adminNotes !== undefined && updates.adminNotes !== currentRequest?.admin_notes) {
      updateData.admin_notes = updates.adminNotes;
      activityDescriptions.push('Admin notes updated');
    }
    if (updates.description !== undefined && updates.description !== currentRequest?.description) {
      updateData.description = updates.description;
      activityDescriptions.push('Description updated');
    }
    if (updates.department !== undefined && updates.department !== currentRequest?.department) {
      updateData.department = updates.department;
      activityDescriptions.push(`Department changed from "${currentRequest?.department}" to "${updates.department}"`);
    }
    if (updates.priority !== undefined && updates.priority !== currentRequest?.priority) {
      updateData.priority = updates.priority;
      activityDescriptions.push(`Priority changed from "${currentRequest?.priority}" to "${updates.priority}"`);
    }
    if (updates.estimatedImpact !== undefined && updates.estimatedImpact !== currentRequest?.estimated_impact) {
      updateData.estimated_impact = updates.estimatedImpact;
      activityDescriptions.push('Estimated impact updated');
    }
    if (updates.contactInfo !== undefined && updates.contactInfo !== currentRequest?.contact_info) {
      updateData.contact_info = updates.contactInfo;
      activityDescriptions.push('Contact information updated');
    }
    
    // Only update if there are actual changes
    if (Object.keys(updateData).length === 0) {
      return currentRequest;
    }
    
    const { data, error } = await supabase
      .from('ai_requests')
      .update(updateData)
      .eq('id', requestId)
      .select()
      .single();
    
    if (error) throw error;
    
    // Log activities for each change
    if (activityDescriptions.length > 0) {
      const user = await getCurrentUser();
      const activityType = activityDescriptions.length === 1 && activityDescriptions[0].includes('Status') 
        ? 'status_changed' 
        : 'request_updated';
      
      try {
        await supabase.rpc('log_activity', {
          p_type: activityType,
          p_title: currentRequest?.title || 'Unknown Request',
          p_description: activityDescriptions.join(', '),
          p_request_id: requestId,
          p_user_id: user?.id || currentRequest?.user_id
        });
      } catch (activityError) {
        console.error('Failed to log activity:', activityError);
      }
    }
    
    return data;
  }
};

// Projects Service
export const projectsService = {
  // Get all projects
  getProjects: async (): Promise<Project[]> => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      status: p.status as ProjectStatus,
      progress: p.progress,
      assignedTeam: p.assigned_team,
      startDate: new Date(p.start_date),
      estimatedCompletion: new Date(p.estimated_completion),
      priority: p.priority as Priority,
      department: p.department as Department,
      budget: p.budget || undefined,
      tags: p.tags
    }));
  },

  // Create a new project
  createProject: async (project: Omit<Project, 'id'>) => {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        title: project.title,
        description: project.description,
        status: project.status,
        progress: project.progress,
        assigned_team: project.assignedTeam,
        start_date: project.startDate.toISOString(),
        estimated_completion: project.estimatedCompletion.toISOString(),
        priority: project.priority,
        department: project.department,
        budget: project.budget,
        tags: project.tags || []
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update a project
  updateProject: async (projectId: string, updates: Partial<Project>) => {
    const updateData: any = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.progress !== undefined) updateData.progress = updates.progress;
    if (updates.assignedTeam !== undefined) updateData.assigned_team = updates.assignedTeam;
    if (updates.startDate !== undefined) updateData.start_date = updates.startDate.toISOString();
    if (updates.estimatedCompletion !== undefined) updateData.estimated_completion = updates.estimatedCompletion.toISOString();
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.department !== undefined) updateData.department = updates.department;
    if (updates.budget !== undefined) updateData.budget = updates.budget;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    
    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete a project
  deleteProject: async (projectId: string) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);
    
    if (error) throw error;
  },

  // Create project from AI request
  createProjectFromRequest: async (request: AIRequest) => {
    // Calculate estimated dates based on priority
    const startDate = new Date();
    const estimatedCompletion = new Date();
    
    switch (request.priority) {
      case 'High':
        estimatedCompletion.setMonth(estimatedCompletion.getMonth() + 3);
        break;
      case 'Medium':
        estimatedCompletion.setMonth(estimatedCompletion.getMonth() + 6);
        break;
      case 'Low':
        estimatedCompletion.setMonth(estimatedCompletion.getMonth() + 9);
        break;
    }

    const project = {
      title: request.title,
      description: `${request.description}\n\n**Impact:** ${request.estimatedImpact}`,
      status: 'Planning' as ProjectStatus,
      progress: 0,
      assignedTeam: `${request.department} Team`,
      startDate,
      estimatedCompletion,
      priority: request.priority,
      department: request.department,
      tags: ['AI Initiative', 'User Request']
    };

    return await projectsService.createProject(project);
  }
};

// Backlog Service
export const backlogService = {
  // Get current backlog status
  getBacklogStatus: async (): Promise<BacklogInfo> => {
    const { data, error } = await supabase
      .from('backlog_status')
      .select('*')
      .single();
    
    if (error) throw error;
    
    return {
      status: data.status,
      message: data.message,
      estimatedWaitTime: data.estimated_wait_time
    };
  },

  // Update backlog status (admin only)
  updateBacklogStatus: async (status: BacklogInfo) => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('backlog_status')
      .update({
        status: status.status,
        message: status.message,
        estimated_wait_time: status.estimatedWaitTime,
        updated_by: user.data.user.id
      })
      .eq('id', 1);
    
    if (error) throw error;
  }
};

// Activity Service
export const activityService = {
  // Get recent activities
  getRecentActivities: async (limit = 10): Promise<ActivityItem[]> => {
    const { data, error } = await supabase
      .from('activity_log')
      .select(`
        *,
        user:users(name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data.map(a => ({
      id: a.id,
      type: a.type,
      title: a.title,
      description: a.description,
      timestamp: new Date(a.created_at),
      user: a.user?.name || 'System',
      userId: a.user_id
    }));
  },

  // Get user activities
  getUserActivities: async (userId: string, limit = 5): Promise<ActivityItem[]> => {
    const { data, error } = await supabase
      .from('activity_log')
      .select(`
        *,
        user:users(name)
      `)
      .or(`user_id.eq.${userId},request_id.in.(select id from ai_requests where user_id='${userId}')`)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data.map(a => ({
      id: a.id,
      type: a.type,
      title: a.title,
      description: a.description,
      timestamp: new Date(a.created_at),
      user: a.user?.name || 'System',
      userId: a.user_id
    }));
  }
};

// Metrics Service
export const metricsService = {
  // Get dashboard metrics
  getDashboardMetrics: async (userId?: string): Promise<DashboardMetrics> => {
    let query = supabase.from('ai_requests').select('status', { count: 'exact' });
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    const statusCounts = data.reduce((acc: any, req: any) => {
      acc[req.status] = (acc[req.status] || 0) + 1;
      return acc;
    }, {});
    
    // Get total active projects (all users)
    const { count: totalActive } = await supabase
      .from('ai_requests')
      .select('*', { count: 'exact', head: true })
      .in('status', ['In Progress', 'Testing']);
    
    // Get user's active projects if userId provided
    let yourActive = 0;
    if (userId) {
      const { count } = await supabase
        .from('ai_requests')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .in('status', ['In Progress', 'Testing']);
      yourActive = count || 0;
    }
    
    return {
      totalActiveProjects: totalActive || 0,
      yourActiveProjects: yourActive,
      deniedRequests: statusCounts['Denied'] || 0,
      totalRequests: data.length,
      completedRequests: statusCounts['Complete'] || 0,
      inProgressRequests: statusCounts['In Progress'] || 0
    };
  }
};

// Real-time subscriptions
export const subscriptions = {
  // Subscribe to request changes
  subscribeToRequests: (callback: (payload: any) => void) => {
    return supabase
      .channel('requests_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ai_requests' },
        callback
      )
      .subscribe();
  },

  // Subscribe to backlog status changes
  subscribeToBacklogStatus: (callback: (payload: any) => void) => {
    return supabase
      .channel('backlog_changes')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'backlog_status' },
        callback
      )
      .subscribe();
  },

  // Subscribe to activity log
  subscribeToActivities: (callback: (payload: any) => void) => {
    return supabase
      .channel('activity_changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_log' },
        callback
      )
      .subscribe();
  },

  // Subscribe to project changes
  subscribeToProjects: (callback: (payload: any) => void) => {
    return supabase
      .channel('projects_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        callback
      )
      .subscribe();
  },

  // Unsubscribe from a channel
  unsubscribe: async (channel: any) => {
    await supabase.removeChannel(channel);
  }
};