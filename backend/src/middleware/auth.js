import { supabase, supabaseAdmin } from '../lib/supabase.js'; // ← supabaseAdmin import karein

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.log(' No token provided');
      return res.status(401).json({ 
        error: 'No token provided',
        message: 'Please login to continue'
      });
    }

    const token = authHeader.split(' ')[1];

    //  Token verify karne ke liye supabase (anon key) use karein
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error(' Invalid token:', error?.message);
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        message: 'Please login again'
      });
    }


    //  Profile fetch karne ke liye supabaseAdmin use karein (RLS bypass)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error(' Profile query error:', {
        code: profileError.code,
        message: profileError.message,
        userId: user.id
      });
      return res.status(403).json({ 
        error: 'Profile error',
        message: profileError.message
      });
    }

    if (!profile) {
      console.error(' Profile not found for user:', user.id, user.email);
      return res.status(403).json({ 
        error: 'Profile not found',
        message: 'User profile does not exist. Please contact admin.'
      });
    }


    // Attach user to request object
    req.user = {
      id: user.id,
      email: user.email,
      role: profile.role,
      fullName: profile.full_name
    };

    next();
  } catch (err) {
    console.error(' Auth error:', err.message);
    res.status(401).json({ 
      error: 'Authentication failed',
      message: err.message 
    });
  }
}

export function authorize(...allowedRoles) {
  return (req, res, next) => {
    console.log(' Authorization check:', {
      requiredRoles: allowedRoles,
      userRole: req.user?.role,
      path: req.path
    });

    if (!req.user) {
      console.log(' No user in request');
      return res.status(401).json({ 
        error: 'Not authenticated',
        message: 'Please login first'
      });
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      console.log(` Access denied: ${userRole} not in [${allowedRoles.join(', ')}]`);
      return res.status(403).json({ 
        error: 'Access denied',
        message: `This action requires one of these roles: ${allowedRoles.join(', ')}. Your role: ${userRole}`
      });
    }

    console.log(` Authorization passed: ${userRole}`);
    next();
  };
}


export function checkOwnership(resourceIdField = 'id') {
  return (req, res, next) => {
    if (!req.user) {
      console.log(' No user in request');
      return res.status(401).json({ 
        error: 'Not authenticated' 
      });
    }

    const resourceId = req.params[resourceIdField];
    const userId = req.user.id;

    console.log(` Checking ownership: User ${userId}, Resource ${resourceId}`);

    //  Teachers and admins can access all resources
    if (req.user.role === 'teacher' || req.user.role === 'admin') {
      console.log(' Admin/Teacher access granted');
      return next();
    }

    //  Students can only access their own resources
    if (resourceId !== userId) {
      console.log(` Ownership check failed: User ${userId} tried to access resource ${resourceId}`);
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'You can only access your own resources' 
      });
    }

    console.log(' Ownership verified');
    next();
  };
}

export function isStudent(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.user.role !== 'student') {
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'This action is only for students'
    });
  }

  next();
}

export function isTeacher(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.user.role !== 'teacher') {
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'This action is only for teachers'
    });
  }

  next();
}

