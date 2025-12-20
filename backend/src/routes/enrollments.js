import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        id,
        status,
        enrollment_date,
        student_id,
        course_id,
        students(roll_number, full_name, email),
        courses(name, code)
      `)
      .order('enrollment_date', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/student/:studentId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        id,
        status,
        enrollment_date,
        courses(name, code, description)
      `)
      .eq('student_id', req.params.studentId);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/course/:courseId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        id,
        status,
        students(roll_number, profiles(full_name, email))
      `)
      .eq('course_id', req.params.courseId);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { student_id, course_id } = req.body;
    const { data, error } = await supabase
      .from('enrollments')
      .insert([{ student_id, course_id, status: 'active' }])
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const { data, error } = await supabase
      .from('enrollments')
      .update({ status })
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
