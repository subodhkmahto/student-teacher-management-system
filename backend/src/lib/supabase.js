import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);


export async function signUp(email, password, fullName, role) {
  const redirectUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://student-teacher-management-system-nine.vercel.app/'
      : 'http://localhost:5173/';

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
    // Unique constraint violation
    if (error.code === '23505') {
      return {
        error: 'This email is already registered'
      };
    }

    return {
      error: error.message
    };
  }

  return data;
}


export async function signUpOld(email, password, fullName, role) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role
      }
    }
  });

  if (error) throw error;

  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: data.user.id,
        email,
        full_name: fullName,
        role
      }]);

    if (profileError) throw profileError;

    if (role === 'student') {
      const { error: studentError } = await supabase
        .from('students')
        .insert([{
          user_id: data.user.id,
          roll_number: `STU-${Date.now()}`
        }]);
      if (studentError) throw studentError;
    } else if (role === 'teacher') {
      const { error: teacherError } = await supabase
        .from('teachers')
        .insert([{
          user_id: data.user.id
        }]);
      if (teacherError) throw teacherError;
    }
  }

  return data;
}

export async function signIn(email, password) { 
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  console.log('SIGN IN DATA:', data);
  if (error) throw error;
  return data;
}

export async function signOut() {
  
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}
