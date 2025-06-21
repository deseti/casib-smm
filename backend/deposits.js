// backend/deposits.js
const express = require('express');
const router = express.Router();
const supabase = require('./supabaseClient');

// Endpoint untuk MEMBUAT permintaan deposit
router.post('/create', async (req, res) => {
    const userId = req.user.id; // Diambil dari middleware otentikasi
    const { amount } = req.body;
    const paymentMethod = 'Bank Transfer / E-Wallet'; // Bisa di-hardcode untuk sekarang

    if (!amount || Number(amount) <= 0) {
        return res.status(400).json({ error: 'Jumlah deposit tidak valid.' });
    }

    try {
        // 1. Masukkan dulu permintaan deposit awal untuk mendapatkan ID
        const { data: initialDeposit, error: initialError } = await supabase
            .from('deposits')
            .insert({ user_id: userId, amount: Number(amount), payment_method: paymentMethod, status: 'pending' })
            .select('id')
            .single();

        if (initialError) throw initialError;

        const depositId = initialDeposit.id;
        // 2. Buat kode unik, misalnya 3 digit terakhir dari ID
        const uniqueCode = depositId % 1000;
        const uniqueAmount = Number(amount) + uniqueCode;

        // 3. Update lagi record deposit dengan jumlah unik
        const { data: finalDeposit, error: updateError } = await supabase
            .from('deposits')
            .update({ unique_amount: uniqueAmount }) // Kita butuh kolom 'unique_amount'
            .eq('id', depositId)
            .select()
            .single();

        if (updateError) throw updateError;

        res.status(201).json({ 
            message: 'Permintaan deposit dibuat', 
            deposit: finalDeposit 
        });

    } catch (error) {
        console.error('Error saat membuat deposit:', error);
        res.status(500).json({ error: 'Gagal memproses permintaan deposit.' });
    }
});

module.exports = router;