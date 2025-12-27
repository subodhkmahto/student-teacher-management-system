import { supabase } from './supabase';

// Auto-detect environment and set API URL
const isDevelopment = import.meta.env.MODE === 'development' || window.location.hostname === 'localhost';

export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:3000'  // Local backend
  : import.meta.env.VITE_API_BASE_URL || 'https://student-teacher-backend-avil.onrender.com'; // Production backend

console.log('🌐 Environment:', {
  mode: import.meta.env.MODE,
  hostname: window.location.hostname,
  isDevelopment,
  apiBaseUrl: API_BASE_URL
});

export async function apiCall(endpoint, options = {}) {
  let { data: { session }, error } = await supabase.auth.getSession();

  // Check if session exists and is valid
  if (!session) {
    console.error(' No session found');
    throw new Error('SESSION_EXPIRED');
  }

  // Check if session is expired
  if (session.expires_at && session.expires_at * 1000 < Date.now()) {
    console.log('🔄 Session expired, refreshing...');
    const refreshResult = await supabase.auth.refreshSession({ 
      refresh_token: session.refresh_token 
    });
    
    if (refreshResult.error) {
      console.error(' Refresh failed:', refreshResult.error);
      throw new Error('SESSION_EXPIRED');
    }
    session = refreshResult.data.session;
    console.log(' Session refreshed');
  }

  const token = session.access_token;

  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  };

  const fullUrl = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(fullUrl, config);

  if (response.status === 401) {
    console.error(' 401 Unauthorized - Backend rejected token');
    throw new Error('SESSION_EXPIRED');
  }
  
  if (response.status === 403) {
    console.error(' 403 Forbidden');
    throw new Error('Access denied');
  }

  const data = await response.json().catch(() => null);
  
  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `API Error (${response.status})`;
    console.error(' API Error:', errorMsg, data);
    throw new Error(errorMsg);
  }

  console.log(' API call successful');
  return data;
}