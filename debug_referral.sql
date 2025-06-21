-- Debug script untuk memeriksa sistem referral

-- 1. Cek apakah view referral_summary ada
SELECT schemaname, viewname 
FROM pg_views 
WHERE viewname = 'referral_summary';

-- 2. Cek apakah kolom referral_code sudah ada di tabel users
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('referral_code', 'referred_by', 'is_referral_active', 'referral_earnings')
ORDER BY column_name;

-- 3. Cek apakah tabel referral_transactions ada
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'referral_transactions';

-- 4. Cek apakah tabel referral_payouts ada
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'referral_payouts';

-- 5. Cek data user yang sudah ada dan referral_code nya
SELECT id, email, full_name, referral_code, referred_by, is_referral_active, referral_earnings
FROM users 
LIMIT 5;

-- 6. Cek apakah function generate_referral_code() ada
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'generate_referral_code';

-- 7. Test view referral_summary (jika ada data user)
SELECT * FROM referral_summary LIMIT 3;
