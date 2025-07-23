export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          picture: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          picture?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          picture?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ai_requests: {
        Row: {
          id: string
          title: string
          description: string
          department: 'Clinical Operations' | 'IT' | 'Research' | 'Quality Assurance' | 'Administration' | 'Finance'
          priority: 'High' | 'Medium' | 'Low'
          estimated_impact: string
          contact_info: string
          status: 'Planning' | 'In Progress' | 'Testing' | 'Complete' | 'On Hold' | 'Denied'
          progress: number
          admin_notes: string | null
          user_id: string
          created_at: string
          updated_at: string
          submitted_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          department: 'Clinical Operations' | 'IT' | 'Research' | 'Quality Assurance' | 'Administration' | 'Finance'
          priority: 'High' | 'Medium' | 'Low'
          estimated_impact: string
          contact_info: string
          status?: 'Planning' | 'In Progress' | 'Testing' | 'Complete' | 'On Hold' | 'Denied'
          progress?: number
          admin_notes?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
          submitted_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          department?: 'Clinical Operations' | 'IT' | 'Research' | 'Quality Assurance' | 'Administration' | 'Finance'
          priority?: 'High' | 'Medium' | 'Low'
          estimated_impact?: string
          contact_info?: string
          status?: 'Planning' | 'In Progress' | 'Testing' | 'Complete' | 'On Hold' | 'Denied'
          progress?: number
          admin_notes?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
          submitted_at?: string
        }
      }
      activity_log: {
        Row: {
          id: string
          type: 'project_created' | 'project_updated' | 'request_submitted' | 'project_completed' | 'request_updated' | 'status_changed' | 'progress_updated' | 'admin_note_added'
          title: string
          description: string
          user_id: string
          request_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          type: 'project_created' | 'project_updated' | 'request_submitted' | 'project_completed' | 'request_updated' | 'status_changed' | 'progress_updated' | 'admin_note_added'
          title: string
          description: string
          user_id: string
          request_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          type?: 'project_created' | 'project_updated' | 'request_submitted' | 'project_completed' | 'request_updated' | 'status_changed' | 'progress_updated' | 'admin_note_added'
          title?: string
          description?: string
          user_id?: string
          request_id?: string | null
          metadata?: Json
          created_at?: string
        }
      }
      backlog_status: {
        Row: {
          id: number
          status: 'clear' | 'busy' | 'swamped'
          message: string
          estimated_wait_time: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: number
          status?: 'clear' | 'busy' | 'swamped'
          message?: string
          estimated_wait_time?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: number
          status?: 'clear' | 'busy' | 'swamped'
          message?: string
          estimated_wait_time?: string
          updated_at?: string
          updated_by?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string
          status: 'Planning' | 'In Progress' | 'Testing' | 'Complete' | 'On Hold' | 'Denied'
          progress: number
          assigned_team: string
          priority: 'High' | 'Medium' | 'Low'
          department: 'Clinical Operations' | 'IT' | 'Research' | 'Quality Assurance' | 'Administration' | 'Finance'
          budget: number | null
          tags: string[]
          start_date: string
          estimated_completion: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          status: 'Planning' | 'In Progress' | 'Testing' | 'Complete' | 'On Hold' | 'Denied'
          progress?: number
          assigned_team: string
          priority: 'High' | 'Medium' | 'Low'
          department: 'Clinical Operations' | 'IT' | 'Research' | 'Quality Assurance' | 'Administration' | 'Finance'
          budget?: number | null
          tags?: string[]
          start_date: string
          estimated_completion: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          status?: 'Planning' | 'In Progress' | 'Testing' | 'Complete' | 'On Hold' | 'Denied'
          progress?: number
          assigned_team?: string
          priority?: 'High' | 'Medium' | 'Low'
          department?: 'Clinical Operations' | 'IT' | 'Research' | 'Quality Assurance' | 'Administration' | 'Finance'
          budget?: number | null
          tags?: string[]
          start_date?: string
          estimated_completion?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      log_activity: {
        Args: {
          p_type: 'project_created' | 'project_updated' | 'request_submitted' | 'project_completed' | 'request_updated' | 'status_changed' | 'progress_updated' | 'admin_note_added'
          p_title: string
          p_description: string
          p_user_id: string
          p_request_id?: string
          p_metadata?: Json
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}