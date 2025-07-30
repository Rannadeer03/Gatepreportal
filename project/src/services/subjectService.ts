import { supabase } from '../lib/supabase';

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  created_at?: string;
}

export const subjectService = {
  async getSubjects(): Promise<Subject[]> {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching subjects:', error);
      return [];
    }
    return data as Subject[];
  },

  async getSubjectById(id: string): Promise<Subject | null> {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching subject by id:', error);
      return null;
    }
    return data as Subject;
  }
};