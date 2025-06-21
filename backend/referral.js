// backend/referral.js - API untuk sistem referral/afiliasi
const express = require('express');
const supabase = require('./supabaseClient');
const router = express.Router();

// GET /api/referral/my-stats - Statistik referral user
router.get('/my-stats', async (req, res) => {
    const userId = req.user.id;
    
    try {
        // Pertama, pastikan user memiliki referral_code
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, email, full_name, referral_code, referred_by, is_referral_active, referral_earnings')
            .eq('id', userId)
            .single();

        if (userError) {
            console.error('Error fetching user:', userError);
            throw new Error('User tidak ditemukan');
        }

        // Jika user belum memiliki referral_code, generate satu
        if (!user.referral_code) {
            const { error: updateError } = await supabase.rpc('generate_referral_code_for_user', {
                user_id: userId
            });

            if (updateError) {
                console.error('Error generating referral code:', updateError);
                // Fallback: generate manual
                const referralCode = 'REF' + Math.random().toString(36).substr(2, 8).toUpperCase();
                const { error: manualUpdateError } = await supabase
                    .from('users')
                    .update({ 
                        referral_code: referralCode,
                        is_referral_active: true 
                    })
                    .eq('id', userId);

                if (manualUpdateError) {
                    console.error('Error manual update referral code:', manualUpdateError);
                    throw new Error('Gagal membuat kode referral');
                }

                user.referral_code = referralCode;
                user.is_referral_active = true;
            } else {
                // Refresh user data setelah generate referral code
                const { data: updatedUser, error: refreshError } = await supabase
                    .from('users')
                    .select('referral_code, is_referral_active')
                    .eq('id', userId)
                    .single();

                if (!refreshError && updatedUser) {
                    user.referral_code = updatedUser.referral_code;
                    user.is_referral_active = updatedUser.is_referral_active;
                }
            }
        }

        // Ambil statistik referral user dari view
        const { data: stats, error: statsError } = await supabase
            .from('referral_summary')
            .select('*')
            .eq('id', userId)
            .single();

        // Jika belum ada di view, buat stats default
        let referralStats = {
            id: userId,
            email: user.email,
            full_name: user.full_name,
            referral_code: user.referral_code,
            total_referrals: 0,
            total_commissions_earned: user.referral_earnings || 0,
            approved_commissions: 0,
            pending_commissions: 0,
            actual_referrals: 0,
            total_transactions: 0,
            is_referral_active: user.is_referral_active || true
        };        if (!statsError && stats) {
            referralStats = stats;
        }        // Ambil daftar user yang direferral (lebih sederhana)
        const { data: referredUsers, error: refError } = await supabase
            .from('users')
            .select('id, email, full_name, created_at')
            .eq('referred_by', referralStats.referral_code || '');

        if (refError) {
            console.error('Error fetching referred users:', refError);
        }

        // Ambil count order untuk setiap referred user dengan query terpisah
        let referredUsersWithOrders = [];
        if (referredUsers && referredUsers.length > 0) {
            // Ambil semua order dari user yang direferral sekaligus
            const userIds = referredUsers.map(u => u.id);
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select('user_id')
                .in('user_id', userIds);

            if (!ordersError) {
                // Hitung order per user
                const orderCounts = {};
                orders?.forEach(order => {
                    orderCounts[order.user_id] = (orderCounts[order.user_id] || 0) + 1;
                });

                referredUsersWithOrders = referredUsers.map(user => ({
                    ...user,
                    total_orders: orderCounts[user.id] || 0
                }));
            } else {
                referredUsersWithOrders = referredUsers.map(user => ({
                    ...user,
                    total_orders: 0
                }));
            }
        }// Ambil transaksi referral terbaru
        const { data: recentTransactions, error: transError } = await supabase
            .from('referral_transactions')
            .select(`
                id, commission_amount, order_amount, status, created_at,
                referred_user_id,
                users!referred_user_id(email, full_name),
                orders(id, total_price, created_at)
            `)
            .eq('referrer_id', userId)
            .order('created_at', { ascending: false })
            .limit(10);

        if (transError) {
            console.error('Error fetching recent transactions:', transError);
        }        res.json({
            stats: referralStats,
            referred_users: referredUsersWithOrders || [],
            recent_transactions: recentTransactions || []
        });    } catch (error) {
        console.error('Error fetching referral stats:', error);
        res.status(500).json({ 
            error: 'Gagal memuat statistik referral',
            details: error.message 
        });
    }
});

