// Test script untuk melihat perhitungan markup
require('dotenv').config({ path: '../.env' });
const supabase = require('./supabaseClient');

async function testMarkupCalculation() {
  try {
    console.log('🧮 Testing Markup Calculation System...\n');
    
    // Ambil beberapa service untuk test
    const { data: services, error } = await supabase
      .from('services')
      .select('id, name, price_per_1000, original_price, min_order')
      .limit(5);

    if (error) throw error;

    console.log('📋 Sample Services with Markup:');
    console.log('='.repeat(80));
    
    services.forEach((service, index) => {
      const currentPrice = service.price_per_1000;
      const originalPrice = service.original_price || (currentPrice / 1.10);
      const markup = currentPrice - originalPrice;
      const markupPercent = ((markup / originalPrice) * 100).toFixed(2);
      
      console.log(`${index + 1}. ${service.name.substring(0, 50)}...`);
      console.log(`   ID: ${service.id}`);
      console.log(`   📊 Original Price (Provider): Rp ${originalPrice.toFixed(3)}/1k`);
      console.log(`   💰 User Price (With Markup): Rp ${currentPrice.toFixed(3)}/1k`);
      console.log(`   🎯 Profit per 1000: Rp ${markup.toFixed(3)}`);
      console.log(`   📈 Markup: ${markupPercent}%`);
      console.log(`   📦 Min Order: ${service.min_order}`);
      
      // Contoh calculation untuk min order
      const minOrderCost = (service.min_order / 1000) * originalPrice;
      const minOrderPrice = (service.min_order / 1000) * currentPrice;
      const minOrderProfit = minOrderPrice - minOrderCost;
      
      console.log(`   🔹 For min order (${service.min_order}):`);
      console.log(`      Provider Cost: Rp ${minOrderCost.toFixed(2)}`);
      console.log(`      User Pays: Rp ${minOrderPrice.toFixed(2)}`);
      console.log(`      Profit: Rp ${minOrderProfit.toFixed(2)}`);
      console.log('-'.repeat(60));
    });

    console.log('\n💡 Summary:');
    console.log('- User akan membayar harga dengan markup 10%');
    console.log('- Provider akan dicharge harga original');
    console.log('- Profit = User Price - Provider Cost');
    console.log('- Sistem otomatis menghitung markup untuk setiap transaksi');

  } catch (error) {
    console.error('❌ Error testing markup:', error);
  }
}

// Jalankan test
testMarkupCalculation().then(() => {
  console.log('\n🏁 Test markup calculation selesai!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test gagal:', error);
  process.exit(1);
});
