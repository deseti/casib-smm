// Script untuk re-sync services dengan markup 10% yang benar
require('dotenv').config({ path: '../.env' });
const supabase = require('./supabaseClient');
const fetch = require('node-fetch');

async function reSyncServicesWithMarkup() {
  try {
    console.log('🔄 Re-sync services dengan markup 10% yang benar...\n');

    // 1. Ambil services terbaru dari CentralSMM
    const providerApiUrl = 'https://centralsmm.co.id/api/services';
    const { CENTRALSMM_API_ID, CENTRALSMM_API_KEY, CENTRALSMM_SECRET_KEY } = process.env;

    const formBody = new URLSearchParams();
    formBody.append('api_id', CENTRALSMM_API_ID);
    formBody.append('api_key', CENTRALSMM_API_KEY);
    formBody.append('secret_key', CENTRALSMM_SECRET_KEY);

    console.log('📡 Mengambil data services dari CentralSMM...');
    const response = await fetch(providerApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody.toString(),
    });

    const providerData = await response.json();

    if (!providerData.response || !Array.isArray(providerData.data)) {
      throw new Error('Gagal mengambil data services dari provider');
    }

    const servicesFromProvider = providerData.data;
    console.log(`✅ Ditemukan ${servicesFromProvider.length} services dari CentralSMM\n`);

    // 2. Update semua services dengan markup 10%
    const markupPercentage = 0.10; // 10% markup
    let updatedCount = 0;

    for (const service of servicesFromProvider) {
      const originalPrice = parseFloat(service.price);
      const markedUpPrice = originalPrice * (1 + markupPercentage);
      
      // Update di database
      const { error } = await supabase
        .from('services')
        .upsert({
          provider_service_id: service.id,
          name: service.service_name,
          category: service.category_name,
          category_name: service.category_name,
          price_per_1000: markedUpPrice, // Harga dengan markup 10%
          original_price: originalPrice, // Harga asli dari provider
          min_order: service.min,
          max_order: service.max,
          refill: service.refill,
          description: service.description,
        }, {
          onConflict: 'provider_service_id'
        });

      if (!error) {
        updatedCount++;
        
        // Log untuk beberapa contoh pertama
        if (updatedCount <= 5) {
          console.log(`📊 ${service.service_name.substring(0, 50)}...`);
          console.log(`   Provider ID: ${service.id}`);
          console.log(`   Original Price: Rp ${originalPrice.toFixed(3)}/1k`);
          console.log(`   Markup Price: Rp ${markedUpPrice.toFixed(3)}/1k`);
          console.log(`   Profit: Rp ${(markedUpPrice - originalPrice).toFixed(3)}/1k (10%)`);
          console.log('-'.repeat(60));
        }
      } else {
        console.error(`❌ Error updating service ${service.id}:`, error.message);
      }
    }

    console.log(`\n🎯 Re-sync selesai!`);
    console.log(`✅ ${updatedCount}/${servicesFromProvider.length} services berhasil diupdate`);
    console.log(`💰 Semua harga sudah ter-markup 10%`);
    console.log(`📱 Frontend akan menampilkan harga dengan markup`);

    // 3. Tampilkan contoh services yang sudah ter-markup
    console.log(`\n📋 Sample services setelah markup:`);
    const { data: sampleServices } = await supabase
      .from('services')
      .select('id, name, original_price, price_per_1000')
      .limit(5);

    if (sampleServices) {
      sampleServices.forEach((service, index) => {
        const profit = service.price_per_1000 - service.original_price;
        const markupPercent = ((profit / service.original_price) * 100).toFixed(2);
        
        console.log(`${index + 1}. ${service.name.substring(0, 40)}...`);
        console.log(`   User Price: Rp ${service.price_per_1000.toFixed(3)}/1k`);
        console.log(`   Provider Cost: Rp ${service.original_price.toFixed(3)}/1k`);
        console.log(`   Profit: Rp ${profit.toFixed(3)}/1k (${markupPercent}%)`);
      });
    }

  } catch (error) {
    console.error('❌ Error re-sync services:', error);
  }
}

// Jalankan re-sync
reSyncServicesWithMarkup().then(() => {
  console.log('\n🏁 Re-sync services dengan markup selesai!');
  console.log('💡 Sekarang refresh frontend untuk melihat harga baru');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Re-sync gagal:', error);
  process.exit(1);
});
