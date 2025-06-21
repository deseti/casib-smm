// backend/index.js
require('dotenv').config({ path: '../.env' });

const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const fetch = require('node-fetch');
const supabase = require('./supabaseClient');

// --- Panggil semua "penjaga pintu" dan "peta" rute ---
const authenticateToken = require('./authMiddleware');
const adminOnly = require('./adminMiddleware');

const authRouter = require('./auth');
const servicesRouter = require('./services');
const dashboardRouter = require('./dashboard');
const ordersRouter = require('./orders');
const depositsRouter = require('./deposits');
const adminRouter = require('./admin');
const providerRouter = require('./provider'); // <-- TAMBAHKAN BARIS INI
const referralRouter = require('./referral'); // <-- TAMBAHKAN BARIS INI
const userProfileRoutes = require('./userProfile');

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' }));

// --- Atur semua rute dengan benar ---

// Rute publik, tidak perlu login
app.get('/', (req, res) => {
  res.json({ message: '✅ Dapur merespon! Koneksi Berhasil!' });
});
app.use('/auth', authRouter);

// Rute yang butuh login, tapi tidak harus admin
app.use('/api/services', authenticateToken, servicesRouter);
app.use('/api/dashboard', authenticateToken, dashboardRouter);
app.use('/api/orders', authenticateToken, ordersRouter);
app.use('/api/deposits', authenticateToken, depositsRouter);
app.use('/api/provider', authenticateToken, providerRouter); // <-- TAMBAHKAN BARIS INI
app.use('/api/referral', authenticateToken, referralRouter); // <-- TAMBAHKAN BARIS INI

// User profile routes
app.put('/api/user/profile', authenticateToken, userProfileRoutes.updateProfile);
app.put('/api/user/change-password', authenticateToken, userProfileRoutes.changePassword);
app.post('/api/user/avatar', authenticateToken, userProfileRoutes.upload.single('avatar'), userProfileRoutes.uploadAvatar);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rute yang HANYA bisa diakses oleh ADMIN
app.use('/api/admin', authenticateToken, adminOnly, adminRouter);


app.listen(port, () => {
  console.log(`🔥 Dapur Casib SMM sudah menyala dan siap di port ${port}`);
  
  // Auto-sync status order setiap 1 jam (untuk menghemat REST requests pada Supabase free tier)
  cron.schedule('0 * * * *', async () => {
    console.log('🔄 Auto-sync status order dimulai...');
    try {
      await autoSyncOrderStatus();
    } catch (error) {
      console.error('❌ Error pada auto-sync:', error);
    }
  });
  
  console.log('⏰ Auto-sync status order aktif (setiap 1 jam)');
});

// Fungsi auto-sync status order
async function autoSyncOrderStatus() {
  try {    // Ambil semua order yang statusnya pending/processing
    const { data: pendingOrders, error: orderError } = await supabase
      .from('orders')
      .select('id, provider_order_id, status')
      .in('status', ['pending', 'processing', 'Processing', 'in_progress', 'In Progress'])
      .not('provider_order_id', 'is', null);

    if (orderError) {
      throw orderError;
    }

    if (!pendingOrders || pendingOrders.length === 0) {
      console.log('📝 Tidak ada order pending yang perlu disync');
      return;
    }

    console.log(`📋 Ditemukan ${pendingOrders.length} order pending untuk disync`);

    const providerApiUrl = 'https://centralsmm.co.id/api/status';
    const { CENTRALSMM_API_ID, CENTRALSMM_API_KEY, CENTRALSMM_SECRET_KEY } = process.env;
    let syncedCount = 0;

    // Sync status satu per satu
    for (const order of pendingOrders) {
      try {
        const formBody = new URLSearchParams();
        formBody.append('api_id', CENTRALSMM_API_ID);
        formBody.append('api_key', CENTRALSMM_API_KEY);
        formBody.append('secret_key', CENTRALSMM_SECRET_KEY);
        formBody.append('id', order.provider_order_id);

        const response = await fetch(providerApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formBody.toString(),
        });

        const data = await response.json();

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
            console.log(`✅ Order ${order.id} (${order.provider_order_id}) status updated to: ${data.data.status}`);
          } else {
            console.error(`❌ Error updating order ${order.id}: ${updateError.message}`);
          }
        } else {
          console.error(`❌ Error from provider for order ${order.provider_order_id}: ${data.data?.msg || 'Unknown error'}`);
        }

        // Delay kecil untuk tidak overload API
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (err) {
        console.error(`❌ Error syncing order ${order.id}: ${err.message}`);
      }
    }

    console.log(`🎯 Auto-sync selesai. ${syncedCount}/${pendingOrders.length} orders berhasil diupdate`);

  } catch (error) {
    console.error('❌ Error dalam auto-sync status:', error);
  }
}