import express from 'express';
import { signUp, signIn, signOut, getCurrentUser,forgotPassword } from '../lib/supabase.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;
    const data = await signUp(email, password, fullName, role);
    res.json({ success: true, user: data.user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await signIn(email, password);
    res.json({ success: true, session: data.session });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/logout', async (req, res) => {
  try {
    await signOut();
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/me', async (req, res) => {
  try {
    const user = await getCurrentUser();
    res.json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
     // Check if user exists
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();
      
    // Send password reset email
    await forgotPassword(email);
    
    //  Log password reset request
    const { error: logError } = await supabase
      .from('password_reset_logs')
      .insert({
        user_id: userData?.id || null,
        email: email,
        status: 'requested',
        requested_at: new Date().toISOString()
      });
    
    if (logError) {
      console.error(' Failed to log password reset request:', logError);
    } else {
      console.log(' Password reset request logged for:', email);
    }
    res.json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    try {
      await supabase
        .from('password_reset_logs')
        .insert({
          user_id: null,
          email: req.body.email || 'unknown',
          status: 'failed',
          requested_at: new Date().toISOString()
        });
    } catch (logErr) {
      console.error('Failed to log error:', logErr);
    }
    res.status(400).json({ error: error.message });
  }
});

export default router;
