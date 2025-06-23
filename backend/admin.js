const express = require('express');
const router = express.Router();
const supabase = require('./supabaseClient');

// GET /api/admin/deposits - Ambil semua deposit untuk ditampilkan di tabel admin
router.get('/deposits', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('deposits')
            .select(`
                id,
                amount,
                status,
                created_at,
                users ( email, full_name )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching deposits for admin:", error.message);
            throw error;
        }

        res.status(200).json(data);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/admin/pending-deposits - Ambil semua deposit yang pending
router.get('/pending-deposits', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('deposits')
            .select('*, users(email, full_name)') // JOIN dengan tabel users untuk dapat email
            .eq('status', 'pending')
            .order('created_at', { ascending: true });
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/admin/approve-deposit/:id - Setujui deposit
router.post('/approve-deposit/:id', async (req, res) => {
    const depositId = req.params.id;
    try {
        // 1. Ambil detail deposit
        const { data: deposit, error: findError } = await supabase
            .from('deposits').select('*').eq('id', depositId).single();
        if (findError || !deposit) return res.status(404).json({ error: 'Deposit tidak ditemukan' });
        if (deposit.status !== 'pending') return res.status(400).json({ error: 'Deposit ini sudah diproses' });

        // 2. Tambahkan saldo ke user menggunakan fungsi DB
        const { error: balanceError } = await supabase.rpc('add_balance', {
            user_id_to_update: deposit.user_id,
            amount_to_add: deposit.amount
        });
        if (balanceError) throw balanceError;

        // 3. Update status deposit menjadi 'approved'
        const { data: updatedDeposit, error: updateError } = await supabase
            .from('deposits').update({ status: 'approved' }).eq('id', depositId).select().single();
        if (updateError) throw updateError;

        res.status(200).json({ message: 'Deposit berhasil disetujui', deposit: updatedDeposit });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/admin/reject-deposit/:id - Tolak deposit
router.post('/reject-deposit/:id', async (req, res) => {
    const depositId = req.params.id;
    try {
        // 1. Cek dulu apakah depositnya ada dan statusnya pending
        const { data: deposit, error: findError } = await supabase
            .from('deposits').select('status').eq('id', depositId).single();
        if (findError || !deposit) {
            return res.status(404).json({ error: 'Deposit tidak ditemukan' });
        }
        if (deposit.status !== 'pending') {
            return res.status(400).json({ error: 'Deposit ini sudah diproses sebelumnya' });
        }

        // 2. Update status deposit menjadi 'rejected'
        const { data: updatedDeposit, error: updateError } = await supabase
            .from('deposits')
            .update({ status: 'rejected', updated_at: new Date() }) // Update status dan waktu
            .eq('id', depositId)
            .select()
            .single();

        if (updateError) throw updateError;

        // Penting: Saldo user TIDAK diubah.
        res.status(200).json({ message: 'Deposit berhasil ditolak', deposit: updatedDeposit });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/admin/sync-services - DEPRECATED: Redirect to multi-provider
router.post('/sync-services', async (req, res) => {
    res.status(410).json({ 
        error: 'Endpoint deprecated',
        message: 'This endpoint has been removed. Please use /api/providers/sync-all for multi-provider sync or /api/providers/:id/sync-services for specific provider sync.',
        alternatives: [
            'POST /api/providers/sync-all - Sync all active providers',
            'POST /api/providers/:id/sync-services - Sync specific provider'
        ]
    });
});

module.exports = router;