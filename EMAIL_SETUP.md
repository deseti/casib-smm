# 📧 Setup Email untuk Reset Password

## Status Saat Ini
✅ Fitur "Lupa Password" sudah terimplementasi lengkap di halaman login  
✅ Backend endpoint `/auth/forgot-password` sudah berfungsi  
✅ Database sudah siap dengan kolom `reset_token` dan `reset_token_expires`  
⚠️ **Pengiriman email butuh konfigurasi tambahan**

## Cara Setup Email (Gmail)

### 1. Persiapan Gmail
1. Buka [Google Account Settings](https://myaccount.google.com/)
2. Pilih **Security** > **2-Step Verification** (aktifkan jika belum)
3. Pilih **App passwords**
4. Generate app password untuk "Mail"
5. Salin 16-digit app password yang diberikan

### 2. Update File .env
Buka file `.env` dan ganti nilai berikut:
```bash
EMAIL_USER=email-anda@gmail.com
EMAIL_PASS=app-password-16-digit
```

### 3. Restart Backend
```bash
cd backend
node index.js
```

## Alternative: Provider Email Lain

Jika tidak pakai Gmail, edit `backend/emailService.js` bagian `createTransporter()`:

```javascript
// Untuk Outlook/Hotmail
return nodemailer.createTransporter({
  service: 'hotmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Untuk SMTP custom
return nodemailer.createTransporter({
  host: 'smtp.your-provider.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## Testing

Setelah setup email:
1. Buka halaman login
2. Klik "Lupa Password?"
3. Masukkan email yang terdaftar
4. Cek email masuk (dan folder spam)

## Mode Development

Jika email belum dikonfigurasi, sistem akan:
- Tetap menyimpan reset token ke database
- Log reset link ke console backend
- Return reset link dalam response (development mode)

Cek console backend untuk melihat reset link yang generated.
