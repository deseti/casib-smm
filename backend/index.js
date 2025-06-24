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
const providersRouter = require('./providers'); // <-- TAMBAHKAN BARIS INI
const referralRouter = require('./referral'); // <-- TAMBAHKAN BARIS INI
const userProfileRoutes = require('./userProfile');

const app = express();
const port = 3001;

app.use(express.json());

// GUNAKAN ENV UNTUK CORS AGAR MUDAH GANTI DOMAIN
const allowedOrigins = [
  'https://smm.casib.xyz',
  'https://sosial.casib.xyz', // <--- tambahkan baris ini
  'http://localhost:5173', // opsional: untuk dev
];
app.use(cors({ origin: allowedOrigins, credentials: true }));

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
app.use('/api/referral', authenticateToken, referralRouter); // <-- TAMBAHKAN BARIS INI

// User profile routes
app.put('/api/user/profile', authenticateToken, userProfileRoutes.updateProfile);
app.put('/api/user/change-password', authenticateToken, userProfileRoutes.changePassword);
app.post('/api/user/avatar', authenticateToken, userProfileRoutes.upload.single('avatar'), userProfileRoutes.uploadAvatar);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rute yang HANYA bisa diakses oleh ADMIN
app.use('/api/admin', authenticateToken, adminOnly, adminRouter);
app.use('/api/providers', authenticateToken, adminOnly, providersRouter); // <-- NEW: Multi-provider management


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

// Fungsi auto-sync status order - UPDATED untuk multi-provider
async function autoSyncOrderStatus() {
  try {
    console.log('Memulai sync status order dengan multi-provider system...');
    
    // Ambil semua order yang statusnya pending/processing DENGAN provider info
    const { data: pendingOrders, error: orderError } = await supabase
      .from('orders')
      .select(`
        id, 
        provider_order_id, 
        status, 
        service_id,
        services!inner(provider_id, providers!inner(
          id, name, display_name, api_url, api_id, api_key, secret_key, 
          status_endpoint, api_format, auth_method, is_active
        ))
      `)
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

    let syncedCount = 0;
    const errors = [];

    // Group orders by provider untuk efisiensi
    const ordersByProvider = {};
    pendingOrders.forEach(order => {
      const providerId = order.services.providers.id;
      if (!ordersByProvider[providerId]) {
        ordersByProvider[providerId] = {
          provider: order.services.providers,
          orders: []
        };
      }
      ordersByProvider[providerId].orders.push(order);
    });

    // Sync per provider
    for (const [providerId, { provider, orders }] of Object.entries(ordersByProvider)) {
      if (!provider.is_active) {
        console.log(`⚠️ Provider ${provider.display_name} tidak aktif, skip sync`);
        continue;
      }

      console.log(`🔄 Syncing ${orders.length} orders dari ${provider.display_name}...`);

      const statusUrl = `${provider.api_url}${provider.status_endpoint || '/status'}`;

      for (const order of orders) {
        try {
          let requestOptions = {
            method: 'POST',
            headers: {
              'User-Agent': 'CasibSMM/1.0'
            }
          };

          // Build auth data
          const authData = {
            api_id: provider.api_id,
            api_key: provider.api_key,
            secret_key: provider.secret_key,
            id: order.provider_order_id
          };

          // Configure request based on provider format
          if (provider.auth_method === 'json') {
            requestOptions.headers['Content-Type'] = 'application/json';
            requestOptions.body = JSON.stringify(authData);
          } else {
            requestOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            const formBody = new URLSearchParams();
            Object.keys(authData).forEach(key => {
              if (authData[key]) formBody.append(key, authData[key]);
            });
            requestOptions.body = formBody.toString();
          }

          const response = await fetch(statusUrl, requestOptions);
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
              console.log(`✅ Order ${order.id} (${order.provider_order_id}) dari ${provider.display_name} updated to: ${data.data.status}`);
            } else {
              console.error(`❌ Error updating order ${order.id}: ${updateError.message}`);
              errors.push(`Error updating order ${order.id}: ${updateError.message}`);
            }
          } else {
            const errorMsg = `Error from ${provider.display_name} for order ${order.provider_order_id}: ${data.data?.msg || 'Unknown error'}`;
            console.error(`❌ ${errorMsg}`);
            errors.push(errorMsg);
          }

          // Delay kecil untuk tidak overload API
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (err) {
          const errorMsg = `Error syncing order ${order.id} from ${provider.display_name}: ${err.message}`;
          console.error(`❌ ${errorMsg}`);
          errors.push(errorMsg);
        }
      }
    }

    const result = {
      message: `Sync completed. ${syncedCount} orders updated`,
      synced_count: syncedCount,
      total_orders: pendingOrders.length,
      errors: errors.length > 0 ? errors : undefined
    };

    console.log('📊 Status Sync Order:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ Error dalam auto-sync status:', error);
  }
}

// Pastikan semua router di-export dengan benar di masing-masing file router
// Contoh di setiap file router (paling bawah):
// module.exports = router;
