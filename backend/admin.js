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

// POST /api/admin/sync-services - Ambil layanan dari provider dan simpan ke DB
router.post('/sync-services', async (req, res) => {
    console.log('Memulai proses sinkronisasi layanan...');

    const providerApiUrl = 'https://centralsmm.co.id/api/services';
    const { CENTRALSMM_API_ID, CENTRALSMM_API_KEY, CENTRALSMM_SECRET_KEY } = process.env;

    try {
        // 1. Panggil API Provider untuk mendapatkan daftar layanan
        const formBody = new URLSearchParams();
        formBody.append('api_id', CENTRALSMM_API_ID);
        formBody.append('api_key', CENTRALSMM_API_KEY);
        formBody.append('secret_key', CENTRALSMM_SECRET_KEY);

        const response = await fetch(providerApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formBody.toString(),
        });

        const providerData = await response.json();

        if (!providerData.response || !Array.isArray(providerData.data)) {
            throw new Error(providerData.data?.msg || 'Gagal mengambil data layanan dari provider.');
        }

        const servicesFromProvider = providerData.data;
        console.log(`Ditemukan ${servicesFromProvider.length} layanan dari provider.`);        // 2. Format data agar sesuai dengan tabel 'services' kita dengan markup 10%
        const markupPercentage = 0.10; // 10% markup
        const servicesToUpsert = servicesFromProvider.map(service => {
            const originalPrice = parseFloat(service.price);
            const markedUpPrice = originalPrice * (1 + markupPercentage);
            
            return {
                provider_service_id: service.id,
                name: service.service_name,
                category: service.category_name,
                category_name: service.category_name,
                price_per_1000: markedUpPrice, // Harga dengan markup 10%
                original_price: originalPrice, // Simpan harga asli untuk referensi
                min_order: service.min,
                max_order: service.max,
                refill: service.refill,
                description: service.description,
            };
        });

        console.log(`💰 Menerapkan markup ${markupPercentage * 100}% pada ${servicesToUpsert.length} layanan`);

        // 3. Gunakan 'upsert' untuk memasukkan/memperbarui data di Supabase
        const { error } = await supabase
            .from('services')
            .upsert(servicesToUpsert, {
                onConflict: 'provider_service_id'
            });
        
        if (error) throw error;

        res.status(200).json({ 
            message: 'Sinkronisasi layanan berhasil.',
            synced_count: servicesFromProvider.length
        });

    } catch (error) {
        console.error('Error saat sinkronisasi layanan:', error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;