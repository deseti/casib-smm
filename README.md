# 🚀 Casib SMM Panel

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## 📖 Deskripsi

**Casib SMM Panel** adalah platform Social Media Marketing (SMM) yang komprehensif dan modern, dibangun dengan teknologi terdepan untuk memberikan pengalaman pengguna yang luar biasa. Platform ini menyediakan layanan lengkap mulai dari pemesanan layanan SMM, sistem deposit yang aman, mass order untuk efisiensi, hingga sistem referral/afiliasi yang canggih untuk pertumbuhan bisnis.

## ✨ Fitur Utama

### 🏠 Dashboard & Manajemen
- **Dashboard Interaktif** - Statistik real-time dengan visualisasi yang menarik
- **Multi-Authentication** - Login dengan Email/Password dan Google OAuth
- **Manajemen Profil** - Update profil lengkap dengan upload avatar
- **Real-time Statistics** - Monitor pesanan, saldo, dan aktivitas secara real-time
- **Responsive Design** - Optimal di desktop, tablet, dan mobile

### 🛒 Sistem Pemesanan
- **Single Order** - Pemesanan layanan individual dengan validasi lengkap
- **Mass Order** - Pemesanan massal untuk multiple links dengan kalkulasi otomatis
- **Auto Status Sync** - Sinkronisasi status pesanan otomatis dengan provider
- **Order History** - Riwayat pesanan lengkap dengan filter dan pencarian
- **Real-time Validation** - Validasi parameter dan saldo sebelum pemesanan

### 💰 Sistem Keuangan
- **Deposit System** - Sistem deposit dengan validasi admin dan unique amount
- **Balance Management** - Manajemen saldo otomatis dengan history transaksi
- **Multi-Payment Support** - Mendukung berbagai metode pembayaran
- **Admin Approval** - Sistem persetujuan deposit oleh admin
- **Transaction Security** - Enkripsi dan validasi setiap transaksi

### 🤝 Sistem Referral/Afiliasi
- **Kode Referral Unik** - Generate kode referral otomatis untuk setiap user
- **Komisi Otomatis** - Sistem komisi 5% otomatis untuk setiap pesanan referred user
- **Admin Approval** - Sistem persetujuan komisi oleh admin
- **Tracking Lengkap** - Pelacakan referral dan komisi yang detail
- **Real-time Validation** - Validasi kode referral real-time saat registrasi
- **Social Sharing** - Share link referral ke berbagai platform

### 🛡️ Admin Panel
- **User Management** - Kelola semua user dan aktivitas mereka
- **Deposit Management** - Approve/reject deposit dengan catatan
- **Service Sync** - Sinkronisasi layanan otomatis dari provider dengan markup
- **Referral Management** - Kelola komisi referral dan payout
- **Real-time Monitoring** - Monitor sistem secara real-time

### 🔄 Integrasi Provider
- **CentralSMM Integration** - Integrasi penuh dengan CentralSMM API
- **Auto Service Sync** - Sinkronisasi layanan otomatis dengan markup 10%
- **Real-time Status** - Update status pesanan real-time dari provider
- **Error Handling** - Penanganan error yang robust
- **Provider Testing** - Tools untuk test koneksi dan status provider

## 🏗️ Arsitektur Teknologi

### Frontend Stack
```
React 18 + TypeScript + Vite
├── UI Framework: Radix UI + Tailwind CSS
├── State Management: React Hooks + Context
├── Routing: React Router DOM v6
├── HTTP Client: Fetch API
├── Authentication: JWT + Google OAuth
├── Icons: Lucide React
├── Notifications: React Hot Toast
├── Build Tool: Vite (ES modules, fast HMR)
├── Code Quality: ESLint + TypeScript strict mode
└── Styling: Tailwind CSS + Custom CSS Variables
```

### Backend Stack
```
Node.js + Express.js
├── Database: Supabase (PostgreSQL)
├── Authentication: JWT + bcrypt + Google OAuth Library
├── Email Service: Nodemailer
├── File Upload: Multer
├── Background Jobs: node-cron
├── External API: CentralSMM Provider Integration
├── Security: CORS, Input Validation, SQL Injection Protection
├── Environment: dotenv configuration
└── Process Management: PM2 ready
```

