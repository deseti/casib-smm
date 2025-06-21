const express = require('express');
const supabase = require('./supabaseClient');
const router = express.Router();

// Endpoint untuk mendapatkan statistik dashboard
router.get('/stats', async (req, res) => {
    const userId = req.user.id;
    try {
        // Ambil semua data dalam satu kali panggilan
        const { data: userData, error: userError } = await supabase.from('users').select('balance').eq('id', userId).single();
        const { count: totalOrders, error: totalError } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('user_id', userId);
        const { count: pendingOrders, error: pendingError } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'pending');
        const { count: successOrders, error: successError } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'success');

        if (userError || totalError || pendingError || successError) {
            throw new Error('Gagal mengambil statistik');
        }

        res.status(200).json({
            balance: userData.balance,
            totalOrders: totalOrders,
            pendingOrders: pendingOrders,
            successOrders: successOrders
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint baru untuk mendapatkan profil lengkap user
router.get('/profile', async (req, res) => {
    const userId = req.user.id;
    try {
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, email, full_name, avatar_url, role, balance, created_at')
            .eq('id', userId)
            .single();

        if (userError) {
            throw new Error('Gagal mengambil data profil');
        }

        res.status(200).json(userData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;