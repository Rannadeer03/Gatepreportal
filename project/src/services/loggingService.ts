import { supabase } from '../lib/supabase';

export interface LogEntry {
  id?: string;
  user_id?: string;
  action_type: string;
  action_details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  created_at?: string;
}

export interface LogFilters {
  user_id?: string;
  action_type?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export interface ActivityStats {
  total_activities: number;
  login_attempts: number;
  registrations: number;
  test_activities: number;
  daily_activities: { [key: string]: number };
}

export interface TeacherData {
  name: string;
  email: string;
  faculty_id: string;
  department: string;
}

class LoggingService {
  /**
   * Log a user activity
   */
  async logActivity(
    actionType: string,
    actionDetails?: Record<string, unknown>,
    userId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current user if not provided
      const currentUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      
      // Get client information
      const userAgent = navigator.userAgent;
      const sessionId = (await supabase.auth.getSession()).data.session?.access_token?.substring(0, 20);

      // Try to insert directly into system_logs table instead of using RPC
      const { error } = await supabase
        .from('system_logs')
        .insert([{
          user_id: currentUserId,
          action_type: actionType,
          action_details: actionDetails,
          user_agent: userAgent,
          session_id: sessionId,
          created_at: new Date().toISOString()
        }]);

      if (error) {
        // If RLS policy fails, log to console only and continue
        if (error.code === '42501') {
          console.log(`📝 Activity logged locally: ${actionType}`, actionDetails);
        } else {
          console.warn('Failed to log activity (this is non-critical):', error.message);
        }
        // Don't return error - logging should not break the main flow
      }

      return { success: true };
    } catch (error: unknown) {
      console.error('Logging service error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get system logs with filters
   */
  async getLogs(filters: LogFilters = {}): Promise<{ data: LogEntry[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('system_logs')
        .select(`
          id,
          user_id,
          action_type,
          action_details,
          ip_address,
          user_agent,
          session_id,
          created_at,
          profiles:user_id (
            name,
            email,
            role
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      if (filters.action_type) {
        query = query.eq('action_type', filters.action_type);
      }

      if (filters.start_date) {
        query = query.gte('created_at', filters.start_date);
      }

      if (filters.end_date) {
        query = query.lte('created_at', filters.end_date);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data as LogEntry[], error: null };
    } catch (error: unknown) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get activity statistics
   */
  async getActivityStats(days: number = 30): Promise<{ data: ActivityStats | null; error: string | null }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('system_logs')
        .select('action_type, created_at')
        .gte('created_at', startDate.toISOString());

      if (error) {
        return { data: null, error: error.message };
      }

      // Process data to get statistics
      const stats = {
        total_activities: data.length,
        login_attempts: data.filter(log => log.action_type === 'login').length,
        registrations: data.filter(log => log.action_type === 'registration').length,
        test_activities: data.filter(log => log.action_type.includes('test')).length,
        daily_activities: this.groupByDay(data)
      };

      return { data: stats, error: null };
    } catch (error: unknown) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Log specific user actions
   */
  async logLogin(userId: string, success: boolean = true): Promise<void> {
    await this.logActivity(
      success ? 'login_success' : 'login_failed',
      { success, timestamp: new Date().toISOString() },
      userId
    );
  }

  async logLogout(userId: string): Promise<void> {
    await this.logActivity(
      'logout',
      { timestamp: new Date().toISOString() },
      userId
    );
  }

  async logRegistration(userId: string, role: string): Promise<void> {
    await this.logActivity(
      'user_registration',
      { role, timestamp: new Date().toISOString() },
      userId
    );
  }

  async logTestStart(userId: string, testId: string, testTitle: string): Promise<void> {
    await this.logActivity(
      'test_started',
      { test_id: testId, test_title: testTitle, timestamp: new Date().toISOString() },
      userId
    );
  }

  async logTestComplete(userId: string, testId: string, score: number, duration: number): Promise<void> {
    await this.logActivity(
      'test_completed',
      { 
        test_id: testId, 
        score, 
        duration_minutes: duration,
        timestamp: new Date().toISOString() 
      },
      userId
    );
  }

  async logUserApproval(adminId: string, userId: string, approved: boolean, reason?: string): Promise<void> {
    await this.logActivity(
      approved ? 'user_approved' : 'user_rejected',
      { 
        target_user_id: userId,
        reason,
        timestamp: new Date().toISOString() 
      },
      adminId
    );
  }

  async logTeacherCreation(adminId: string, teacherId: string, teacherData: TeacherData): Promise<void> {
    await this.logActivity(
      'teacher_created',
      { 
        teacher_id: teacherId,
        teacher_data: teacherData,
        timestamp: new Date().toISOString() 
      },
      adminId
    );
  }

  /**
   * Helper function to group activities by day
   */
  private groupByDay(data: LogEntry[]): { [key: string]: number } {
    const grouped: { [key: string]: number } = {};
    
    data.forEach(item => {
      if (item.created_at) {
        const date = new Date(item.created_at).toISOString().split('T')[0];
        grouped[date] = (grouped[date] || 0) + 1;
      }
    });

    return grouped;
  }

  /**
   * Get recent activities for dashboard
   */
  async getRecentActivities(limit: number = 10): Promise<{ data: LogEntry[] | null; error: string | null }> {
    return this.getLogs({ limit });
  }

  /**
   * Get user-specific activities
   */
  async getUserActivities(userId: string, limit: number = 50): Promise<{ data: LogEntry[] | null; error: string | null }> {
    return this.getLogs({ user_id: userId, limit });
  }

  /**
   * Search logs by action type
   */
  async getLogsByActionType(actionType: string, limit: number = 100): Promise<{ data: LogEntry[] | null; error: string | null }> {
    return this.getLogs({ action_type: actionType, limit });
  }
}

export const loggingService = new LoggingService();