// GET /api/referral/validate-code - Validasi kode referral
router.get('/validate-code', async (req, res) => {
    const { code } = req.query;
    
    try {
        if (!code || !code.trim()) {
            return res.status(400).json({ 
                valid: false, 
                message: 'Kode referral tidak boleh kosong' 
            });
        }

        // Cek apakah kode referral valid dan aktif
        const { data: referrer, error } = await supabase
            .from('users')
            .select('id, email, full_name, is_referral_active')
            .eq('referral_code', code.trim().toUpperCase())
            .eq('is_referral_active', true)
            .single();

        if (error || !referrer) {
            return res.json({ 
                valid: false, 
                message: 'Kode referral tidak valid atau tidak aktif' 
            });
        }

        res.json({ 
            valid: true, 
            referrer_id: referrer.id,
            referrer_name: referrer.full_name || referrer.email,
            message: `Kode valid! Dari ${referrer.full_name || referrer.email}` 
        });

    } catch (error) {
        console.error('Error validating referral code:', error);
        res.status(500).json({ 
            valid: false, 
            message: 'Terjadi kesalahan saat memvalidasi kode referral' 
        });
    }
});

// POST /api/referral/register-with-code - Register user dengan kode referral
router.post('/register-with-code', async (req, res) => {
    const { email, password, name, referral_code } = req.body;
    
    try {
        // Validasi kode referral
        if (referral_code) {
            const { data: referrer, error: refError } = await supabase
                .from('users')
                .select('id, email, name, is_referral_active')
                .eq('referral_code', referral_code)
                .eq('is_referral_active', true)
                .single();

            if (refError || !referrer) {
                return res.status(400).json({ 
                    error: 'Kode referral tidak valid atau tidak aktif' 
                });
            }

            // Cek apakah user sudah ada
            const { data: existingUser, error: checkError } = await supabase
                .from('users')
                .select('id')
                .eq('email', email)
                .single();

            if (existingUser) {
                return res.status(400).json({ 
                    error: 'Email sudah terdaftar' 
                });
            }
        }

        // Register user baru dengan Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    referred_by: referral_code || null
                }
            }
        });

        if (authError) throw authError;

        // Update user profile dengan referral code
        if (authData.user && referral_code) {
            const { error: updateError } = await supabase
                .from('users')
                .update({ 
                    referred_by: referral_code,
                    name 
                })
                .eq('id', authData.user.id);

            if (updateError) {
                console.error('Error updating user with referral:', updateError);
            } else {
                // Update statistik referrer
                const { error: statsError } = await supabase.rpc('update_referrer_stats', {
                    p_referral_code: referral_code
                });
                if (statsError) console.error('Error updating referrer stats:', statsError);
            }
        }

        res.status(201).json({
            message: referral_code ? 
                `Registrasi berhasil dengan kode referral ${referral_code}` : 
                'Registrasi berhasil',
            user: {
                id: authData.user.id,
                email: authData.user.email,
                referred_by: referral_code
            }
        });

    } catch (error) {
        console.error('Error in referral registration:', error);
        res.status(500).json({ error: 'Gagal mendaftar dengan kode referral' });
    }
});

