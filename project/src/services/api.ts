import { supabase } from '../lib/supabase';
import { API_BASE_URL } from '../config';
import { Question } from './supabaseApi';

interface ProfileData {
  name: string;
  email: string;
  role: 'student' | 'teacher';
  registration_number?: string;
  faculty_id?: string;
  department?: string;
}

// Types
// Re-export from supabaseApi for consistency


export interface Subject {
  id: string;
  name: string;
  code: string;
  teacher_id: string;
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  subject_id: string;
  title: string;
  description: string;
  due_date: string;
  file_path: string;
  filename: string;
  created_at: string;
  updated_at: string;
  subject?: {
    name: string;
    code: string;
  };
}

export interface StudyMaterial {
  folder: string;
  subfolders: string[];
  files: string[];
}

export interface CourseMaterial {
  id: string;
  subject_id: string;
  title: string;
  description: string;
  materialType: string;
  filename: string;
  stored_filename: string;
  path: string;
  file_path?: string;
  subject_name: string;
  subject_code: string;
  upload_date: string;
  file_type: string;
}

export interface Test {
  id: string;
  title: string;
  subject: string;
  duration: number;
  questions: Question[];
  participants?: string[];
  test_schedule?: {
    is_scheduled: boolean;
    scheduled_date: string;
    scheduled_time: string;
    time_limit: number;
    allow_late_submissions: boolean;
    access_window: {
      start: string;
      end: string;
    };
  };
  difficulty_distribution?: {
    easy: number;
    medium: number;
    hard: number;
  };
  target_ratio?: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export const authService = {
  async createProfile(data: ProfileData) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return profile;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  },

  async updateProfile(id: string, data: Partial<ProfileData>) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return profile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  async getProfile(id: string) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }
};

