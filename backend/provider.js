// backend/provider.js
const express = require('express');
const router = express.Router();

const fetch = require('node-fetch');

// Endpoint untuk mengecek profil/saldo di CentralSMM
router.get('/profile', async (req, res) => {
    console.log('Menerima permintaan untuk cek profil provider (Metode: form-urlencoded)...');

    const providerApiUrl = 'https://centralsmm.co.id/api/profile';

    const apiId = process.env.CENTRALSMM_API_ID;
    const apiKey = process.env.CENTRALSMM_API_KEY;
    const secretKey = process.env.CENTRALSMM_SECRET_KEY;

    if (!apiId || !apiKey || !secretKey) {
        console.error('Error: Kredensial CentralSMM tidak ditemukan di .env');
        return res.status(500).json({ error: 'Konfigurasi kredensial provider tidak lengkap.' });
    }

    try {
        // --- MEMBUAT BODY BARU DENGAN FORMAT FORMULIR ---
        const formBody = new URLSearchParams();
        formBody.append('api_id', apiId);
        formBody.append('api_key', apiKey);
        formBody.append('secret_key', secretKey);
        // ---------------------------------------------

        const response = await fetch(providerApiUrl, {
            method: 'POST',
            // --- MENGUBAH HEADER ---
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            // --- MENGGUNAKAN BODY BARU ---
            body: formBody.toString(),
        });

        const data = await response.json();
        console.log('Respon dari provider:', data);

        res.json(data);

    } catch (error) {
        console.error('Gagal saat menghubungi API provider:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat menghubungi provider.' });
    }
});

// Endpoint untuk membuat order baru ke CentralSMM (SESUAI DOKUMENTASI)
router.post('/create-order', async (req, res) => {
    console.log('Membuat order baru ke CentralSMM...');
    
    const { service, target, quantity } = req.body;
    const providerApiUrl = 'https://centralsmm.co.id/api/order';

    const apiId = process.env.CENTRALSMM_API_ID;
    const apiKey = process.env.CENTRALSMM_API_KEY;
    const secretKey = process.env.CENTRALSMM_SECRET_KEY;

    if (!apiId || !apiKey || !secretKey) {
        console.error('Error: Kredensial CentralSMM tidak ditemukan di .env');
        return res.status(500).json({ error: 'Konfigurasi kredensial provider tidak lengkap.' });
    }

    if (!service || !target || !quantity) {
        return res.status(400).json({ error: 'service, target, dan quantity diperlukan (sesuai dokumentasi CentralSMM).' });
    }

    try {
        // Format body sesuai dokumentasi CentralSMM
        const formBody = new URLSearchParams();
        formBody.append('api_id', apiId);
        formBody.append('api_key', apiKey);
        formBody.append('secret_key', secretKey);
        formBody.append('service', service.toString()); // Sesuai dokumentasi: 'service' bukan 'service_id'
        formBody.append('target', target); // Sesuai dokumentasi: 'target' bukan 'link'
        formBody.append('quantity', quantity.toString());

        console.log('Mengirim order ke CentralSMM dengan parameter yang benar:', {
            service,
            target,
            quantity,
            provider_url: providerApiUrl
        });

        const response = await fetch(providerApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formBody.toString(),
        });

        const data = await response.json();
        console.log('Respon order dari CentralSMM:', data);

        // Sesuai dokumentasi: response berisi {response: true/false, data: {id, price}}
        if (data.response && data.data && data.data.id) {
            res.json({
                success: true,
                provider_order_id: data.data.id, // Sesuai dokumentasi: 'id' bukan 'order_id'
                price: data.data.price,
                message: 'Order berhasil dibuat di provider'
            });
        } else {
            res.status(400).json({
                success: false,
                error: data.data?.msg || 'Gagal membuat order di provider',
                provider_response: data
            });
        }

    } catch (error) {
        console.error('Error saat membuat order ke provider:', error);
        res.status(500).json({ 
            success: false,
            error: 'Terjadi kesalahan saat menghubungi provider.' 
        });
    }
});

// Endpoint untuk mengecek status order dari CentralSMM (SESUAI DOKUMENTASI)
router.get('/order-status/:orderId', async (req, res) => {
    console.log('Mengecek status order dari CentralSMM...');
    
    const { orderId } = req.params;
    const providerApiUrl = 'https://centralsmm.co.id/api/status';

    const apiId = process.env.CENTRALSMM_API_ID;
    const apiKey = process.env.CENTRALSMM_API_KEY;
    const secretKey = process.env.CENTRALSMM_SECRET_KEY;

    if (!apiId || !apiKey || !secretKey) {
        return res.status(500).json({ error: 'Konfigurasi kredensial provider tidak lengkap.' });
    }

    try {
        // Format body untuk cek status sesuai dokumentasi
        const formBody = new URLSearchParams();
        formBody.append('api_id', apiId);
        formBody.append('api_key', apiKey);
        formBody.append('secret_key', secretKey);
        formBody.append('id', orderId); // Sesuai dokumentasi: 'id' bukan 'order_id'

        const response = await fetch(providerApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formBody.toString(),
        });

        const data = await response.json();
        console.log('Status order dari CentralSMM:', data);

        // Sesuai dokumentasi: {response: true, data: {id, price, status, start_count, remains}}
        if (data.response && data.data) {
            res.json({
                success: true,
                id: data.data.id,
                price: data.data.price,
                status: data.data.status,
                start_count: data.data.start_count,
                remains: data.data.remains
            });
        } else {
            res.status(400).json({
                success: false,
                error: data.data?.msg || 'Gagal mengecek status order',
                provider_response: data
            });
        }

    } catch (error) {
        console.error('Error saat cek status order:', error);
        res.status(500).json({ 
            success: false,
            error: 'Terjadi kesalahan saat menghubungi provider.' 
        });
    }
});

module.exports = router;