// GET /api/referral/validate-code/:code - Validasi kode referral
router.get('/validate-code/:code', async (req, res) => {
    const { code } = req.params;
    
    try {        const { data: referrer, error } = await supabase
            .from('users')
            .select('id, email, full_name, referral_code, is_referral_active')
            .eq('referral_code', code)
            .eq('is_referral_active', true)
            .single();

        if (error || !referrer) {
            return res.status(404).json({ 
                valid: false, 
                message: 'Kode referral tidak valid atau tidak aktif' 
            });
        }        res.json({
            valid: true,
            referrer: {
                name: referrer.full_name,
                email: referrer.email
            },
            message: `Kode referral valid - dari ${referrer.full_name || referrer.email}`
        });

    } catch (error) {
        console.error('Error validating referral code:', error);
        res.status(500).json({ valid: false, message: 'Gagal memvalidasi kode referral' });
    }
});

// POST /api/referral/share - Generate link sharing referral
router.post('/share', async (req, res) => {
    const userId = req.user.id;
    const { platform } = req.body; // whatsapp, telegram, email, copy
    
    try {        // Ambil referral code user
        const { data: user, error } = await supabase
            .from('users')
            .select('referral_code, full_name, email')
            .eq('id', userId)
            .single();

        if (error || !user.referral_code) {
            return res.status(404).json({ error: 'Kode referral tidak ditemukan' });
        }

        const referralCode = user.referral_code;
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const referralUrl = `${baseUrl}/register?ref=${referralCode}`;        // Template pesan berbeda untuk setiap platform
        const userName = user.full_name || user.email.split('@')[0];
        const messages = {
            whatsapp: `🚀 *SMM Panel Terbaik!*

Halo! Saya ${userName} ingin berbagi panel SMM terbaik untuk boosting sosial media kamu!

✅ Harga termurah & terpercaya
✅ Layanan Instagram, TikTok, YouTube, Facebook
✅ Proses cepat & auto
✅ Support 24/7

Daftar pakai kode referral saya: *${referralCode}*
Link: ${referralUrl}

Atau daftar langsung di: ${baseUrl}
Masukkan kode: ${referralCode}

#SMMPanel #SosialMediaMarketing #InstagramBoost`,
            
            telegram: `🚀 **SMM Panel Terbaik!**

Halo! Saya ${userName} ingin berbagi panel SMM terbaik untuk boosting sosial media kamu!

✅ Harga termurah & terpercaya  
✅ Layanan Instagram, TikTok, YouTube, Facebook  
✅ Proses cepat & auto  
✅ Support 24/7  

Daftar pakai kode referral saya: \`${referralCode}\`
[Daftar Sekarang](${referralUrl})`,

            email: `Subject: Undangan Bergabung - SMM Panel Terbaik

Halo!

Saya ${userName} ingin mengundang kamu bergabung di SMM Panel terbaik untuk kebutuhan social media marketing.

Keunggulan:
• Harga termurah & terpercaya
• Layanan lengkap: Instagram, TikTok, YouTube, Facebook
• Proses cepat & otomatis  
• Support 24/7

Daftar dengan kode referral: ${referralCode}
Link pendaftaran: ${referralUrl}

Atau kunjungi ${baseUrl} dan masukkan kode: ${referralCode}

Terima kasih!`,

            copy: `🚀 SMM Panel Terbaik!

Daftar dengan kode referral: ${referralCode}
Link: ${referralUrl}

✅ Harga termurah & terpercaya
✅ Layanan Instagram, TikTok, YouTube, Facebook  
✅ Proses cepat & auto
✅ Support 24/7`
        };

        // URL untuk berbagai platform
        const shareUrls = {
            whatsapp: `https://wa.me/?text=${encodeURIComponent(messages.whatsapp)}`,
            telegram: `https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent(messages.telegram)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(messages.copy)}`
        };

        res.json({
            referral_code: referralCode,
            referral_url: referralUrl,
            message: messages[platform] || messages.copy,
            share_url: shareUrls[platform] || null,
            platform
        });

    } catch (error) {
        console.error('Error generating share link:', error);
        res.status(500).json({ error: 'Gagal generate link sharing' });
    }
});

// Admin Routes - Kelola komisi referral

