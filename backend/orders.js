// backend/orders.js
const express = require('express');
const supabase = require('./supabaseClient');
const fetch = require('node-fetch');
const router = express.Router();
// Kita tidak lagi memanggil middleware di sini

// GET /api/orders
router.get('/', async (req, res) => {
    const userId = req.user.id;
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('id, quantity, link, total_price, status, created_at, services ( name, category )')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/orders
router.post('/', async (req, res) => {
    const userId = req.user.id;
    const { service_id, quantity, link } = req.body;
    
    try {        // 1. Ambil detail service untuk mendapatkan provider_service_id dan harga
        const { data: service, error: serviceError } = await supabase
            .from('services')
            .select('provider_service_id, price_per_1000, original_price, min_order, max_order, name')
            .eq('id', service_id)
            .single();

        if (serviceError || !service) {
            return res.status(404).json({ error: 'Layanan tidak ditemukan' });
        }

        if (!service.provider_service_id) {
            return res.status(400).json({ error: 'Layanan ini belum memiliki provider_service_id' });
        }

        // 2. Validasi quantity
        if (quantity < service.min_order || quantity > service.max_order) {
            return res.status(400).json({ 
                error: `Jumlah harus antara ${service.min_order} - ${service.max_order}` 
            });
        }        // 3. Hitung harga dengan system yang benar
        const userPrice = (quantity / 1000) * service.price_per_1000; // Harga yang dibayar user (sudah markup)
        const providerPrice = service.original_price ? 
            (quantity / 1000) * service.original_price : // Gunakan original_price jika ada
            (quantity / 1000) * (service.price_per_1000 / 1.10); // Fallback untuk data lama
        const profit = userPrice - providerPrice; // Keuntungan actual

        console.log('💰 Perhitungan Harga Sistem Markup:', {
            service_name: service.name,
            quantity: quantity,
            user_price_per_1000: service.price_per_1000,
            provider_price_per_1000: service.original_price || (service.price_per_1000 / 1.10),
            total_user_pays: userPrice,
            total_provider_cost: providerPrice,
            profit: profit,
            profit_percentage: `${((profit / providerPrice) * 100).toFixed(2)}%`
        });

        // 4. Cek saldo user
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('balance')
            .eq('id', userId)
            .single();

        if (userError || !userData) {
            return res.status(404).json({ error: 'User tidak ditemukan' });
        }        if (userData.balance < userPrice) {
            return res.status(400).json({ 
                error: 'Saldo tidak mencukupi',
                required: userPrice,
                current: userData.balance
            });
        }// 5. Buat order ke provider CentralSMM (SESUAI DOKUMENTASI)
        const providerApiUrl = 'https://centralsmm.co.id/api/order';
        const { CENTRALSMM_API_ID, CENTRALSMM_API_KEY, CENTRALSMM_SECRET_KEY } = process.env;

        const formBody = new URLSearchParams();
        formBody.append('api_id', CENTRALSMM_API_ID);
        formBody.append('api_key', CENTRALSMM_API_KEY);
        formBody.append('secret_key', CENTRALSMM_SECRET_KEY);
        formBody.append('service', service.provider_service_id.toString()); // Sesuai dokumentasi: 'service'
        formBody.append('target', link); // Sesuai dokumentasi: 'target'
        formBody.append('quantity', quantity.toString());

        console.log('Mengirim order ke CentralSMM dengan parameter yang benar:', {
            provider_service_id: service.provider_service_id,
            target: link,
            quantity,
            service_name: service.name
        });

        const providerResponse = await fetch(providerApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formBody.toString(),
        });

        const providerData = await providerResponse.json();
        console.log('Respon dari CentralSMM:', providerData);        // 6. Cek apakah order berhasil dibuat di provider (SESUAI DOKUMENTASI)
        if (!providerData.response || !providerData.data || !providerData.data.id) {
            return res.status(400).json({ 
                error: 'Gagal membuat order di provider: ' + (providerData.data?.msg || 'Unknown error'),
                provider_response: providerData
            });
        }        // 7. Jika berhasil, simpan order ke database lokal dan kurangi saldo user (bukan provider cost)
        const { data: newOrder, error: orderError } = await supabase.rpc('create_order_with_provider', {
            p_user_id: userId,
            p_service_id: service_id,
            p_quantity: quantity,
            p_link: link,
            p_total_price: userPrice, // User membayar harga dengan markup
            p_provider_order_id: providerData.data.id, // Sesuai dokumentasi: 'id'
            p_start_count: 0, // Create order response tidak ada start_count
            p_status: 'pending' // Default status untuk order baru
        });        if (orderError) {
            console.error('Error saving order to database:', orderError);
            return res.status(500).json({ error: 'Gagal menyimpan order ke database' });
        }

        // 8. Trigger komisi referral jika user direferral oleh seseorang
        try {
            const orderId = newOrder[0]?.id;
            if (orderId) {
                await supabase.rpc('add_referral_commission', {
                    p_order_id: orderId,
                    p_user_id: userId,
                    p_order_amount: userPrice
                });
                console.log('✅ Referral commission check completed for order:', orderId);
            }
        } catch (refError) {
            console.error('⚠️ Error processing referral commission:', refError);
            // Tidak menggagalkan order jika referral error
        }res.status(201).json({ 
            message: 'Pesanan berhasil dibuat',
            order: newOrder[0],
            provider_order_id: providerData.data.id, // Sesuai dokumentasi
            provider_price: providerData.data.price, // Harga dari provider (cost)
            user_price: userPrice, // Harga yang dibayar user
            profit: profit, // Keuntungan yang didapat
            status: 'pending'
        });

    } catch (error) {
        console.error('Error in create order:', error);
        res.status(500).json({ error: 'Terjadi kesalahan internal.' });
    }
});

// POST /api/orders/mass - Mass Order untuk multiple links
router.post('/mass', async (req, res) => {
    const userId = req.user.id;
    const { service_id, quantity, links } = req.body; // links adalah array
    
    try {
        // Validasi input
        if (!service_id || !quantity || !links || !Array.isArray(links) || links.length === 0) {
            return res.status(400).json({ 
                error: 'service_id, quantity, dan links (array) diperlukan' 
            });
        }

        if (links.length > 100) { // Limit maksimal 100 links per mass order
            return res.status(400).json({ 
                error: 'Maksimal 100 links per mass order' 
            });
        }

        // 1. Ambil detail service
        const { data: service, error: serviceError } = await supabase
            .from('services')
            .select('provider_service_id, price_per_1000, original_price, min_order, max_order, name')
            .eq('id', service_id)
            .single();

        if (serviceError || !service) {
            return res.status(404).json({ error: 'Layanan tidak ditemukan' });
        }

        if (!service.provider_service_id) {
            return res.status(400).json({ error: 'Layanan ini belum memiliki provider_service_id' });
        }

        // 2. Validasi quantity
        if (quantity < service.min_order || quantity > service.max_order) {
            return res.status(400).json({ 
                error: `Jumlah harus antara ${service.min_order} - ${service.max_order}` 
            });
        }

        // 3. Hitung total harga untuk semua links
        const userPricePerLink = (quantity / 1000) * service.price_per_1000;
        const providerPricePerLink = service.original_price ? 
            (quantity / 1000) * service.original_price : 
            (quantity / 1000) * (service.price_per_1000 / 1.10);
        
        const totalUserPrice = userPricePerLink * links.length;
        const totalProviderPrice = providerPricePerLink * links.length;
        const totalProfit = totalUserPrice - totalProviderPrice;

        console.log('💰 Mass Order Calculation:', {
            service_name: service.name,
            quantity_per_link: quantity,
            total_links: links.length,
            price_per_link: userPricePerLink,
            total_user_price: totalUserPrice,
            total_provider_cost: totalProviderPrice,
            total_profit: totalProfit
        });

        // 4. Cek saldo user
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('balance')
            .eq('id', userId)
            .single();

        if (userError || !userData) {
            return res.status(404).json({ error: 'User tidak ditemukan' });
        }

        if (userData.balance < totalUserPrice) {
            return res.status(400).json({ 
                error: 'Saldo tidak mencukupi untuk mass order',
                required: totalUserPrice,
                current: userData.balance,
                links_count: links.length
            });
        }

        // 5. Kirim mass order ke CentralSMM
        const providerApiUrl = 'https://centralsmm.co.id/api/order';
        const { CENTRALSMM_API_ID, CENTRALSMM_API_KEY, CENTRALSMM_SECRET_KEY } = process.env;

        // Filter dan bersihkan links
        const cleanLinks = links.map(link => link.trim()).filter(link => link.length > 0);
        
        console.log('📦 Sending mass order to CentralSMM:', {
            service: service.provider_service_id,
            quantity: quantity,
            links: cleanLinks.length,
            sample_links: cleanLinks.slice(0, 3)
        });

        const massOrderResults = [];
        let successfulOrders = 0;
        let failedOrders = 0;

        // Kirim order satu per satu (karena beberapa provider tidak support true mass order)
        for (const link of cleanLinks) {
            try {
                const formBody = new URLSearchParams();
                formBody.append('api_id', CENTRALSMM_API_ID);
                formBody.append('api_key', CENTRALSMM_API_KEY);
                formBody.append('secret_key', CENTRALSMM_SECRET_KEY);
                formBody.append('service', service.provider_service_id.toString());
                formBody.append('target', link);
                formBody.append('quantity', quantity.toString());

                const providerResponse = await fetch(providerApiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formBody.toString(),
                });

                const providerData = await providerResponse.json();

                if (providerData.response && providerData.data && providerData.data.id) {
                    // Berhasil, simpan ke database
                    const { data: newOrder, error: orderError } = await supabase.rpc('create_order_with_provider', {
                        p_user_id: userId,
                        p_service_id: service_id,
                        p_quantity: quantity,
                        p_link: link,
                        p_total_price: userPricePerLink,
                        p_provider_order_id: providerData.data.id,
                        p_start_count: 0,
                        p_status: 'pending'
                    });                    if (!orderError) {
                        massOrderResults.push({
                            link: link,
                            status: 'success',
                            provider_order_id: providerData.data.id,
                            order_id: newOrder[0]?.id,
                            price: userPricePerLink
                        });
                        successfulOrders++;

                        // Trigger komisi referral untuk setiap order sukses
                        try {
                            const orderId = newOrder[0]?.id;
                            if (orderId) {
                                await supabase.rpc('add_referral_commission', {
                                    p_order_id: orderId,
                                    p_user_id: userId,
                                    p_order_amount: userPricePerLink
                                });
                            }
                        } catch (refError) {
                            console.error('⚠️ Referral commission error for order:', newOrder[0]?.id, refError);
                        }
                    } else {
                        massOrderResults.push({
                            link: link,
                            status: 'failed',
                            error: 'Database error: ' + orderError.message
                        });
                        failedOrders++;
                    }
                } else {
                    massOrderResults.push({
                        link: link,
                        status: 'failed',
                        error: providerData.data?.msg || 'Provider error'
                    });
                    failedOrders++;
                }

                // Delay kecil untuk tidak overload API
                await new Promise(resolve => setTimeout(resolve, 200));

            } catch (error) {
                massOrderResults.push({
                    link: link,
                    status: 'failed',
                    error: error.message
                });
                failedOrders++;
            }
        }

        // 6. Response dengan summary
        const actualTotalCost = successfulOrders * userPricePerLink;
        
        res.status(201).json({
            message: 'Mass order completed',
            summary: {
                total_links: cleanLinks.length,
                successful_orders: successfulOrders,
                failed_orders: failedOrders,
                total_cost: actualTotalCost,
                profit_earned: successfulOrders * (userPricePerLink - providerPricePerLink)
            },
            orders: massOrderResults
        });

    } catch (error) {
        console.error('Error in mass order:', error);
        res.status(500).json({ error: 'Terjadi kesalahan internal saat mass order.' });
    }
});

