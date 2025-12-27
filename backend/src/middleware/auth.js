// middleware/auth.js
import { supabase } from '../lib/supabase.js';

export async function authenticate(req, res, next) {
  try {
    console.log('🔐 Authentication check...');
    
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      console.error('❌ No authorization header');
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.error('❌ Token missing from header');
      return res.status(401).json({ error: 'Token missing' });
    }

    console.log('🔍 Verifying token:', token.substring(0, 20) + '...');

    // CRITICAL: Use supabase (anon key client) to verify token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      console.error('❌ Token verification failed:', error.message);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    if (!user) {
      console.error('❌ No user found from token');
      return res.status(401).json({ error: 'User not found' });
    }

    console.log('✅ User authenticated successfully:', {
      userId: user.id,
      email: user.email
    });

    req.user = user;
    next();

  } catch (err) {
    console.error('🚨 Authentication error:', err.message);
    res.status(401).json({ error: 'Authentication failed' });
  }
}