// GET /api/referral/admin/pending - Daftar komisi pending (Admin only)
router.get('/admin/pending', async (req, res) => {
    // Cek apakah user adalah admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Akses ditolak' });
    }
    
    try {
        const { data: pendingCommissions, error } = await supabase
            .from('referral_transactions')
            .select(            `
                id, commission_amount, order_amount, created_at, status,
                referrer:referrer_id(id, email, full_name, referral_code),
                referred_user:referred_user_id(id, email, full_name),
                order:order_id(id, total_price, created_at, service_id)
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(pendingCommissions || []);

    } catch (error) {
        console.error('Error fetching pending commissions:', error);
        res.status(500).json({ error: 'Gagal memuat komisi pending' });
    }
});

// POST /api/referral/admin/approve/:id - Approve komisi (Admin only)
router.post('/admin/approve/:id', async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Akses ditolak' });
    }

    const transactionId = req.params.id;
    const { add_to_balance = true, notes } = req.body;
    
    try {
        // Panggil function approve_referral_commission
        const { data, error } = await supabase.rpc('approve_referral_commission', {
            p_transaction_id: parseInt(transactionId),
            p_admin_id: req.user.id,
            p_add_to_balance: add_to_balance
        });

        if (error) throw error;

        // Tambahkan notes jika ada
        if (notes) {
            await supabase
                .from('referral_transactions')
                .update({ notes })
                .eq('id', transactionId);
        }

        res.json({
            message: 'Komisi referral berhasil diapprove',
            result: data
        });

    } catch (error) {
        console.error('Error approving commission:', error);
        res.status(500).json({ error: 'Gagal approve komisi referral' });
    }
});

// POST /api/referral/admin/reject/:id - Reject komisi (Admin only)
router.post('/admin/reject/:id', async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Akses ditolak' });
    }

    const transactionId = req.params.id;
    const { notes } = req.body;
    
    try {
        const { error } = await supabase
            .from('referral_transactions')
            .update({ 
                status: 'rejected',
                approved_by: req.user.id,
                approved_at: new Date().toISOString(),
                notes: notes || 'Ditolak oleh admin'
            })
            .eq('id', transactionId);

        if (error) throw error;

        res.json({ message: 'Komisi referral berhasil ditolak' });

    } catch (error) {
        console.error('Error rejecting commission:', error);
        res.status(500).json({ error: 'Gagal menolak komisi referral' });
    }
});

// GET /api/referral/admin/stats - Statistik referral keseluruhan (Admin only)
router.get('/admin/stats', async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Akses ditolak' });
    }
    
    try {
        // Total statistik
        const { data: totalStats, error: statsError } = await supabase
            .from('referral_transactions')
            .select('commission_amount, status')
            .then(({ data, error }) => {
                if (error) throw error;
                
                const stats = {
                    total_commissions: data?.length || 0,
                    total_amount: data?.reduce((sum, t) => sum + parseFloat(t.commission_amount), 0) || 0,
                    pending_commissions: data?.filter(t => t.status === 'pending').length || 0,
                    pending_amount: data?.filter(t => t.status === 'pending').reduce((sum, t) => sum + parseFloat(t.commission_amount), 0) || 0,
                    approved_commissions: data?.filter(t => t.status === 'approved').length || 0,
                    approved_amount: data?.filter(t => t.status === 'approved').reduce((sum, t) => sum + parseFloat(t.commission_amount), 0) || 0
                };
                
                return { data: stats, error: null };
            });

        if (statsError) throw statsError;

        // Top referrers
        const { data: topReferrers, error: topError } = await supabase
            .from('referral_summary')
            .select('*')
            .order('total_commissions_earned', { ascending: false })
            .limit(10);

        if (topError) throw topError;

        res.json({
            stats: totalStats,
            top_referrers: topReferrers || []
        });

    } catch (error) {
        console.error('Error fetching admin referral stats:', error);
        res.status(500).json({ error: 'Gagal memuat statistik referral' });
    }
});

module.exports = router;
