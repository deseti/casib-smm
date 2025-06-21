// backend/services.js
const express = require('express');
const supabase = require('./supabaseClient');
const router = express.Router();

// Endpoint untuk mengambil semua layanan
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;