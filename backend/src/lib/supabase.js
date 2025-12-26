import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_KEY must be set in .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
// Sign up user and create profile
export async function signUp(email, password, fullName, role) {
  const redirectUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://student-teacher-management-system-nine.vercel.app/login'
      : 'http://localhost:5173/login';

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: { full_name: fullName, role }
    }
  });

  if (error) throw new Error(error.message);

  // Create profile in database
  if (data.user) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      email,
      full_name: fullName,
      role
    });

    if (profileError) throw new Error(profileError.message);

    // Optionally, create student or teacher records
    if (role === 'student') {
      const { error: studentError } = await supabase.from('students').insert({
        user_id: data.user.id,
        roll_number: `STU-${Date.now()}`
      });
      if (studentError) throw new Error(studentError.message);
    } else if (role === 'teacher') {
      const { error: teacherError } = await supabase.from('teachers').insert({
        user_id: data.user.id
      });
      if (teacherError) throw new Error(teacherError.message);
    }
  }

  return data;
}

// Sign in
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

// Get current user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  return user;
}

// Forgot password
export async function forgotPassword(email) {
  if (!email) throw new Error('Email is required');

  const baseUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://student-teacher-management-system-nine.vercel.app'
      : 'http://localhost:5173';

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${baseUrl}/reset-password`
  });

  if (error) throw new Error(error.message);

  return { success: true, message: 'Password reset email sent' };
}