// API Service
export const api = {
  baseUrl: API_BASE_URL,

  // Subjects
  async addSubject(subject: Omit<Subject, 'id' | 'teacher_id' | 'created_at' | 'updated_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('subjects')
      .insert([{
        name: subject.name,
        code: subject.code,
        teacher_id: user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getSubjects() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get subjects assigned to this teacher OR subjects without teacher_id (available to all teachers)
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .or(`teacher_id.eq.${user.id},teacher_id.is.null`);

    if (error) throw error;
    return data;
  },

  async deleteSubject(subjectId: string) {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', subjectId);

    if (error) throw error;
    return { success: true };
  },

  async deleteAllSubjects() {
    try {
      const subjects = await this.getSubjects();
      const deletePromises = subjects.map((subject: Subject) => this.deleteSubject(subject.id));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting subjects:', error);
      throw new Error('Failed to delete all subjects');
    }
  },

  // Questions
  async addQuestion(question: Question) {
    const response = await fetch(`${API_BASE_URL}/teacher/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(question),
    });
    return response.json();
  },

  async updateQuestion(questionId: string, updates: Partial<Question>) {
    const response = await fetch(`${API_BASE_URL}/teacher/questions/${questionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    return response.json();
  },

  async deleteQuestion(questionId: string) {
    const response = await fetch(`${API_BASE_URL}/teacher/questions/${questionId}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  async getQuestions() {
    const response = await fetch(`${API_BASE_URL}/student/questions`);
    return response.json();
  },

  async getQuestionsBySubject(subjectId: string) {
    const response = await fetch(`${API_BASE_URL}/student/questions/${subjectId}`);
    return response.json();
  },

  // Assignments
  async uploadAssignment(
    subjectId: string,
    title: string,
    description: string,
    dueDate: string,
    file: File,
    mode: 'academic' | 'gate' = 'gate'
  ): Promise<Assignment> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only PDF and Word documents are allowed');
    }
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      throw new Error('File size should not exceed 10MB');
    }
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileName = `${timestamp}_${randomId}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      const bucket = mode === 'academic' ? 'academic_assignments' : 'assignments';
      const table = mode === 'academic' ? 'academic_assignments' : 'assignments';
      
      console.log('Uploading to bucket:', bucket);
      console.log('File path:', filePath);
      
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }
      // Create assignment record
      console.log('Creating assignment record in table:', table);
      const { data, error } = await supabase
        .from(table)
        .insert([{
          subject_id: subjectId,
          title,
          description,
          due_date: dueDate,
          file_path: filePath,
          filename: file.name
        }])
        .select(`*, subject:subjects(name, code)`)
        .single();
      if (error) {
        console.error('Database insertion error:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Upload error:', error);
      throw error instanceof Error ? error : new Error('Failed to upload assignment');
    }
  },

  async getAssignments(mode: 'academic' | 'gate' = 'gate') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    // Get subjects assigned to this teacher OR subjects without teacher_id (available to all teachers)
    const { data: teacherSubjects, error: teacherSubjectsError } = await supabase
      .from('subjects')
      .select('id')
      .or(`teacher_id.eq.${user.id},teacher_id.is.null`);
    
    if (teacherSubjectsError) {
      console.error('Error fetching teacher subjects:', teacherSubjectsError);
      throw teacherSubjectsError;
    }
    
    const subjectIds = teacherSubjects.map((s: { id: string }) => s.id);
    if (subjectIds.length === 0) return [];
    
    const table = mode === 'academic' ? 'academic_assignments' : 'assignments';
    const { data: assignments, error: assignmentsError } = await supabase
      .from(table)
      .select(`*, subject:subjects(name, code)`)
      .in('subject_id', subjectIds);
    if (assignmentsError) throw assignmentsError;
    return assignments;
  },

  async getAssignmentsBySubject(subjectId: string, mode: 'academic' | 'gate' = 'gate') {
    const table = mode === 'academic' ? 'academic_assignments' : 'assignments';
    const { data, error } = await supabase
      .from(table)
      .select(`*, subject:subjects(name, code)`)
      .eq('subject_id', subjectId);
    if (error) throw error;
    return data;
  },

  async deleteAssignment(assignmentId: string, mode: 'academic' | 'gate' = 'gate') {
    const table = mode === 'academic' ? 'academic_assignments' : 'assignments';
    const bucket = mode === 'academic' ? 'academic_assignments' : 'assignments';
    // First get the assignment to get the file path
    const { data: assignment, error: fetchError } = await supabase
      .from(table)
      .select('file_path')
      .eq('id', assignmentId)
      .single();
    if (fetchError) throw fetchError;
    // Delete the file from storage
    if (assignment?.file_path) {
      const { error: deleteFileError } = await supabase.storage
        .from(bucket)
        .remove([assignment.file_path]);
      if (deleteFileError) throw deleteFileError;
    }
    // Delete the assignment record
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', assignmentId);
    if (error) throw error;
    return { success: true };
  },

  // Student Assignment Views
  async getStudentAssignments(mode: 'academic' | 'gate' = 'gate') {
    const table = mode === 'academic' ? 'academic_assignments' : 'assignments';
    const { data, error } = await supabase
      .from(table)
      .select(`*, subject:subjects(name, code)`);
    if (error) throw error;
    return data;
  },

  async getStudentAssignmentsBySubject(subjectId: string, mode: 'academic' | 'gate' = 'gate') {
    const table = mode === 'academic' ? 'academic_assignments' : 'assignments';
    const { data, error } = await supabase
      .from(table)
      .select(`*, subject:subjects(name, code)`)
      .eq('subject_id', subjectId);
    if (error) throw error;
    return data;
  },

  // Study Materials
  async createStudyMaterialFolder(folderName: string) {
    const response = await fetch(`${API_BASE_URL}/teacher/study-material/folders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ folder_name: folderName }),
    });
    return response.json();
  },

  async uploadStudyMaterial(subject: string, file: File) {
    const formData = new FormData();
    formData.append('subject', subject);
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/teacher/study-material/upload`, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  },

  async deleteStudyMaterialFolder(folderName: string) {
    const response = await fetch(`${API_BASE_URL}/teacher/study-material/folders/${folderName}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  async getStudyMaterials() {
    const response = await fetch(`${API_BASE_URL}/student/study-material`);
    return response.json();
  },

  async uploadCourseMaterial(
    subject_id: string,
    title: string,
    description: string,
    materialType: string,
    file: File,
    mode: 'academic' | 'gate' = 'gate'
  ): Promise<CourseMaterial> {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'video/mp4',
      'video/webm'
    ];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only PDF, Word, PowerPoint, and video files are allowed');
    }
    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    if (file.size > maxSize) {
      throw new Error('File size should not exceed 100MB');
    }
    try {
      // Get subject details
      const { data: subject, error: subjectError } = await supabase
        .from('subjects')
        .select('name, code')
        .eq('id', subject_id)
        .single();
      if (subjectError) throw subjectError;
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const bucket = mode === 'academic' ? 'academic_course_materials' : 'course_materials';
      const table = mode === 'academic' ? 'academic_course_materials' : 'course_materials';
      const filePath = `${bucket}/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      if (uploadError) throw uploadError;
      // Create course material record
      const { data: material, error: insertError } = await supabase
        .from(table)
        .insert([{
          subject_id,
          title,
          description,
          material_type: materialType,
          filename: file.name,
          stored_filename: fileName,
          path: filePath,
          subject_name: subject.name,
          subject_code: subject.code,
          file_type: file.type
        }])
        .select()
        .single();
      if (insertError) throw insertError;
      return material;
    } catch (error) {
      console.error('Upload error:', error);
      throw error instanceof Error ? error : new Error('Failed to upload course material');
    }
  },

  async getCourseMaterialsBySubject(subject_id: string, mode: 'academic' | 'gate' = 'gate'): Promise<CourseMaterial[]> {
    const table = mode === 'academic' ? 'academic_course_materials' : 'course_materials';
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('subject_id', subject_id);
    if (error) throw error;
    return data;
  },

  async downloadCourseMaterial(materialPath: string): Promise<Blob> {
    const { data, error } = await supabase.storage
      .from('course-materials')
      .download(materialPath);

    if (error) throw error;
    return data;
  },

  async getStudentCourseMaterials(subject_id: string): Promise<CourseMaterial[]> {
    const { data, error } = await supabase
      .from('course_materials')
      .select('*')
      .eq('subject_id', subject_id);

    if (error) throw error;
    return data;
  },

  async deleteCourseMaterial(materialId: string, mode: 'academic' | 'gate' = 'gate'): Promise<void> {
    const table = mode === 'academic' ? 'academic_course_materials' : 'course_materials';
    const bucket = mode === 'academic' ? 'academic_course_materials' : 'course_materials';
    // First get the material to get the file path
    const { data: material, error: fetchError } = await supabase
      .from(table)
      .select('path')
      .eq('id', materialId)
      .single();
    if (fetchError) throw fetchError;
    // Delete the file from storage
    if (material?.path) {
      const { error: deleteFileError } = await supabase.storage
        .from(bucket)
        .remove([material.path]);
      if (deleteFileError) throw deleteFileError;
    }
    // Delete the material record
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', materialId);
    if (error) throw error;
  },

  async createTest(testData: Omit<Test, 'id'>): Promise<Test> {
    const response = await fetch(`${API_BASE_URL}/teacher/tests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    if (!response.ok) {
      throw new Error('Failed to create test');
    }
    return response.json();
  },

  async updateTest(testId: string, testData: Partial<Test>): Promise<Test> {
    const response = await fetch(`${API_BASE_URL}/teacher/tests/${testId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    if (!response.ok) {
      throw new Error('Failed to update test');
    }
    return response.json();
  },

  // New function to get ALL assignments for teacher review
  async getAllAssignmentsForTeacher(mode: 'academic' | 'gate' = 'gate') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const table = mode === 'academic' ? 'academic_assignments' : 'assignments';
    // Get all assignments with subject information
    const { data: assignments, error: assignmentsError } = await supabase
      .from(table)
      .select(`*, subject:subjects(name, code)`)
      .order('created_at', { ascending: false });
    if (assignmentsError) throw assignmentsError;
    return assignments || [];
  },
};