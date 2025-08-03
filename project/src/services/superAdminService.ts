import { supabase, getSupabaseAdmin } from '../lib/supabase';
import { loggingService } from './loggingService';

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

      // Check if current user is super admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'super_admin') {
        return { success: false, error: 'Unauthorized: Super admin access required' };
      }

      // Use the database function to approve/reject user
      const { error } = await supabase.rpc('approve_user', {
        p_user_id: approvalData.userId,
        p_approved_by: user.id,
        p_approval_status: approvalData.approved ? 'approved' : 'rejected',
        p_rejection_reason: approvalData.rejectionReason || null
      });

      if (error) {
        return { success: false, error: error.message };
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
      // Verify current user is super admin
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        return { success: false, error: 'Authentication required' };
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (!profile || profile.role !== 'super_admin') {
        return { success: false, error: 'Unauthorized: Super admin access required' };
      }

      // Get admin client
      const supabaseAdmin = getSupabaseAdmin();
      if (!supabaseAdmin) {
        return { 
          success: false, 
          error: 'Service role key not configured. Please add VITE_SUPABASE_SERVICE_ROLE_KEY to your environment variables.' 
        };
      }

      // Since we can't create the teacher_requests table easily, we'll create the teacher directly
      // First, create the teacher account in Supabase Auth using admin client
      try {
        // Create the teacher user account directly using admin client
        const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
          email: teacherData.email,
          password: teacherData.password,
          email_confirm: true, // Skip email confirmation
          user_metadata: {
            name: teacherData.name,
            role: 'teacher'
          }
        });

        if (createUserError) {
          console.error('Failed to create teacher user:', createUserError);
          throw createUserError;
        }

        if (!newUser.user) {
          throw new Error('Failed to create teacher user account');
        }

        // Create the teacher profile using regular client (RLS policies should allow this)
        const profileData = {
          id: newUser.user.id,
          name: teacherData.name,
          email: teacherData.email,
          role: 'teacher',
          faculty_id: teacherData.faculty_id, // Ensure this is a string
          department: teacherData.department,
          bio: teacherData.bio,
          phone_number: teacherData.phone_number,
          auth_provider: 'email',
          requires_password_change: true, // Teacher should change password on first login
          approval_status: 'approved', // Teachers are pre-approved by super admin
          approved_by: currentUser.id,
          approved_at: new Date().toISOString()
        };

        // Debug: log the profile data to ensure faculty_id is a string
        console.log('Creating profile with data:', profileData);
        console.log('faculty_id type:', typeof profileData.faculty_id);
        console.log('faculty_id value:', profileData.faculty_id);

        const { error: profileError } = await supabase
          .from('profiles')
          .insert([profileData]);

        if (profileError) {
          console.error('Failed to create teacher profile:', profileError);
          // Try to clean up the user account
          await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
          throw profileError;
        }

        // Log teacher creation
        await loggingService.logTeacherCreation(currentUser.id, newUser.user.id, {
          name: teacherData.name,
          email: teacherData.email,
          faculty_id: teacherData.faculty_id,
          department: teacherData.department
        });

        return {
          success: true,
          teacherId: newUser.user.id,
          error: `Teacher account created successfully! ${teacherData.name} can now sign in with email ${teacherData.email} and the provided password. They will be prompted to change their password on first login.`
        };

      } catch (createError) {
        console.error('Error creating teacher account:', createError);
        
        // Fallback: Log teacher creation request for manual processing
        await loggingService.logActivity(
          'teacher_creation_requested',
          {
            teacher_email: teacherData.email,
            teacher_name: teacherData.name,
            faculty_id: teacherData.faculty_id,
            department: teacherData.department,
            error: createError.message,
            instructions: 'Teacher creation failed, manual intervention required'
          },
          currentUser.id
        );

        return {
          success: false,
          error: `Failed to create teacher account: ${createError.message}. Please try again or create the account manually.`
        };
      }
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

      // Check if current user is super admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'super_admin') {
        return { success: false, error: 'Unauthorized: Super admin access required' };
      }

      // Update user status in auth
      const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
        ban_duration: active ? 'none' : '876000h' // Ban for 100 years if inactive
      });

      if (authError) {
        return { success: false, error: authError.message };
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

      // Check if current user is super admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'super_admin') {
        return { success: false, error: 'Unauthorized: Super admin access required' };
      }

      // Delete user from auth (this will cascade to profile due to foreign key)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);

      if (authError) {
        return { success: false, error: authError.message };
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

      // Verify super admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (!profile || profile.role !== 'super_admin') {
        return { success: false, error: 'Unauthorized: Super admin access required' };
      }

      // Get pending registration
      const { data: pendingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .eq('approval_status', 'pending')
        .single();

      if (fetchError || !pendingProfile) {
        return { success: false, error: 'Pending registration not found' };
      }

      // Get admin client
      const supabaseAdmin = getSupabaseAdmin();
      if (!supabaseAdmin) {
        return { 
          success: false, 
          error: 'Service role key not configured. Cannot approve registration.' 
        };
      }

      // Confirm the auth user (since registration creates unconfirmed users)
      const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
        profileId,
        { email_confirm: true }
      );

      if (confirmError) {
        return { success: false, error: 'Failed to confirm auth account: ' + confirmError.message };
      }

      // Update profile approval status
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          approval_status: 'approved',
          approved_by: currentUser.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', profileId);

      if (updateError) {
        return { success: false, error: 'Failed to update profile: ' + updateError.message };
      }

      // Log approval
      await loggingService.logActivity('student_approved', {
        approved_student_id: profileId,
        approved_student_email: pendingProfile.email,
        approved_student_name: pendingProfile.name
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