### Database Schema (PostgreSQL via Supabase)
```
Database Tables:
├── users (Authentication, Profile, Balance, Referral)
│   ├── id (UUID, Primary Key)
│   ├── email (Unique, Authentication)
│   ├── password_hash (bcrypt encrypted)
│   ├── full_name (User display name)
│   ├── balance (Current balance)
│   ├── referral_code (Unique referral code)
│   ├── referred_by (Referrer code)
│   ├── is_referral_active (Enable/disable referral)
│   └── referral_earnings (Total earnings)
├── services (SMM Services dengan markup dari Provider)
│   ├── id (Primary Key)
│   ├── provider_service_id (CentralSMM service ID)
│   ├── name (Service name)
│   ├── category (Service category)
│   ├── price_per_1000 (Price with 10% markup)
│   ├── original_price (Original provider price)
│   ├── min_order, max_order (Order limits)
│   └── description (Service description)
├── orders (Single & Mass Orders dengan tracking)
│   ├── id (Primary Key)
│   ├── user_id (Foreign Key to users)
│   ├── service_id (Foreign Key to services)
│   ├── provider_order_id (CentralSMM order ID)
│   ├── quantity, link (Order details)
│   ├── total_price (Order price)
│   ├── status (pending, processing, completed, etc.)
│   └── created_at, updated_at (Timestamps)
├── deposits (Payment System dengan unique amount)
│   ├── id (Primary Key)
│   ├── user_id (Foreign Key to users)
│   ├── amount (Deposit amount)
│   ├── unique_amount (Amount + unique code)
│   ├── status (pending, approved, rejected)
│   ├── payment_method (Transfer method)
│   └── admin_notes (Admin approval notes)
├── referral_transactions (Commission Tracking)
│   ├── id (Primary Key)
│   ├── referrer_id (User who gets commission)
│   ├── referred_user_id (User who made order)
│   ├── order_id (Related order)
│   ├── commission_amount (5% commission)
│   ├── order_amount (Original order amount)
│   ├── status (pending, approved, rejected)
│   └── processed_by (Admin who approved)
├── referral_payouts (Commission Payments)
│   ├── id (Primary Key)
│   ├── user_id (Recipient)
│   ├── amount (Payout amount)
│   ├── transaction_ids (Array of transaction IDs)
│   ├── status (pending, completed, failed)
│   └── processed_at (Payment timestamp)
└── Views: referral_summary (Statistics aggregation)
    ├── User referral statistics
    ├── Total commissions earned
    ├── Number of referrals
    └── Commission breakdown
```

### Key Features Architecture
```
Authentication Flow:
Email/Password → bcrypt hash → JWT token
Google OAuth → verify token → create/login user → JWT token

Order Processing:
User Order → Validate Service & Balance → Send to CentralSMM → 
Store Local Order → Auto Status Sync → Referral Commission

Mass Order:
Multiple Links → Bulk Validation → Individual Orders → 
Aggregate Results → Balance Deduction → Status Tracking

Referral System:
User Registration with Code → Validate Referrer → 
Order Creation → Auto Commission Calculation → 
Admin Approval → Balance Addition

Service Sync:
CentralSMM API → Fetch Services → Apply 10% Markup → 
Store to Database → Update Existing Services

Background Jobs:
Auto Status Sync (1 hour interval) → Check Pending Orders → 
Update from CentralSMM → Update Local Database
```

## 📦 Setup & Installation

### Prerequisites
- **Node.js** v18+ (Backend runtime)
- **npm/pnpm** (Package Manager)
- **Supabase Account** (Database & Authentication)
- **CentralSMM API** (SMM Provider Access)
- **Google Cloud Console** (OAuth Setup)

### 1. Clone Repository
```bash
git clone https://github.com/your-username/casib-smm-frontend.git
cd casib-smm-frontend
```

### 2. Install Dependencies

**Frontend:**
```bash
npm install
# atau
pnpm install
```

**Backend:**
```bash
cd backend
npm install
# atau
pnpm install
```

### 3. Environment Configuration