// Endpoint untuk sync status semua order pending
router.post('/sync-status', async (req, res) => {
    try {
        console.log('Memulai sync status order dengan provider...');
          // Ambil semua order yang statusnya pending/processing
        const { data: pendingOrders, error: orderError } = await supabase
            .from('orders')
            .select('id, provider_order_id, status')
            .in('status', ['pending', 'processing', 'Processing', 'in_progress', 'In Progress'])
            .not('provider_order_id', 'is', null);

        if (orderError) {
            throw orderError;
        }

        if (!pendingOrders || pendingOrders.length === 0) {
            return res.json({ 
                message: 'Tidak ada order pending yang perlu disync',
                synced_count: 0
            });
        }

        console.log(`Ditemukan ${pendingOrders.length} order pending untuk disync`);

        const providerApiUrl = 'https://centralsmm.co.id/api/status';
        const { CENTRALSMM_API_ID, CENTRALSMM_API_KEY, CENTRALSMM_SECRET_KEY } = process.env;
        let syncedCount = 0;
        let errors = [];        // Sync status satu per satu (SESUAI DOKUMENTASI)
        for (const order of pendingOrders) {
            try {
                const formBody = new URLSearchParams();
                formBody.append('api_id', CENTRALSMM_API_ID);
                formBody.append('api_key', CENTRALSMM_API_KEY);
                formBody.append('secret_key', CENTRALSMM_SECRET_KEY);
                formBody.append('id', order.provider_order_id); // Sesuai dokumentasi: 'id' bukan 'order_id'

                const response = await fetch(providerApiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formBody.toString(),
                });                const data = await response.json();

                // Sesuai dokumentasi: {response: true, data: {id, price, status, start_count, remains}}
                if (data.response && data.data) {
                    // Update status di database lokal
                    const { error: updateError } = await supabase.rpc('sync_order_status_with_provider', {
                        p_provider_order_id: order.provider_order_id,
                        p_status: data.data.status,
                        p_start_count: data.data.start_count,
                        p_remains: data.data.remains
                    });

                    if (!updateError) {
                        syncedCount++;
                        console.log(`Order ${order.id} (${order.provider_order_id}) status updated to: ${data.data.status}`);
                    } else {
                        errors.push(`Error updating order ${order.id}: ${updateError.message}`);
                    }
                } else {
                    errors.push(`Error from provider for order ${order.provider_order_id}: ${data.data?.msg || 'Unknown error'}`);
                }

                // Delay kecil untuk tidak overload API
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (err) {
                errors.push(`Error syncing order ${order.id}: ${err.message}`);
            }
        }

        res.json({
            message: `Sync completed. ${syncedCount} orders updated`,
            synced_count: syncedCount,
            total_orders: pendingOrders.length,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Error in sync status:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat sync status' });
    }
});

module.exports = router;