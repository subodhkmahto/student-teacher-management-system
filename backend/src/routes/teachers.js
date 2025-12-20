import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('teachers')
      // .select(`id, department, specialization, user_id, profiles(email, full_name)`)
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
      .from('teachers')
      //.select(`id, department, specialization, user_id, profiles(email, full_name)`)
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
    const { full_name, email, department, specialization, user_id } = req.body;

    if (!full_name || !email) {
      return res.status(400).json({ error: 'Full name and email are required' });
    }

    const { data, error } = await supabase
      .from('teachers')
      .insert([{ full_name, email, user_id, department, specialization }])
      .select();

      //console.log(error);

    if (error) {
            // Agar duplicate email error hai
            if (error.code === '23505') { // PostgreSQL unique violation
                return res.status(400).json({ error: 'Email already exists' });
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
    const { department, specialization } = req.body;
    const { data, error } = await supabase
      .from('teachers')
      .update({ department, specialization })
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
