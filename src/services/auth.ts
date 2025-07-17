import { supabase } from '../lib/supabase';
import { User } from '../types';

export const authService = {
  // Sign up new user
  async signUp(email: string, password: string, userData: { name: string; phone: string }) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // Create user profile
     const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .insert({
          auth_id: authData.user.id,
          name: userData.name,
          email,
          phone: userData.phone,
          is_admin: email === 'admin@sportbook.com'
        })
        .select()
        .single();

      if (profileError) throw profileError;

      return {
        user: authData.user,
        profile: userProfile
      };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  },

  // Sign in user
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('Failed to sign in');

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', data.user.id)
        .single();

      if (profileError) throw profileError;

      return {
        user: data.user,
        profile
      };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  // Sign out user
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', user.id)
        .single();

      if (error) throw error;

      return {
        user,
        profile
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  // Listen to auth changes
  onAuthStateChange(callback: (user: any, profile: any) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', session.user.id)
          .single();
        
        callback(session.user, profile);
      } else {
        callback(null, null);
      }
    });
  }
};