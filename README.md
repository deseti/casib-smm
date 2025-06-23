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
- **Multi Provider Management** - Kelola multiple SMM service providers
- **Provider Testing** - Test koneksi dan validasi credentials provider
- **Bulk Sync** - Sinkronisasi layanan dari semua provider sekaligus
- **Referral Management** - Kelola komisi referral dan payout
- **Real-time Monitoring** - Monitor sistem secara real-time

### 🔄 Integrasi Provider
- **CentralSMM Integration** - Integrasi penuh dengan CentralSMM API
- **Auto Service Sync** - Sinkronisasi layanan otomatis dengan markup 10%
- **Real-time Status** - Update status pesanan real-time dari provider
- **Error Handling** - Penanganan error yang robust
- **Provider Testing** - Tools untuk test koneksi dan status provider

### 🔗 Multi Provider System

**Casib SMM Panel** mendukung sistem multi-provider yang memungkinkan admin untuk:

#### Provider Management
- **Multiple Providers** - Kelola multiple SMM service providers dalam satu panel
- **Provider Configuration** - Set API credentials, markup percentage, dan status untuk setiap provider
- **Dynamic Markup** - Set markup percentage yang berbeda untuk setiap provider
- **Provider Status** - Enable/disable provider tanpa menghapus konfigurasi
- **Auto Service Sync** - Sync layanan dari provider yang aktif secara otomatis

#### Provider Features
- **Connection Testing** - Test koneksi dan validasi credentials setiap provider
- **Bulk Operations** - Sync semua provider sekaligus atau individual
- **Service Management** - Layanan dari berbagai provider dalam satu interface
- **Order Routing** - Automatic routing pesanan ke provider yang sesuai
- **Fallback Support** - Support untuk provider backup jika primary gagal

#### Supported Provider Types
- **CentralSMM** - Default provider dengan full feature support
- **Generic SMM** - Support untuk provider SMM standard lainnya
- **Custom Integration** - Dapat dikustomisasi untuk provider dengan API khusus

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
│   ├── provider_id (Foreign Key to providers)
│   ├── provider_service_id (Provider service ID)
│   ├── name (Service name)
│   ├── category (Service category)
│   ├── price_per_1000 (Price with markup)
│   ├── original_price (Original provider price)
│   ├── min_order, max_order (Order limits)
│   └── description (Service description)
├── providers (Multi Provider Management)
│   ├── id (Primary Key)
│   ├── name (Internal provider name)
│   ├── display_name (Public display name)
│   ├── api_url (Provider API endpoint)
│   ├── api_id, api_key, secret_key (Credentials)
│   ├── markup_percentage (Markup percentage)
│   ├── is_active (Provider status)
│   ├── sync_services (Auto sync toggle)
│   └── created_at, updated_at (Timestamps)
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

Multi Provider System:
Provider Registration → Credential Validation → Service Sync → 
Markup Application → Order Routing → Provider Selection
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

## 🔧 Multi Provider Setup

## 🎯 Multi Provider Summary

**Status: ✅ SELESAI** - Sistem Multi Provider telah diimplementasi dengan lengkap!

### ✅ Yang Sudah Selesai:

1. **Database Schema** ✅
   - Tabel `providers` dengan field fleksibel untuk berbagai format API
   - View `services_with_provider` untuk query yang mudah
   - Function `get_provider_auth_data` untuk format credentials
   - Indexes dan triggers untuk performa optimal

2. **Backend API** ✅
   - `/api/providers` - CRUD management providers
   - `/api/providers/:id/test` - Test koneksi dengan format-specific handling
   - `/api/providers/:id/sync-services` - Sync services per provider
   - `/api/providers/sync-all` - Bulk sync semua providers
   - Support untuk: CentralSMM, PanelChild, JustAnother, Standard, Token, Custom

3. **Frontend Interface** ✅
   - `AdminMultiProviderPage.tsx` - Interface komprehensif untuk manage providers
   - Form add/edit provider dengan semua field yang dibutuhkan
   - Test connection per provider
   - Sync services individual dan bulk
   - Display status dan results

4. **Documentation** ✅
   - `SMM_PROVIDER_TEMPLATES.md` - Template dan mapping untuk berbagai provider
   - `QUICK_SETUP_TEMPLATES.md` - Copy-paste templates untuk setup cepat
   - `MULTI_PROVIDER_SETUP.md` - Setup instructions lengkap

5. **Setup Scripts** ✅
   - `setup-multi-provider.js` - Automated setup script
   - `test-multi-provider.js` - Test functionality script
   - `multi_provider_schema.sql` - Manual SQL setup

### 🚀 Fitur Multi Provider:

#### Provider Management
- ✅ **Add/Edit/Delete** providers via admin panel
- ✅ **Flexible API Support** - CentralSMM, PanelChild, Standard, Token, Custom
- ✅ **Test Connection** untuk setiap provider
- ✅ **Dynamic Markup** percentage per provider
- ✅ **Provider Status** (Active/Inactive)
- ✅ **Auto Sync Services** toggle

#### API Format Support
- ✅ **CentralSMM Format** (api_id + api_key + secret_key)
- ✅ **PanelChild Format** (key + action)
- ✅ **Standard Format** (api_id/user_id + api_key)
- ✅ **Token Based** (Bearer token authentication)
- ✅ **Custom Format** (flexible field mapping)

#### Authentication Methods
- ✅ **Form Data** (application/x-www-form-urlencoded)
- ✅ **JSON Body** (application/json)
- ✅ **Header Auth** (Authorization: Bearer token)

#### Advanced Features
- ✅ **Rate Limiting** per provider
- ✅ **Custom Endpoints** configuration
- ✅ **Provider Metadata** (country, type, notes)
- ✅ **Bulk Operations** (sync all providers)
- ✅ **Error Handling** dengan detailed messages

### 📋 Cara Setup:

#### Otomatis (Recommended):
```bash
node setup-multi-provider.js
```

#### Manual:
1. Run SQL dari `multi_provider_schema.sql`
2. Insert provider dengan `insert_centralsmm_provider.sql`
3. Access admin panel di `/admin/multi-provider`

### 🎯 Cara Menggunakan:

1. **Login sebagai Admin**
2. **Buka**: `http://localhost:5173/admin/multi-provider`
3. **Add Provider**: Klik "Add Provider"
4. **Isi Form**: Gunakan template dari `QUICK_SETUP_TEMPLATES.md`
5. **Test Connection**: Pastikan credentials benar
6. **Save & Sync**: Save provider dan sync services

### 🔧 Template Provider Populer:

| Provider | Format | Auth | Required Fields |
|----------|--------|------|-----------------|
| CentralSMM | centralsmm | form | api_id, api_key, secret_key |
| PanelChild | panelchild | form | api_key |
| Standard SMM | standard | form | api_id, api_key |
| Modern API | token | header | token |

### 🎉 Benefits:

1. **Diversifikasi Provider** - Tidak tergantung satu provider
2. **Flexible Pricing** - Markup berbeda per provider
3. **Backup Provider** - Jika satu down, ada backup
4. **Easy Management** - Admin panel yang user-friendly
5. **Scalable** - Mudah add provider baru

**🚀 Sistem Multi Provider siap digunakan!** Admin tinggal menambah provider melalui interface yang sudah disediakan.
