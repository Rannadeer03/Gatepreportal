import { supabase } from '../lib/supabase';
import { loggingService } from './loggingService';

// All privileged operations (creating auth users, banning/deleting users,
// approving registrations) run inside the `admin-actions` Supabase Edge
// Function, which holds the service-role key server-side only. The client
// never has access to that key; supabase.functions.invoke() automatically
// forwards the caller's current session JWT so the function can verify who
// is actually asking.
async function invokeAdminAction<T extends Record<string, unknown> = Record<string, unknown>>(
  action: string,
  payload: Record<string, unknown> = {}
): Promise<{ success: boolean; error?: string } & Partial<T>> {
  const { data, error } = await supabase.functions.invoke('admin-actions', {
    body: { action, ...payload },
  });

  if (error) {
    return { success: false, error: error.message };
  }
  if (data?.error) {
    return { success: false, error: data.error };
  }
  return { success: true, ...(data as Partial<T>) };
}

export interface PendingUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  registration_number?: string;
  faculty_id?: string;
  created_at: string;
  approval_status: 'pending' | 'approved' | 'rejected';
}

export interface UserApprovalData {
  userId: string;
  approved: boolean;
  rejectionReason?: string;
}

export interface CreateTeacherData {
  name: string;
  email: string;
  password: string;
  faculty_id: string;
  department: string;
  bio?: string;
  phone_number?: string;
}

export interface SuperAdminStats {
  total_users: number;
  pending_approvals: number;
  total_students: number;
  total_teachers: number;
  recent_registrations: number;
}

