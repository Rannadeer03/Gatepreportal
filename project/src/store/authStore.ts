import { create } from 'zustand';
import { supabase, getSupabaseAdmin } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { loggingService } from '../services/loggingService';

interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin' | 'super_admin';
  registration_number?: string;
  faculty_id?: string;
  department?: string;
  requires_password_change?: boolean;
  auth_provider?: string;
  created_at: string;
  updated_at?: string;
  avatar_url?: string;
  phone_number?: string;
  bio?: string;
  linkedin_url?: string;
  github_url?: string;
  dob?: string;
  notification_preferences?: any;
  theme?: string;
  approval_status?: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  temp_password?: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerUser: (userData: RegisterData) => Promise<{ success: boolean; message: string }>;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: string;
  registration_number?: string;
  department?: string;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      set({
        user: null,
        profile: null,
        error: null
      });
    } catch (error: unknown) {
      console.error('Sign out error:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to sign out' });
    }
  },

  signInWithEmail: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });

      // Log the login attempt
      await loggingService.logActivity('login_attempt', { email });

      // Proceed with normal Supabase Auth authentication
      console.log('Attempting Supabase Auth sign in for:', email);
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('Supabase Auth error:', authError);
        throw new Error('Invalid email or password. Please try again.');
      }

      if (!authData.user) {
        throw new Error('No user data received');
      }

      // Get user profile
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        // If no profile found, create a basic one
        try {
          console.log('Creating profile for user:', authData.user.id);
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{
              id: authData.user.id,
              name: authData.user.user_metadata?.name || 'User',
              email: authData.user.email || email,
              role: authData.user.user_metadata?.role || 'student',
              auth_provider: 'email',
              approval_status: 'approved' // Default for backward compatibility
            }])
            .select()
            .single();

          if (createError) {
            console.error('Failed to create profile:', createError);
            
            // Check if it's an RLS recursion error
            if (createError.message && createError.message.includes('infinite recursion')) {
              throw new Error('System configuration error. Please contact support.');
            }
            
            // Check if it's a permission error
            if (createError.code === '42501') {
              throw new Error('Permission denied. Please contact support.');
            }
            
            throw new Error('Failed to create user profile. Please try registering again.');
          }

          profile = newProfile;
        } catch (error) {
          console.error('Profile creation error:', error);
          
          // If profile creation fails, try to sign out and provide clear error
          await supabase.auth.signOut();
          
          if (error instanceof Error && error.message.includes('System configuration error')) {
            throw error; // Re-throw system errors
          }
          
          throw new Error('Failed to create user profile. Please try registering again.');
        }
      }

      // Check approval status for non-super-admin users
      if (profile.role !== 'super_admin' && profile.approval_status === 'pending') {
        // Log the login attempt but deny access
        await loggingService.logActivity('login_denied_pending_approval', {
          user_id: authData.user.id,
          email: profile.email,
          role: profile.role
        }, authData.user.id);

        // Sign out the user
        await supabase.auth.signOut();
        
        throw new Error('⏳ Account Pending Approval\n\nYour account is still pending approval by an administrator. Please wait for approval before attempting to sign in.\n\nApproval typically takes 24-48 hours. You will receive an email notification once your account is approved.\n\nIf you have been waiting longer than expected, please contact support.');
      }

      if (profile.approval_status === 'rejected') {
        // Log the login attempt but deny access
        await loggingService.logActivity('login_denied_rejected', {
          user_id: authData.user.id,
          email: profile.email,
          role: profile.role,
          rejection_reason: profile.rejection_reason
        }, authData.user.id);

        // Sign out the user
        await supabase.auth.signOut();
        
        throw new Error('Access Denied: Your account has been rejected. Please contact support for assistance.');
      }

      // Log successful login
      await loggingService.logActivity('login_success', {
        user_id: authData.user.id,
        email: profile.email,
        role: profile.role
      }, authData.user.id);

      set({
        user: authData.user,
        profile: profile,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (error: unknown) {
      console.error('Email sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in with email';
      set({
        isLoading: false,
        error: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  },

  registerUser: async (userData: RegisterData) => {
    try {
      set({ isLoading: true, error: null });

      // Only allow student registration through public form
      if (userData.role !== 'student') {
        throw new Error('Only students can register through this form. Teachers are added by administrators.');
      }

      console.log('Starting registration for:', userData.email);

      // Check if email already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', userData.email)
        .maybeSingle();

      if (existingProfile) {
        throw new Error('An account with this email already exists. Please contact support if you need assistance.');
      }

      // Create Supabase Auth user first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: userData.role
          }
        }
      });

      if (authError) {
        console.error('Auth registration error:', authError);
        
        // Handle specific error cases
        if (authError.message?.includes('User already registered') || authError.message?.includes('already been registered')) {
          throw new Error('An account with this email already exists. Please try signing in instead, or use a different email address.');
        }
        
        if (authError.message?.includes('rate limit') || authError.message?.includes('Too Many Requests')) {
          throw new Error('Registration is temporarily limited due to high server load. Please try again in a few minutes.');
        }
        
        if (authError.message?.includes('password')) {
          throw new Error('Password does not meet requirements. Please use a stronger password.');
        }
        
        throw new Error('Failed to create account. Please try again.');
      }

      if (!authData.user) {
        throw new Error('Failed to create user account. Please try again.');
      }

      // Create profile with auth user ID
      const profileData = {
        id: authData.user.id, // Use auth user ID
        name: userData.name,
        email: userData.email,
        role: userData.role,
        registration_number: userData.registration_number,
        department: userData.department,
        auth_provider: 'email',
        approval_status: 'pending', // Requires admin approval
        created_at: new Date().toISOString()
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([profileData]);

      if (profileError) {
        console.error('Profile registration error:', profileError);
        // Clean up the auth user if profile creation fails
        const supabaseAdmin = getSupabaseAdmin();
        if (supabaseAdmin) {
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        }
        throw new Error('Failed to create user profile. Please try again.');
      }

      console.log('Registration successful - pending approval');

      // Sign out the user since they need approval
      await supabase.auth.signOut();

      // Clear auth state
      set({
        user: null,
        profile: null,
        error: null
      });

      const successMessage = '🎉 Registration Successful!\n\n⏳ Please wait 24 hours for your account to be activated.\n\n📧 You will receive an email notification once your account is ready.\n\n🚫 Do not attempt to sign in until you receive confirmation.';

      return {
        success: true,
        message: successMessage
      };

    } catch (error: unknown) {
      console.error('Registration error:', error);
      let errorMessage = error instanceof Error ? error.message : 'Error registering user';
      
      set({ error: errorMessage });
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      set({ isLoading: false });
    }
  },

  initialize: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Check current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.warn('Session error during initialization:', sessionError);
        // Don't throw, just clear the state
        set({ user: null, profile: null, error: null });
        return;
      }

      if (session?.user) {
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.warn('Profile error during initialization:', profileError);
          // Set user but no profile
          set({
            user: session.user,
            profile: null,
            error: null
          });
          return;
        }

        if (profile) {
          set({
            user: session.user,
            profile: profile,
            error: null
          });
        } else {
          // No profile found, clear user session
          set({
            user: null,
            profile: null,
            error: null
          });
        }
      } else {
        set({
          user: null,
          profile: null,
          error: null
        });
      }
    } catch (error: unknown) {
      console.error('Initialize error:', error);
      set({
        user: null,
        profile: null,
        error: error instanceof Error ? error.message : 'Failed to initialize'
      });
    } finally {
      set({ isLoading: false });
    }
  }
}));