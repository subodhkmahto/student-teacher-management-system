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

    //  Frontend login
    login: async (email, password) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;

        // Fetch user profile from "profiles" table
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

    //  Frontend registration
    register: async (email, password, fullName, role) => {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, role }
          }
        });
        if (error) throw error;

        // Optionally, insert into your "profiles" table
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email,
          full_name: fullName,
          role
        });
        if (profileError) throw profileError;

        return true;
      } catch (error) {
        throw new Error(error.message);
      }
    },

    //  Logout
    logout: async () => {
      try {
        await supabase.auth.signOut();
        set({ user: null, session: null, role: null, loading: false });
      } catch (error) {
        console.error('Logout error:', error.message);
      }
    },

    //  Restore session on page load
    initAuth: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
            // .single();
          if (profileError) throw profileError;

          update(state => ({
            ...state,
            user: session.user,
            session,
            role: profileData?.role || null,
            loading: false
          }));
        } else {
          update(state => ({ ...state, loading: false }));
        }
      } catch (error) {
        update(state => ({ ...state, loading: false }));
      }
    }
  };
}

// Optional helper to initialize on app start
export async function initAuth() {
  await authStore.initAuth();
}
