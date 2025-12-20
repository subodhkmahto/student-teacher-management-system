import express from 'express';
import { signUp, signIn, signOut, getCurrentUser } from '../lib/supabase.js';

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

export default router;
