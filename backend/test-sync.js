// Test script untuk sync status order
require('dotenv').config({ path: '../.env' });
const fetch = require('node-fetch');
const supabase = require('./supabaseClient');

async function testSyncOrderStatus() {
  try {    console.log('🔄 Test sync status order dimulai...');
    
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
      console.log('📝 Tidak ada order pending yang perlu disync');
      return;
    }

    console.log(`📋 Ditemukan ${pendingOrders.length} order pending untuk disync:`);
    pendingOrders.forEach(order => {
      console.log(`   - Order ID: ${order.id}, Provider Order ID: ${order.provider_order_id}, Status: ${order.status}`);
    });

    const providerApiUrl = 'https://centralsmm.co.id/api/status';
    const { CENTRALSMM_API_ID, CENTRALSMM_API_KEY, CENTRALSMM_SECRET_KEY } = process.env;
    let syncedCount = 0;

    // Sync status satu per satu
    for (const order of pendingOrders) {
      try {
        console.log(`\n🔍 Checking status untuk order ${order.id} (provider: ${order.provider_order_id})`);
        
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
        console.log(`📡 Response dari CentralSMM:`, data);

        if (data.response && data.data) {
          console.log(`📊 Status dari provider: ${data.data.status}`);
          
          // Update status di database lokal
          const { error: updateError } = await supabase.rpc('sync_order_status_with_provider', {
            p_provider_order_id: order.provider_order_id,
            p_status: data.data.status,
            p_start_count: data.data.start_count || 0,
            p_remains: data.data.remains || 0
          });

          if (!updateError) {
            syncedCount++;
            console.log(`✅ Order ${order.id} berhasil diupdate ke status: ${data.data.status}`);
          } else {
            console.error(`❌ Error updating order ${order.id}: ${updateError.message}`);
          }
        } else {
          console.error(`❌ Error from provider for order ${order.provider_order_id}: ${data.data?.msg || 'Unknown error'}`);
        }

        // Delay kecil untuk tidak overload API
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (err) {
        console.error(`❌ Error syncing order ${order.id}: ${err.message}`);
      }
    }

    console.log(`\n🎯 Test sync selesai. ${syncedCount}/${pendingOrders.length} orders berhasil diupdate`);

  } catch (error) {
    console.error('❌ Error dalam test sync status:', error);
  }
}

// Jalankan test
testSyncOrderStatus().then(() => {
  console.log('\n🏁 Test sync selesai!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test sync gagal:', error);
  process.exit(1);
});
