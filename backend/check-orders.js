// Script untuk melihat semua order dan statusnya
require('dotenv').config({ path: '../.env' });
const supabase = require('./supabaseClient');

async function checkAllOrders() {
  try {
    console.log('📋 Mengambil semua order...');
    
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, provider_order_id, status, created_at, services(name)')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    if (!orders || orders.length === 0) {
      console.log('❌ Tidak ada order ditemukan');
      return;
    }

    console.log(`\n📊 Ditemukan ${orders.length} order terakhir:`);
    console.log('=' .repeat(80));
    
    orders.forEach((order, index) => {
      console.log(`${index + 1}. Order ID: ${order.id}`);
      console.log(`   Provider Order ID: ${order.provider_order_id || 'NULL'}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Layanan: ${order.services?.name || 'Unknown'}`);
      console.log(`   Created: ${new Date(order.created_at).toLocaleString('id-ID')}`);
      console.log('-'.repeat(40));
    });

    // Cek order dengan status pending/processing
    const pendingOrders = orders.filter(order => 
      ['pending', 'processing', 'in_progress'].includes(order.status.toLowerCase()) &&
      order.provider_order_id
    );

    if (pendingOrders.length > 0) {
      console.log(`\n🔄 Order yang perlu disync (${pendingOrders.length}):`);
      pendingOrders.forEach(order => {
        console.log(`   - Order ${order.id}: status=${order.status}, provider_id=${order.provider_order_id}`);
      });
    } else {
      console.log('\n✅ Tidak ada order pending yang perlu disync');
    }

  } catch (error) {
    console.error('❌ Error mengambil data order:', error);
  }
}

// Jalankan pengecekan
checkAllOrders().then(() => {
  console.log('\n🏁 Pengecekan selesai!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Pengecekan gagal:', error);
  process.exit(1);
});
