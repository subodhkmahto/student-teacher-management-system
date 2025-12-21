import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('course_assignments')
      .select(`
        id,
        semester,
        teacher_id,
        course_id,
        teachers(user_id, full_name, email),
        courses(name, code, description)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  console.log(req.body);
  try {
    const { teacher_id, course_id, semester } = req.body;
    const { data, error } = await supabase
      .from('course_assignments')
      .insert([{ teacher_id, course_id, semester }])
      .select();

    if (error) {
      // Unique constraint violation
     if (error.code === '23505') {
        console.log(error.details);
        return res.status(400).json({ error: 'This course is already assigned to this teacher' });
      }
      return res.status(400).json({ error: error.message });
    }

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