class SuperAdminService {
  /**
   * Get all pending user approvals
   */
  async getPendingApprovals(): Promise<{ data: PendingUser[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data as PendingUser[], error: null };
    } catch (error: unknown) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch pending approvals' 
      };
    }
  }

  /**
   * Approve or reject a user
   */
  async approveUser(approvalData: UserApprovalData): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      // The edge function re-derives the approver's identity from the
      // caller's own verified session — it never trusts a client-supplied
      // approver id, and it checks super_admin role itself server-side.
      const result = await invokeAdminAction('approveUser', {
        userId: approvalData.userId,
        approved: approvalData.approved,
        rejectionReason: approvalData.rejectionReason,
      });

      if (!result.success) {
        return { success: false, error: result.error };
      }

      // Log the approval/rejection
      await loggingService.logUserApproval(
        user.id,
        approvalData.userId,
        approvalData.approved,
        approvalData.rejectionReason
      );

      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process user approval'
      };
    }
  }

  /**
   * Create a new teacher account
   * Note: This creates a profile entry that will need to be manually activated
   */
  async createTeacher(teacherData: CreateTeacherData): Promise<{ success: boolean; teacherId?: string; error?: string }> {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        return { success: false, error: 'Authentication required' };
      }

      const result = await invokeAdminAction<{ teacherId?: string }>('createTeacher', teacherData);

      if (!result.success) {
        await loggingService.logActivity(
          'teacher_creation_requested',
          {
            teacher_email: teacherData.email,
            teacher_name: teacherData.name,
            faculty_id: teacherData.faculty_id,
            department: teacherData.department,
            error: result.error,
            instructions: 'Teacher creation failed, manual intervention required'
          },
          currentUser.id
        );
        return { success: false, error: `Failed to create teacher account: ${result.error}` };
      }

      await loggingService.logTeacherCreation(currentUser.id, result.teacherId!, {
        name: teacherData.name,
        email: teacherData.email,
        faculty_id: teacherData.faculty_id,
        department: teacherData.department
      });

      return {
        success: true,
        teacherId: result.teacherId,
        error: `Teacher account created successfully! ${teacherData.name} can now sign in with email ${teacherData.email} and the provided password. They will be prompted to change their password on first login.`
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create teacher'
      };
    }
  }

  /**
   * Get all users with their approval status
   */
  async getAllUsers(): Promise<{ data: PendingUser[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data as PendingUser[], error: null };
    } catch (error: unknown) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch users' 
      };
    }
  }

  /**
   * Get super admin dashboard statistics
   */
  async getDashboardStats(): Promise<{ data: SuperAdminStats | null; error: string | null }> {
    try {
      // Get user counts
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('role, approval_status, created_at');

      if (usersError) {
        return { data: null, error: usersError.message };
      }

      // Calculate statistics
      const totalUsers = users.length;
      const pendingApprovals = users.filter(u => u.approval_status === 'pending').length;
      const totalStudents = users.filter(u => u.role === 'student').length;
      const totalTeachers = users.filter(u => u.role === 'teacher').length;

      // Recent registrations (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentRegistrations = users.filter(u => 
        new Date(u.created_at) >= sevenDaysAgo
      ).length;

      const stats: SuperAdminStats = {
        total_users: totalUsers,
        pending_approvals: pendingApprovals,
        total_students: totalStudents,
        total_teachers: totalTeachers,
        recent_registrations: recentRegistrations
      };

      return { data: stats, error: null };
    } catch (error: unknown) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard stats' 
      };
    }
  }

  /**
   * Update user status (activate/deactivate)
   */
  async updateUserStatus(userId: string, active: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const result = await invokeAdminAction('updateUserStatus', { userId, active });
      if (!result.success) {
        return { success: false, error: result.error };
      }

      // Log the status change
      await loggingService.logActivity(
        active ? 'user_activated' : 'user_deactivated',
        { target_user_id: userId },
        user.id
      );

      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user status'
      };
    }
  }

  /**
   * Delete a user account
   */
  async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const result = await invokeAdminAction('deleteUser', { userId });
      if (!result.success) {
        return { success: false, error: result.error };
      }

      // Log the deletion
      await loggingService.logActivity(
        'user_deleted',
        { target_user_id: userId },
        user.id
      );

      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete user'
      };
    }
  }

  /**
   * Get user details by ID
   */
  async getUserById(userId: string): Promise<{ data: PendingUser | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data as PendingUser, error: null };
    } catch (error: unknown) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch user details' 
      };
    }
  }

  /**
   * Bulk approve multiple users
   */
  async bulkApproveUsers(userIds: string[]): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const results = await Promise.all(
        userIds.map(userId => 
          this.approveUser({ userId, approved: true })
        )
      );

      const failed = results.filter(r => !r.success);
      if (failed.length > 0) {
        return { success: false, error: `Failed to approve ${failed.length} users` };
      }

      return { success: true };
    } catch (error: unknown) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to bulk approve users' 
      };
    }
  }

  // Approve pending student registration
  async approveStudentRegistration(profileId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        return { success: false, error: 'Authentication required' };
      }

      const { data: pendingProfile } = await supabase
        .from('profiles')
        .select('email, name')
        .eq('id', profileId)
        .eq('approval_status', 'pending')
        .maybeSingle();

      const result = await invokeAdminAction('approveStudentRegistration', { profileId });
      if (!result.success) {
        return { success: false, error: result.error };
      }

      await loggingService.logActivity('student_approved', {
        approved_student_id: profileId,
        approved_student_email: pendingProfile?.email,
        approved_student_name: pendingProfile?.name
      }, currentUser.id);

      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to approve registration'
      };
    }
  }

  // Get pending student registrations
  async getPendingRegistrations(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        return { success: false, error: 'Authentication required' };
      }

      // Verify super admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single();

      if (!profile || profile.role !== 'super_admin') {
        return { success: false, error: 'Unauthorized: Super admin access required' };
      }

      // Get all pending registrations
      const { data: pendingRegistrations, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('approval_status', 'pending')
        .eq('auth_provider', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: pendingRegistrations };

    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch pending registrations'
      };
    }
  }
}

export const superAdminService = new SuperAdminService();