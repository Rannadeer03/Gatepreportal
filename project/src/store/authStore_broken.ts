import { create } from 'zustand';
import { supabase } from '../lib/supabase';
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
  auth_provider?: 'email';
  created_at: string;
  updated_at: string;
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
  role: 'student' | 'teacher' | 'admin' | 'super_admin';
  registration_number?: string;
  faculty_id?: string;
  department?: string;
  verification_code?: string;
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
      set({ isLoading: true, error: null });
      
      // Log logout activity (but don't let it block logout)
      const { user } = useAuthStore.getState();
      if (user) {
        try {
          await loggingService.logLogout(user.id);
        } catch (logError) {
          console.warn('Failed to log logout activity:', logError);
          // Continue with logout even if logging fails
        }
      }
      
      // Always clear the state first
      set({ user: null, profile: null, error: null });
      
      // Try to sign out from Supabase, but don't let errors block the logout
      try {
        await supabase.auth.signOut();
      } catch (signOutError) {
        console.warn('Supabase signOut error (continuing anyway):', signOutError);
        // Even if Supabase signOut fails, we've already cleared the local state
      }
      
    } catch (error) {
      // Even if there's an error, clear the state to ensure user is logged out
      set({ user: null, profile: null, error: null });
      console.error('Error during sign out (state cleared anyway):', error);
    } finally {
      set({ isLoading: false });
    }
  },
  signInWithEmail: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // First, sign in to get the session
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // Log failed login attempt
        await loggingService.logActivity('login_failed', {
          email,
          error: authError.message,
          timestamp: new Date().toISOString()
        });

        if (authError.message === 'Email not confirmed') {
          throw new Error('Please check your email and click the confirmation link before signing in. If you haven\'t received the email, check your spam folder or try registering again.');
        }
        if (authError.message === 'Invalid login credentials') {
          throw new Error('Invalid email or password. Please try again.');
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error('No user data returned');
      }

      console.log('User authenticated successfully:', authData.user.id);

      // Get the current session to ensure we have a valid token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Failed to get authentication session. Please try again.');
      }

      if (!session) {
        throw new Error('No active session found. Please try logging in again.');
      }

      console.log('Session obtained successfully');

      // Fetch the user's profile with retry logic
      let profile = null;
      let profileError = null;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          const { data: profileData, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (fetchError) {
            console.error(`Profile fetch attempt ${retryCount + 1} failed:`, fetchError);
            profileError = fetchError;
            retryCount++;
            
            if (retryCount < maxRetries) {
              // Wait for 1 second before retrying
              await new Promise(resolve => setTimeout(resolve, 1000));
              continue;
            }
          } else {
            profile = profileData;
            break;
          }
        } catch (error) {
          console.error(`Profile fetch attempt ${retryCount + 1} failed with error:`, error);
          retryCount++;
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
        }
      }

      if (!profile) {
        console.error('Failed to fetch profile after retries:', profileError);
        
        // Try to create the profile if it doesn't exist
        try {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{
              id: authData.user.id,
              email: authData.user.email,
              name: authData.user.user_metadata?.name || 'User',
              role: authData.user.user_metadata?.role || 'student',
              auth_provider: 'email',
              requires_password_change: false,
              approval_status: 'approved' // Default for backward compatibility
            }])
            .select()
            .single();

          if (createError) {
            console.error('Failed to create profile:', createError);
            throw new Error('Failed to create user profile. Please try registering again.');
          }

          profile = newProfile;
        } catch (error) {
          console.error('Profile creation error:', error);
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
        
        throw new Error(`Your account has been rejected. Reason: ${profile.rejection_reason || 'No reason provided'}`);
      }

      // Log successful login
      await loggingService.logLogin(authData.user.id, true);

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

      console.log('Starting profile-only registration for:', userData.email);

      // Check if email already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', userData.email)
        .maybeSingle();

      if (existingProfile) {
        throw new Error('An account with this email already exists. Please contact support if you need assistance.');
      }

      // Create profile directly (no Supabase Auth needed)
      const profileData = {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        registration_number: userData.registration_number,
        department: userData.department,
        auth_provider: 'pending', // Indicates no auth user yet
        approval_status: 'pending',
        temp_password: userData.password, // Store temporarily for admin approval
        created_at: new Date().toISOString()
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([profileData]);

      if (profileError) {
        console.error('Profile registration error:', profileError);
        throw new Error('Failed to create registration request. Please try again.');
      }

      console.log('Profile-only registration successful');

      // Clear auth state
      set({
        user: null,
        profile: null,
        error: null
      });

      const successMessage = '🎉 Registration Successful! Your account request has been submitted.\n\n⏳ Your account is pending approval by an administrator. Please wait for approval before attempting to sign in.\n\n📧 You will receive an email notification once approved (usually within 24-48 hours).\n\n🚫 Do not attempt to sign in until you receive approval confirmation.';

      return {
        success: true,
        message: successMessage
      };

      // Try to sign up the user with Supabase Auth
      try {
        const { data, error } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              name: userData.name,
              role: userData.role
            }
          }
        });

        if (error) {
          authError = error;
          console.error('Supabase auth signup error:', error);
          
          // Check if it's a rate limit error
          if (error.message.includes('rate limit') || error.message.includes('Too Many Requests')) {
            console.log('Rate limit hit, will create profile without auth user');
            // Continue without userId - we'll create a profile-only registration
          } else if (error.message.includes('confirmation email') || error.message.includes('Error sending')) {
            console.log('Email confirmation failed, but user may have been created...');
            // Check if user was created despite email error
            if (data.user) {
              userId = data.user.id;
              console.log('User was created despite email error, user ID:', userId);
            }
          } else {
            // For other critical errors, throw them
            throw error;
          }
        } else if (data.user) {
          userId = data.user.id;
          console.log('Auth signup successful, user ID:', userId);
        }
      } catch (signupError: any) {
        console.error('Auth signup failed:', signupError);
        authError = signupError;
        
        // If it's a rate limit error, continue with profile-only registration
        if (signupError.message?.includes('rate limit') || signupError.message?.includes('Too Many Requests')) {
          console.log('Rate limit detected, proceeding with profile-only registration');
        } else {
          throw signupError;
        }
      }

      // If no userId but we had an email-related error, skip the sign-in check
      // Since email confirmation is required, the user won't be able to sign in yet
      if (!userId && authError && (
        authError.message?.includes('confirmation email') ||
        authError.message?.includes('Error sending') ||
        authError.message?.includes('rate limit')
      )) {
        console.log('Email confirmation required or rate limited, creating profile for manual approval');
        // Don't attempt sign-in as it will fail with unconfirmed email
        
        // Show user-friendly message
        if (authError.message?.includes('confirmation email') || authError.message?.includes('Error sending')) {
          console.log('Registration will proceed without auth user, profile-only registration');
        }
      }

      // Handle profile creation based on whether we have a valid userId
      if (userId) {
        // Normal case: we have a user ID from successful auth signup
        const profileData: Record<string, unknown> = {
          id: userId,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          auth_provider: 'email',
          requires_password_change: false,
          approval_status: 'pending' // Students need approval
        };

        if (userData.role === 'student' && userData.registration_number) {
          profileData.registration_number = userData.registration_number;
        }
        if (userData.department) {
          profileData.department = userData.department;
        }

        console.log('Creating profile with auth user ID:', profileData);

        const { error: profileError } = await supabase
          .from('profiles')
          .insert([profileData]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Don't throw error if it's just a duplicate - user might already exist
          if (!profileError.message.includes('duplicate') && !profileError.message.includes('already exists')) {
            throw profileError;
          } else {
            console.log('Profile already exists, registration considered successful');
          }
        }
      } else if (authError && (
        authError.message?.includes('rate limit') ||
        authError.message?.includes('Too Many Requests')
      )) {
        // Rate limit case: create a pending registration record instead of profile
        console.log('Creating pending registration due to rate limit');
        
        const pendingRegistrationData = {
          email: userData.email,
          name: userData.name,
          role: userData.role,
          registration_number: userData.registration_number,
          department: userData.department,
          password_hash: userData.password, // Store temporarily - will be hashed when user is created
          status: 'rate_limited',
          created_at: new Date().toISOString()
        };

        // Try to create a pending registration record
        try {
          const { error: pendingError } = await supabase
            .from('pending_registrations')
            .insert([pendingRegistrationData]);

          if (pendingError) {
            console.error('Pending registration creation error:', pendingError);
            // If pending_registrations table doesn't exist, just log the registration attempt
            console.log('Fallback: Logging registration attempt for manual processing');
          } else {
            console.log('Pending registration created successfully');
          }
        } catch (pendingRegError) {
          console.warn('Could not create pending registration, continuing anyway:', pendingRegError);
        }
      }

      // Log the registration if we have a user ID
      if (userId) {
        try {
          await loggingService.logRegistration(userId, userData.role);
        } catch (logError) {
          console.warn('Failed to log registration, but continuing:', logError);
        }
      }

      // Don't sign in the user automatically - they need approval first
      set({
        user: null,
        profile: null,
        error: null
      });

      // Provide appropriate success message based on the situation
      let successMessage = '🎉 Registration Successful! Your account has been created and is pending approval by an administrator.';
      
      if (authError?.message?.includes('rate limit')) {
        successMessage += '\n\n📧 Note: Due to high server load, email verification is temporarily disabled. You can sign in once your account is approved.';
      } else {
        successMessage += '\n\n📧 You will receive an email notification once your account is approved and you can sign in.';
      }
      
      successMessage += '\n\n⏳ Please wait for administrator approval before attempting to sign in. This usually takes 24-48 hours.';

      return {
        success: true,
        message: successMessage
      };

    } catch (error: unknown) {
      console.error('Registration error:', error);
      let errorMessage = error instanceof Error ? error.message : 'Error registering user';
      
      // Provide user-friendly error messages
      if (errorMessage.includes('rate limit') || errorMessage.includes('Too Many Requests')) {
        errorMessage = 'Registration is temporarily limited due to high server load. Please try again in a few minutes, or contact support if the issue persists.';
      }
      
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
            profile,
            error: null
          });
        } else {
          set({
            user: session.user,
            profile: null,
            error: null
          });
        }
      } else {
        // No session, ensure state is cleared
        set({
          user: null,
          profile: null,
          error: null
        });
      }
    } catch (error: unknown) {
      console.error('Auth initialization error:', error);
      // Clear state on any error
      set({
        user: null,
        profile: null,
        error: null
      });
    } finally {
      set({ isLoading: false });
    }
  }
}));