// middleware/auth.js
import { supabase } from '../lib/supabase.js';

export async function authenticate(req, res, next) {
  try {
    
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      console.error(' No authorization header');
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.error(' Token missing from header');
      return res.status(401).json({ error: 'Token missing' });
    }


    // CRITICAL: Use supabase (anon key client) to verify token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      console.error(' Token verification failed:', error.message);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    if (!user) {
      console.error(' No user found from token');
      return res.status(401).json({ error: 'User not found' });
    }

    console.log(' User authenticated successfully:', {
      userId: user.id,
      email: user.email
    });

    req.user = user;
    next();

  } catch (err) {
    console.error(' Authentication error:', err.message);
    res.status(401).json({ error: 'Authentication failed' });
  }
}

export function authorize(...allowedRoles) {
  return async (req, res, next) => {
    try {
      console.log('Authorization check for roles:', allowedRoles);
      
      const user = req.user;
      if (!user) {
        console.error(' No user in request');
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error(' Failed to fetch user profile:', error.message);
        return res.status(403).json({ error: 'Access denied' });
      }

      console.log('👤 User role:', profile.role);

      if (!allowedRoles.includes(profile.role)) {
        console.error(' User role not authorized:', profile.role);
        return res.status(403).json({ error: 'Access denied' });
      }

      console.log(' User authorized successfully');
      next();

    } catch (err) {
      console.error(' Authorization error:', err.message);
      res.status(403).json({ error: 'Authorization failed' });
    }
  };
}