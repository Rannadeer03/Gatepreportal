import { supabase } from '../lib/supabase';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'assignment' | 'test' | 'submission' | 'grade' | 'course_material' | 'test_completion' | 'general';
  related_id?: string;
  is_read: boolean;
  created_at: string;
}

export const notificationService = {
  // Create notification for new assignment
  async createAssignmentNotification(assignmentId: string, assignmentTitle: string, subjectName: string) {
    try {
      // Get all students to notify them about the new assignment
      const { data: students, error: studentsError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'student');

      if (studentsError) throw studentsError;

      // Create notifications for all students
      const notifications = students.map(student => ({
        user_id: student.id,
        title: 'New Assignment Posted',
        message: `A new assignment "${assignmentTitle}" has been posted for ${subjectName}.`,
        type: 'assignment' as const,
        related_id: assignmentId
      }));

      if (notifications.length > 0) {
        const { error: insertError } = await supabase
          .from('notifications')
          .insert(notifications);

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error creating assignment notification:', error);
    }
  },

  // Create notification for new test
  async createTestNotification(testId: string, testTitle: string, subjectName: string) {
    try {
      // Get all students to notify them about the new test
      const { data: students, error: studentsError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'student');

      if (studentsError) throw studentsError;

      // Create notifications for all students
      const notifications = students.map(student => ({
        user_id: student.id,
        title: 'New Test Available',
        message: `A new test "${testTitle}" is now available for ${subjectName}.`,
        type: 'test' as const,
        related_id: testId
      }));

      if (notifications.length > 0) {
        const { error: insertError } = await supabase
          .from('notifications')
          .insert(notifications);

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error creating test notification:', error);
    }
  },

  // Create notification for assignment submission (for teachers)
  async createSubmissionNotification(assignmentId: string, assignmentTitle: string, studentName: string) {
    try {
      // Get all teachers to notify them about the new submission
      const { data: teachers, error: teachersError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'teacher');

      if (teachersError) throw teachersError;

      // Create notifications for all teachers
      const notifications = teachers.map(teacher => ({
        user_id: teacher.id,
        title: 'New Assignment Submission',
        message: `${studentName} has submitted an assignment for "${assignmentTitle}".`,
        type: 'submission' as const,
        related_id: assignmentId
      }));

      if (notifications.length > 0) {
        const { error: insertError } = await supabase
          .from('notifications')
          .insert(notifications);

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error creating submission notification:', error);
    }
  },

  // Create notification for graded assignment (for students)
  async createGradeNotification(studentId: string, assignmentTitle: string, grade: number) {
    try {
      const { error: insertError } = await supabase
        .from('notifications')
        .insert({
          user_id: studentId,
          title: 'Assignment Graded',
          message: `Your assignment "${assignmentTitle}" has been graded. You received ${grade}/100.`,
          type: 'grade' as const
        });

      if (insertError) throw insertError;
    } catch (error) {
      console.error('Error creating grade notification:', error);
    }
  },

  // Create notification for new course material (for students)
  async createCourseMaterialNotification(materialId: string, materialTitle: string, subjectName: string) {
    try {
      // Get all students to notify them about the new course material
      const { data: students, error: studentsError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'student');

      if (studentsError) throw studentsError;

      // Create notifications for all students
      const notifications = students.map(student => ({
        user_id: student.id,
        title: 'New Course Material Available',
        message: `New course material "${materialTitle}" has been uploaded for ${subjectName}.`,
        type: 'course_material' as const,
        related_id: materialId
      }));

      if (notifications.length > 0) {
        const { error: insertError } = await supabase
          .from('notifications')
          .insert(notifications);

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error creating course material notification:', error);
    }
  },

  // Create notification for test completion (for teachers)
  async createTestCompletionNotification(testId: string, testTitle: string, studentName: string, score: number, totalQuestions: number) {
    try {
      // Get all teachers to notify them about the test completion
      const { data: teachers, error: teachersError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'teacher');

      if (teachersError) throw teachersError;

      // Create notifications for all teachers
      const notifications = teachers.map(teacher => ({
        user_id: teacher.id,
        title: 'Test Completed',
        message: `${studentName} has completed the test "${testTitle}" with a score of ${score}/${totalQuestions}.`,
        type: 'test_completion' as const,
        related_id: testId
      }));

      if (notifications.length > 0) {
        const { error: insertError } = await supabase
          .from('notifications')
          .insert(notifications);

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error creating test completion notification:', error);
    }
  },

  // Get user's notifications
  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  // Mark notification as read
  async markAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  },

  // Get unread count for a user
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
}; 