Buat file `.env` di root directory:
```env
# Frontend (Vite)
VITE_GOOGLE_CLIENT_ID="your-google-client-id"

# Backend (Node.js)
GOOGLE_CLIENT_ID="your-google-client-id"

# Supabase Configuration
SUPABASE_URL="your-supabase-url"
SUPABASE_SERVICE_KEY="your-supabase-service-key"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key"

# CentralSMM Provider
CENTRALSMM_API_ID="your-api-id"
CENTRALSMM_API_KEY="your-api-key"
CENTRALSMM_SECRET_KEY="your-secret-key"

# Email Configuration (Optional)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

### 4. Database Setup

**Jalankan SQL Scripts di Supabase SQL Editor:**

1. **Setup Database Schema:**
```sql
-- Buat tabel dasar (users, services, orders, deposits)
-- File: setup_database.sql
```

2. **Setup Referral System:**
```sql
-- Jalankan file: setup_referral_complete.sql
-- Ini akan membuat:
-- - Kolom referral di tabel users
-- - Tabel referral_transactions
-- - Tabel referral_payouts
-- - Functions dan triggers otomatis
-- - Views untuk statistics
```

3. **Verify Tables:**
```sql
-- Cek semua tabel sudah ada
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

### 5. Google OAuth Setup

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih existing project
3. Enable Google+ API
4. Buat OAuth 2.0 Client ID
5. Tambahkan authorized origins:
   - `http://localhost:5173` (development)
   - `https://your-domain.com` (production)
6. Copy Client ID ke `.env`

### 6. CentralSMM Provider Setup

