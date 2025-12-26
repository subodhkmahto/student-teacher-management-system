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

    // Frontend login
    login: async (email, password) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          if (error.message.toLowerCase().includes('confirm')) {
            throw new Error(
              'Your email is not verified. Please check your inbox and confirm your email.'
            );
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
      } catch (error) {
        throw new Error(error.message);
      }
    },

    // Frontend registration
    register: async (email, password, fullName, role) => {
      try {
        const redirectUrl =
          window.location.hostname === 'localhost'
            ? 'http://localhost:5173/'
            : 'https://student-teacher-management-system-nine.vercel.app/';

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName,
              role
            }
          }
        });

        if (error) {
          if (
            error.message.toLowerCase().includes('already') ||
            error.status === 422
          ) {
            throw new Error('You are already registered. Please login.');
          }
          throw error;
        }

        return true;
      } catch (error) {
        throw new Error(error.message);
      }
    },

    // Logout
    logout: async () => {
      console.log('Logging out user');
      try {
        await supabase.auth.signOut();
        set({
          user: null,
          session: null,
          role: null,
          loading: false
        });
      } catch (error) {
        console.error('Logout error:', error.message);
      }
    },

    resendVerificationEmail: async (email) => {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      });

      if (error) {
        throw new Error(error.message);
      }

      return true;
    }
   ,
    // Restore session on page load
    initAuth: async () => {
      try {
        const {
          data: { session }
        } = await supabase.auth.getSession();

        if (session?.user) {
          const user = session.user;

          // Check profile exists or not
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (profileError) throw profileError;

          // Create profile ONLY if not exists
          if (!profileData) {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
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
          update(state => ({
            ...state,
            loading: false
          }));
        }
      } catch (error) {
        update(state => ({
          ...state,
          loading: false
        }));
      }
    }
  };
}

// Optional helper to initialize on app start
export async function initAuth() {
  await authStore.initAuth();
}
