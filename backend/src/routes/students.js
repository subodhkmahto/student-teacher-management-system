import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('students')
     // .select(`id, roll_number, grade, user_id, profiles(email, full_name)`)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('students')
      //.select(`id, roll_number, grade, user_id, profiles(email, full_name)`)
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { full_name, email, user_id, roll_number, grade } = req.body;
    const { data, error } = await supabase
      .from('students')
      .insert([{ full_name, email, user_id, roll_number, grade }])
      .select();

    if (error) {
      // Unique constraint violation
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Email or Roll Number already exists' });
      }
      throw error;
    }

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { grade } = req.body;
    const { data, error } = await supabase
      .from('students')
      .update({ grade })
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