1. Daftar di [CentralSMM](https://centralsmm.co.id/)
2. Dapatkan API credentials (API ID, API Key, Secret Key)
3. Tambahkan credentials ke `.env`
4. Test koneksi dengan endpoint `/api/provider/profile`

### 7. Jalankan Aplikasi

**Development Mode:**

Terminal 1 (Frontend):
```bash
npm run dev
# Aplikasi: http://localhost:5173
```

Terminal 2 (Backend):
```bash
cd backend
node index.js
# Server: http://localhost:3001
```

**Production Build:**
```bash
# Build frontend
npm run build
npm run preview

# Start backend
cd backend
npm start
```

## 🔧 Konfigurasi Lanjutan

### Service Sync dengan Markup

Untuk sync layanan dari CentralSMM dengan markup 10%:
```bash
cd backend
node resync-markup.js
```

Script ini akan:
- Mengambil semua layanan dari CentralSMM
- Menerapkan markup 10% pada harga
- Menyimpan ke database lokal
- Menampilkan summary hasil sync

### Auto Status Sync

Backend menggunakan `node-cron` untuk auto-sync status order:
```javascript
// Berjalan setiap 1 jam
cron.schedule('0 * * * *', async () => {
  await autoSyncOrderStatus();
});
```

Untuk mengubah interval, edit file `backend/index.js`:
```javascript
// Setiap 30 menit
cron.schedule('*/30 * * * *', async () => {
  await autoSyncOrderStatus();
});
```

### Database Functions

Sistem menggunakan PostgreSQL functions untuk:

1. **Generate Referral Code:**
```sql
SELECT generate_referral_code_for_user('user-uuid');
```

2. **Add Referral Commission:**
```sql
SELECT add_referral_commission(order_id, user_id, order_amount);
```

3. **Update Balance:**
```sql
SELECT add_balance('user-uuid', amount);
```

### Environment Variables

**Frontend (.env):**
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_API_BASE_URL=http://localhost:3001
```

**Backend (.env):**
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-supabase-service-key

# Authentication
GOOGLE_CLIENT_ID=your-google-client-id
JWT_SECRET=your-jwt-secret

# External Services
CENTRALSMM_API_ID=your-api-id
CENTRALSMM_API_KEY=your-api-key
CENTRALSMM_SECRET_KEY=your-secret-key

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 📱 API Documentation

### Authentication Endpoints

#### POST /auth/register
Register user baru dengan dukungan referral code
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "full_name": "John Doe",
  "referral_code": "ABC12345" // Optional
}
```

#### POST /auth/login
Login dengan email dan password
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### POST /auth/verify-token
Verify Google OAuth token
```json
{
  "token": "google-oauth-token"
}
```

#### POST /auth/forgot-password
Request password reset
```json
{
  "email": "user@example.com"
}
```

### User Endpoints

#### GET /api/dashboard/stats
Dapatkan statistik dashboard user
```json
{
  "balance": 150000,
  "totalOrders": 45,
  "pendingOrders": 3,
  "successOrders": 40
}
```

#### GET /api/services
List semua layanan SMM
```json
[
  {
    "id": 1,
    "name": "Instagram Followers [Real]",
    "category": "Instagram",
    "price_per_1000": 15000,
    "min_order": 100,
    "max_order": 10000,
    "description": "High quality Instagram followers"
  }
]
```

#### POST /api/orders
Buat order single
```json
{
  "service_id": 1,
  "quantity": 1000,
  "link": "https://instagram.com/username"
}
```

#### POST /api/orders/mass
Buat mass order (multiple links)
```json
{
  "service_id": 1,
  "quantity": 1000,
  "links": [
    "https://instagram.com/user1",
    "https://instagram.com/user2",
    "https://instagram.com/user3"
  ]
}
```

#### GET /api/orders/history
History order user dengan pagination
```json
{
  "page": 1,
  "limit": 20,
  "total": 45,
  "orders": [
    {
      "id": 123,
      "service_name": "Instagram Followers",
      "quantity": 1000,
      "link": "https://instagram.com/user",
      "status": "completed",
      "total_price": 15000,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Deposit Endpoints

#### POST /api/deposits/create
Buat permintaan deposit
```json
{
  "amount": 100000
}
```

Response:
```json
{
  "message": "Permintaan deposit dibuat",
  "deposit": {
    "id": 456,
    "amount": 100000,
    "unique_amount": 100456,
    "status": "pending"
  }
}
```

### Referral Endpoints

#### GET /api/referral/my-stats
Statistik referral user
```json
{
  "user": {
    "referral_code": "ABC12345",
    "total_referrals": 5,
    "total_earnings": 75000,
    "is_referral_active": true
  },
  "stats": {
    "pending_commissions": 2,
    "approved_commissions": 8,
    "total_commission_amount": 75000
  },
  "referred_users": [
    {
      "email": "referred@example.com",
      "full_name": "Jane Doe",
      "total_orders": 3,
      "total_spent": 45000,
      "joined_at": "2024-01-10T08:00:00Z"
    }
  ]
}
```

#### GET /api/referral/validate-code
Validasi kode referral real-time
```
GET /api/referral/validate-code?code=ABC12345
```

Response:
```json
{
  "valid": true,
  "referrer_id": "uuid",
  "referrer_name": "John Doe",
  "message": "Kode valid! Dari John Doe"
}
```

#### POST /api/referral/share
Generate sharing links untuk berbagai platform
```json
{
  "platform": "whatsapp" // whatsapp, telegram, facebook, twitter, copy
}
```

### Admin Endpoints

#### GET /api/admin/users
List semua user (Admin only)
```json
{
  "page": 1,
  "total": 150,
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "balance": 50000,
      "total_orders": 10,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### GET /api/admin/deposits/pending
Deposit pending approval
```json
[
  {
    "id": 123,
    "amount": 100000,
    "unique_amount": 100456,
    "user_email": "user@example.com",
    "user_full_name": "John Doe",
    "created_at": "2024-01-15T10:00:00Z"
  }
]
```

#### POST /api/admin/deposits/approve/:id
Approve deposit
```json
{
  "notes": "Payment verified via bank transfer"
}
```

#### POST /api/admin/sync-services
Sync layanan dari CentralSMM dengan markup
```json
{
  "message": "Sinkronisasi layanan berhasil",
  "synced_count": 245
}
```

#### GET /api/admin/referral/pending
Komisi referral pending approval
```json
[
  {
    "id": 789,
    "commission_amount": 7500,
    "order_amount": 150000,
    "referrer": {
      "email": "referrer@example.com",
      "full_name": "Jane Doe"
    },
    "referred_user": {
      "email": "newuser@example.com",
      "full_name": "Bob Smith"
    },
    "created_at": "2024-01-15T12:00:00Z"
  }
]
```

#### POST /api/admin/referral/approve/:id
Approve komisi referral
```json
{
  "add_to_balance": true,
  "notes": "Commission approved and added to balance"
}
```
```

**Backend:**
```bash
cd backend
npm install
# atau
pnpm install
```

### 3. Environment Setup

**Frontend (.env):**
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

**Backend (.env):**
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id

# CentralSMM Provider
CENTRALSMM_API_ID=your_centralsmm_api_id
CENTRALSMM_API_KEY=your_centralsmm_api_key
CENTRALSMM_SECRET_KEY=your_centralsmm_secret_key

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 4. Database Setup

**Jalankan SQL Scripts di Supabase SQL Editor:**

1. **Setup Database:**
```sql
-- Jalankan file: setup_database.sql
```

2. **Setup Referral System:**
```sql
-- Jalankan file: referral_system.sql
-- Atau: setup_referral_complete.sql
```

3. **Update Orders Table:**
```sql
-- Jalankan file: update_orders_table.sql
```

### 5. Jalankan Aplikasi

**Development Mode:**

Terminal 1 (Frontend):
```bash
npm run dev
# Buka: http://localhost:5173
```

Terminal 2 (Backend):
```bash
cd backend
node index.js
# Server: http://localhost:3001
```

**Production Build:**
```bash
npm run build
npm run preview
```

## 🎯 Panduan Penggunaan

### Untuk User

#### 1. **Registrasi & Login**
- Daftar dengan email/password atau Google
- Gunakan kode referral untuk bonus (opsional)
- Verifikasi email jika diperlukan

#### 2. **Deposit Saldo**
- Masuk ke halaman Deposit
- Masukkan nominal deposit
- Transfer ke nomor virtual account yang diberikan
- Tunggu konfirmasi admin

#### 3. **Membuat Order**
- **Single Order:** Pilih layanan → Masukkan link → Tentukan quantity → Order
- **Mass Order:** Pilih layanan → Masukkan multiple link → Order sekaligus

#### 4. **Tracking Order**
- Lihat status real-time di History
- Status: Pending → Processing → Completed/Cancelled

#### 5. **Program Referral**
- Dapatkan kode referral unik
- Share ke teman melalui link khusus
- Terima komisi 5% dari transaksi referral

### Untuk Admin

#### 1. **Manajemen Deposit**
- Review deposit pending
- Approve/reject deposit user
- Monitor history pembayaran

#### 2. **Manajemen Services**
- Sync layanan dari CentralSMM
- Update harga dengan markup 10%
- Monitor performa layanan

#### 3. **Manajemen Referral**
- Review komisi pending
- Approve pembayaran komisi
- Monitor top referrers

#### 4. **Provider Management**
- Test koneksi ke CentralSMM
- Sync status order otomatis
- Monitor API usage

## 🔗 Integrasi Provider

### CentralSMM Integration

Platform terintegrasi penuh dengan **CentralSMM** sebagai provider utama:

#### Features:
- ✅ **Auto Service Sync** - Sinkronisasi layanan otomatis
- ✅ **Real-time Order** - Pembuatan order langsung ke provider
- ✅ **Status Tracking** - Monitoring status real-time
- ✅ **Markup System** - Profit 10% otomatis
- ✅ **Auto-sync Status** - Update status setiap 1 jam

#### API Endpoints Used:
```javascript
// Get Services
POST https://centralsmm.co.id/api/services

// Create Order  
POST https://centralsmm.co.id/api/create-order

// Check Status
POST https://centralsmm.co.id/api/status
```

## 📱 API Documentation

### Authentication Endpoints
```
POST /auth/register          # Register user baru
POST /auth/login             # Login dengan email/password
POST /auth/verify-token      # Verify Google OAuth token
POST /auth/forgot-password   # Request reset password
POST /auth/reset-password    # Reset password dengan token
```

### User Endpoints
```
GET  /api/dashboard/stats    # Dashboard statistics
GET  /api/services           # List semua layanan
POST /api/orders/create      # Buat order single
POST /api/orders/mass        # Buat mass order
GET  /api/orders/history     # History order user
POST /api/deposits/create    # Buat deposit request
```

### Referral Endpoints
```
GET  /api/referral/my-stats        # Statistik referral user
GET  /api/referral/validate-code   # Validasi kode referral
POST /api/referral/share          # Generate sharing links
```

### Admin Endpoints
```
GET  /api/admin/users              # List semua user
GET  /api/admin/deposits/pending   # Deposit pending approval
POST /api/admin/deposits/approve   # Approve deposit
POST /api/admin/sync-services      # Sync layanan dari provider
GET  /api/admin/referral/stats     # Admin referral statistics
POST /api/admin/referral/approve   # Approve komisi referral
```

## 🔧 Konfigurasi

### Markup Configuration
```javascript
// Default markup 10% di backend/provider.js
const MARKUP_PERCENTAGE = 0.10; // 10%
```

### Auto-sync Configuration
```javascript
// Interval sync di backend/index.js
cron.schedule('0 * * * *', async () => {
  // Setiap 1 jam sekali
  await autoSyncOrderStatus();
});
```

### Email Configuration
Setup untuk fitur lupa password:
```javascript
// backend/emailService.js
const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## 🛡️ Keamanan

### Implementasi Keamanan:
- **JWT Token** dengan expiry 24 jam
- **bcrypt** untuk hash password
- **Input Validation** pada semua endpoint
- **Role-based Access Control** (RBAC)
- **SQL Injection Protection** via Supabase ORM
- **CORS** configuration untuk domain tertentu
- **Rate Limiting** pada API sensitif

### Best Practices:
- Environment variables untuk credential
- Secure password requirements
- Token refresh mechanism
- Audit logging untuk admin actions

## 📊 Monitoring & Analytics

### Built-in Analytics:
- **User Statistics** - Registrasi, login, aktivitas
- **Order Analytics** - Volume, success rate, revenue
- **Referral Tracking** - Komisi, top referrers
- **Provider Performance** - Response time, success rate
- **Financial Reports** - Deposit, withdraw, profit

### Error Monitoring:
```javascript
// Comprehensive error logging
console.error('Error details:', {
  endpoint: req.path,
  user: req.user?.id,
  error: error.message,
  timestamp: new Date()
});
```

## 🚀 Deployment

### Recommended Stack:
- **Frontend:** Vercel, Netlify, atau VPS
- **Backend:** Railway, Heroku, atau VPS
- **Database:** Supabase (managed PostgreSQL)
- **CDN:** Cloudflare untuk asset optimization

### Environment Setup:
```bash
# Production environment
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=your_production_db_url

# External Services
CENTRALSMM_API_URL=https://centralsmm.co.id/api
```

## 🔄 Update & Maintenance

### Regular Tasks:
1. **Service Sync** - Update layanan dari provider
2. **Status Sync** - Update status order otomatis
3. **Database Cleanup** - Archive old records
4. **Security Updates** - Update dependencies
5. **Backup Database** - Regular backup schedule

### Monitoring Checklist:
- [ ] API Response times
- [ ] Database performance
- [ ] Error rates
- [ ] User activity
- [ ] Provider connectivity

## 📞 Support & Contact

### Developer Info:
- **GitHub:** [https://github.com/deseti/casib-smm](https://github.com/deseti/casib-smm)
- **Repository:** casib-smm
- **License:** MIT

### Technical Support:
- Untuk bug reports: Buka issue di GitHub
- Untuk feature requests: Discussion tab
- Untuk pertanyaan: Check documentation terlebih dahulu

## 🤝 Contributing

Kontribusi sangat diterima! Silakan:

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

### Development Guidelines:
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests untuk fitur baru
- Update documentation

## 📝 Changelog

### v1.0.0 (Current)
- ✅ Complete SMM Panel with provider integration
- ✅ Referral/Affiliate system
- ✅ Mass order functionality
- ✅ Admin panel lengkap
- ✅ Real-time order tracking
- ✅ Automated service sync
- ✅ Modern UI/UX design

### Roadmap:
- [ ] Mobile app (React Native)
- [ ] Multi-provider support
- [ ] Advanced analytics dashboard
- [ ] API rate limiting
- [ ] Subscription packages
- [ ] WhatsApp integration

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Built with ❤️ by [Deseti](https://github.com/deseti)**

*Casib SMM Panel - Complete Social Media Marketing Solution*
