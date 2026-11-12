import { create } from 'zustand';
import { supabase } from '@services/supabase';
import type { User } from '@types/index';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
  setUser: (user: User | null) => void;
  setIsLoading: (loading: boolean) => void;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  restoreSession: () => Promise<void>;
}

function mapSupabaseUserToUser(supabaseUser: any): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    username: supabaseUser.user_metadata?.username || '',
    avatar_url: supabaseUser.user_metadata?.avatar_url,
    language: supabaseUser.user_metadata?.language || 'en',
    dialect: supabaseUser.user_metadata?.dialect,
    created_at: supabaseUser.created_at || new Date().toISOString(),
    updated_at: supabaseUser.updated_at || new Date().toISOString(),
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isSignedIn: false,

  setUser: (user) => set({ user, isSignedIn: user !== null }),
  setIsLoading: (isLoading) => set({ isLoading }),

  signUp: async (email: string, password: string, username: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            language: 'en',
          },
        },
      });

      if (error) throw error;
      if (data.user) {
        set({ user: mapSupabaseUserToUser(data.user), isSignedIn: true });
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (data.user) {
        set({ user: mapSupabaseUserToUser(data.user), isSignedIn: true });
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, isSignedIn: false });
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  resetPassword: async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'writego://reset-password',
      });
      if (error) throw error;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  },

  restoreSession: async () => {
    set({ isLoading: true });
    try {
      if (!supabase) {
        console.warn('Supabase not initialized. Running in offline mode.');
        set({ isSignedIn: false });
        return;
      }

      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.warn('Session restore warning:', error);
        set({ isSignedIn: false });
        return;
      }

      if (data.session?.user) {
        set({ user: mapSupabaseUserToUser(data.session.user), isSignedIn: true });
      } else {
        set({ isSignedIn: false });
      }
    } catch (error) {
      console.error('Session restore error:', error);
      set({ isSignedIn: false });
    } finally {
      set({ isLoading: false });
    }
  },
}));
