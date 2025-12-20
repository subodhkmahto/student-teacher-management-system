import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('courses')
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
  console.log(req.body);
  try {
    const { name, code, description, credit_hours } = req.body;

     if (!name || !code || !description) {
      return res.status(400).json({ error: 'Name, code, and description are required' });
    }
    const { data, error } = await supabase
      .from('courses')
      .insert([{ name, code, description, credit_hours }])
      .select('*'); // explicitly select all columns (disabled RLS)

      // .select();
      console.log(data);
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, description, credit_hours } = req.body;
    const { data, error } = await supabase
      .from('courses')
      .update({ name, description, credit_hours })
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
