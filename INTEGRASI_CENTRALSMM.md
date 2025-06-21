# INTEGRASI CENTRALSMM - DOKUMENTASI

## STATUS INTEGRASI ✅

Aplikasi SMM Panel Anda sekarang **SUDAH TERHUBUNG LANGSUNG** dengan provider CentralSMM. Berikut adalah fitur yang sudah terimplementasi:

## FITUR YANG SUDAH ADA:

### 1. 🔄 **SINKRONISASI LAYANAN**
- **File**: `backend/admin.js` + `AdminProviderPage.tsx`
- **Endpoint**: `/api/admin/sync-services`
- **Fungsi**: Mengambil semua layanan dari CentralSMM dan menyimpan ke database lokal
- **Cara**: Admin → Provider Management → "Sinkronisasi Layanan Provider"

### 2. 🛒 **PEMBUATAN ORDER OTOMATIS**
- **File**: `backend/orders.js` + `NewOrderPage.tsx`
- **Endpoint**: `/api/orders` (POST)
- **Fungsi**: 
  - Validasi saldo user
  - Kirim order ke CentralSMM
  - Simpan order ke database dengan provider_order_id
  - Kurangi saldo user secara otomatis
- **Cara**: User → New Order → Pilih layanan → Submit

### 3. 📊 **TRACKING STATUS ORDER**
- **File**: `backend/orders.js` + `AdminProviderPage.tsx`
- **Endpoint**: `/api/orders/sync-status`
- **Fungsi**: Sinkronisasi status semua order pending dengan CentralSMM
- **Cara**: Admin → Provider Management → "Sync Status Order"

### 4. 🧪 **TEST KONEKSI**
- **File**: `backend/provider.js` + `AdminProviderPage.tsx`
- **Endpoint**: `/api/provider/profile`
- **Fungsi**: Cek koneksi dan saldo di CentralSMM
- **Cara**: Admin → Provider Management → "Test Koneksi"

## DATABASE YANG DIUPDATE:

### Table `orders` - Kolom Baru:
- `provider_order_id` - ID order dari CentralSMM
- `start_count` - Initial count saat order dimulai
- `remains` - Sisa quantity yang belum selesai

### Stored Procedures Baru:
- `create_order_with_provider()` - Buat order dengan integrasi provider
- `sync_order_status_with_provider()` - Update status dari provider

## ALUR KERJA ORDER:

```
1. User pilih layanan di frontend
2. Frontend kirim ke `/api/orders`
3. Backend validasi saldo & data
4. Backend kirim order ke CentralSMM API
5. Jika berhasil: simpan ke database + kurangi saldo
6. Return response ke frontend
7. Admin bisa sync status order secara berkala
```

## SETUP YANG DIPERLUKAN:

### 1. **Environment Variables** (sudah ada):
```
CENTRALSMM_API_ID=48298
CENTRALSMM_API_KEY=850893d173f31c8b3f41bba9a2d07a5dcfe2213c8abbfbb4f9def771e9a92eae
CENTRALSMM_SECRET_KEY=EKZDSzurBm
```

### 2. **Database Update**:
Jalankan file `update_orders_table.sql` di Supabase SQL Editor

### 3. **Testing**:
1. Restart backend: `cd backend && node index.js`
2. Login sebagai admin
3. Test koneksi provider
4. Sync layanan dari CentralSMM
5. Buat order sebagai user biasa
6. Sync status order

## API ENDPOINTS CENTRALSMM YANG DIGUNAKAN:

1. **Profile**: `https://centralsmm.co.id/api/profile`
   - Cek saldo dan info akun

2. **Services**: `https://centralsmm.co.id/api/services`
   - Ambil daftar layanan

3. **Order**: `https://centralsmm.co.id/api/order`
   - Buat order baru

4. **Status**: `https://centralsmm.co.id/api/status`
   - Cek status order

## FITUR OTOMATIS:

✅ **Order langsung dikirim ke provider**
✅ **Saldo otomatis terpotong**
✅ **Provider order ID tersimpan**
✅ **Status tracking**
✅ **Error handling lengkap**

## NEXT STEPS (Opsional):

1. **Auto-sync status** dengan cron job
2. **Email notification** saat order selesai
3. **Refund otomatis** jika order gagal
4. **Real-time status update** dengan WebSocket

## CARA TEST:

1. **Sync Layanan**:
   ```
   Admin Panel → Provider Management → Sinkronisasi Layanan
   ```

2. **Buat Order**:
   ```
   User → New Order → Pilih Instagram Followers → Input link & quantity → Submit
   ```

3. **Cek Status**:
   ```
   Admin Panel → Provider Management → Sync Status Order
   ```

**🎉 APLIKASI ANDA SUDAH FULLY INTEGRATED DENGAN CENTRALSMM! 🎉**
