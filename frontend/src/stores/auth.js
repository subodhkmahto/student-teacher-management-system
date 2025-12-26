// src/stores/auth.js
import { writable } from 'svelte/store';
import { supabase } from '../lib/supabase';

export const authStore = createAuthStore();

function createAuthStore() {
  const { subscribe, set, update } = writable({
    user: null,
    session: null,
    role: null,
    loading: true
  });

  return {
    subscribe,

    // Login
    login: async (email, password) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.toLowerCase().includes('confirm')) {
            throw new Error('Your email is not verified. Please check your inbox.');
          }
          throw error;
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        if (profileError) throw profileError;

        update(state => ({
          ...state,
          user: data.user,
          session: data.session,
          role: profileData?.role || null
        }));

        return true;
      } catch (err) {
        throw new Error(err.message);
      }
    },

    // Register
    register: async (email, password, fullName, role) => {
      try {
        const redirectUrl =
          window.location.hostname === 'localhost'
            ? 'http://localhost:5173/login'
            : 'https://student-teacher-management-system-nine.vercel.app/login';

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: { full_name: fullName, role }
          }
        });

        if (error) {
          if (error.message.toLowerCase().includes('already') || error.status === 422) {
            throw new Error('You are already registered. Please login.');
          }
          throw error;
        }

        return true;
      } catch (err) {
        throw new Error(err.message);
      }
    },

    // Logout
    logout: async () => {
      try {
        await supabase.auth.signOut();
        set({ user: null, session: null, role: null, loading: false });
      } catch (err) {
        console.error('Logout error:', err.message);
      }
    },

    // Forgot password
    forgotPassword: async (email) => {
      const redirectUrl =
        window.location.hostname === 'localhost'
          ? 'http://localhost:5173/reset-password'
          : 'https://student-teacher-management-system-nine.vercel.app/reset-password';

      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl });
      if (error) throw error;
      return true;
    },

    // Update password using token
    updatePassword: async (accessToken, newPassword) => {
      try {
        const { data, error } = await supabase.auth.updateUser(
          { password: newPassword },
          { accessToken }
        );
        if (error) throw error;
        return data;
      } catch (err) {
        throw new Error(err.message);
      }
    },

    // Resend verification email
    resendVerificationEmail: async (email) => {
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) throw new Error(error.message);
      return true;
    },

    // Initialize auth
    initAuth: async () => {
      try {
        if (window.location.pathname === '/reset-password') {
          update(state => ({ ...state, loading: false }));
          return;
        }
        
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const user = session.user;

          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
          if (profileError) throw profileError;

          if (!profileData) {
            const { error: insertError } = await supabase.from('profiles').insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || '',
              role: user.user_metadata?.role || 'student'
            });
            if (insertError) throw insertError;
          }

          update(state => ({
            ...state,
            user,
            session,
            role: profileData?.role || user.user_metadata?.role || null,
            loading: false
          }));
        } else {
          update(state => ({ ...state, loading: false }));
        }
      } catch (err) {
        console.error('Auth initialization error:', err.message);
        update(state => ({ ...state, loading: false }));
      }
    }
  };
}

// Helper to call on app start
export async function initAuth() {
  await authStore.initAuth();
}
