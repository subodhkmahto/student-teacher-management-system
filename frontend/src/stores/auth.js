// src/stores/auth.js
import { writable } from 'svelte/store';
import { supabase } from '../lib/supabase';

export const authStore = createAuthStore();

function createAuthStore() {
  const { subscribe, set, update } = writable({
    user: null,
    session: null,
    role: null,
    profile: null, //  Added profile
    loading: true
  });

  let authListener = null;

  return {
    subscribe,

    //  Login with profile fetch
    login: async (email, password) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });
        
        if (error) {
          if (error.message.toLowerCase().includes('confirm')) {
            throw new Error('Your email is not verified. Please check your inbox.');
          }
          throw error;
        }

        // Fetch profile after login
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role, full_name, email')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;

        console.log(' Login successful:', {
          user: data.user.email,
          role: profileData?.role
        });

        update(state => ({
          ...state,
          user: data.user,
          session: data.session,
          role: profileData?.role || null,
          profile: profileData || null,
          loading: false
        }));

        return { success: true };
      } catch (err) {
        console.error(' Login error:', err);
        throw err;
      }
    },

    //  Register
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

        console.log(' Registration successful');
        return { success: true };
      } catch (err) {
        console.error(' Registration error:', err);
        throw err;
      }
    },

    //  Logout
    logout: async () => {
      try {
        await supabase.auth.signOut();
        set({ 
          user: null, 
          session: null, 
          role: null, 
          profile: null, 
          loading: false 
        });
      } catch (err) {
        console.error('Logout error:', err.message);
      }
    },

    //  Forgot password
    forgotPassword: async (email) => {
      try {
        const redirectUrl =
          window.location.hostname === 'localhost'
            ? 'http://localhost:5173/reset-password'
            : 'https://student-teacher-management-system-nine.vercel.app/reset-password';

        const { error } = await supabase.auth.resetPasswordForEmail(email, { 
          redirectTo: `${redirectUrl}`
          
        });
        
        if (error) throw error;
        
        console.log(' Password reset email sent');
        return { success: true };
      } catch (err) {
        console.error(' Forgot password error:', err);
        throw err;
      }
    },

    //  Update password (for reset password page)
    updatePassword: async (newPassword) => {
      try {
        const { data, error } = await supabase.auth.updateUser({
          password: newPassword
        });
        
        if (error) throw error;
        
        console.log(' Password updated successfully');
        return { success: true };
      } catch (err) {
        console.error(' Update password error:', err);
        throw err;
      }
    },

    //  Resend verification email
    resendVerificationEmail: async (email) => {
      try {
        const { error } = await supabase.auth.resend({ 
          type: 'signup', 
          email 
        });
        
        if (error) throw error;
        
        console.log(' Verification email resent');
        return { success: true };
      } catch (err) {
        console.error(' Resend verification error:', err);
        throw err;
      }
    },

    //  Initialize auth
    initAuth: async () => {
      try {
        
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const user = session.user;

          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role, full_name, email')
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

          console.log(' Auth initialized:', {
            user: user.email,
            role: profileData?.role
          });

          update(state => ({
            ...state,
            user,
            session,
            role: profileData?.role || user.user_metadata?.role || null,
            profile: profileData || null,
            loading: false
          }));
        } else {
          update(state => ({ ...state, loading: false }));
        }

        // Auth state listener
        if (!authListener) {
          const { data: authData } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth event:', event);

            if (event === 'SIGNED_IN' && session) {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('role, full_name, email')
                .eq('id', session.user.id)
                .maybeSingle();

              update(state => ({
                ...state,
                user: session.user,
                session: session,
                role: profileData?.role || session.user.user_metadata?.role || null,
                profile: profileData || null,
                loading: false
              }));
            }

            if (event === 'TOKEN_REFRESHED' && session) {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('role, full_name, email')
                .eq('id', session.user.id)
                .maybeSingle();

              update(state => ({
                ...state,
                user: session.user,
                session: session,
                role: profileData?.role || session.user.user_metadata?.role || null,
                profile: profileData || null,
                loading: false
              }));
            }

            if (event === 'SIGNED_OUT') {
              set({ 
                user: null, 
                session: null, 
                role: null, 
                profile: null, 
                loading: false 
              });
            }
          });

          authListener = authData.subscription;
        }
      } catch (err) {
        console.error('Auth initialization error:', err.message);
        update(state => ({ ...state, loading: false }));
      }
    },

    //  Set profile manually
    setProfile(profile) {
      update(state => ({
        ...state,
        profile
      }));
    }
  };
}

// Helper to call on app start
export async function initAuth() {
  await authStore.initAuth();
}