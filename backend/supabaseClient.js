// backend/supabaseClient.js

const { createClient } = require('@supabase/supabase-js');

// Ambil URL dan Service Key dari file .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

// Buat dan ekspor client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;