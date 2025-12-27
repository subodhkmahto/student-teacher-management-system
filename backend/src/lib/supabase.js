// lib/supabase.js - BACKEND
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;


// Check all required keys
if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY');
}

// Service role client (for admin operations)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

// Anon key client (for token verification)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});


// ====== AUTH FUNCTIONS ======

export async function signUp(email, password, fullName, role) {
  if (!email || !password || !fullName) {
    throw new Error('Email, password, and full name are required');
  }
  
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }
  
  if (!['student', 'teacher'].includes(role)) {
    throw new Error('Invalid role. Must be "student" or "teacher"');
  }

  const redirectUrl = process.env.NODE_ENV === 'production'
    ? 'https://student-teacher-management-system-nine.vercel.app/login'
    : 'http://localhost:5173/login';

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role }
  });

  if (error) throw new Error(error.message);

  if (data.user) {
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: data.user.id,
      email,
      full_name: fullName,
      role
    });

    if (profileError) throw new Error(profileError.message);

    if (role === 'student') {
      const { error: studentError } = await supabaseAdmin.from('students').insert({
        user_id: data.user.id,
        roll_number: `STU-${Date.now()}`
      });
      if (studentError) throw new Error(studentError.message);
    } else if (role === 'teacher') {
      const { error: teacherError } = await supabaseAdmin.from('teachers').insert({
        user_id: data.user.id
      });
      if (teacherError) throw new Error(teacherError.message);
    }
  }

  return data;
}

export async function signIn(email, password) {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const { data, error } = await supabase.auth.signInWithPassword({ 
    email, 
    password 
  });
  
  if (error) throw new Error(error.message);
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
  return { success: true, message: 'Signed out successfully' };
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  return user;
}

export async function forgotPassword(email) {
  if (!email) throw new Error('Email is required');

  const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://student-teacher-management-system-nine.vercel.app'
    : 'http://localhost:5173';

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${baseUrl}/reset-password`
  });

  if (error) throw new Error(error.message);

  return { success: true, message: 'Password reset email sent' };
}

export async function resetPassword(newPassword) {
  if (!newPassword || newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) throw new Error(error.message);

  return { success: true, message: 'Password updated successfully' };
}