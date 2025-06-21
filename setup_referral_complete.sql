-- Script untuk memastikan semua komponen referral system ada

-- 1. Pastikan kolom-kolom referral ada di tabel users
DO $$
BEGIN
    -- Cek dan tambah kolom referral_code
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'referral_code') THEN
        ALTER TABLE users ADD COLUMN referral_code VARCHAR(20) UNIQUE;
        RAISE NOTICE 'Added referral_code column to users table';
    END IF;
    
    -- Cek dan tambah kolom referred_by
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'referred_by') THEN
        ALTER TABLE users ADD COLUMN referred_by VARCHAR(20);
        RAISE NOTICE 'Added referred_by column to users table';
    END IF;
    
    -- Cek dan tambah kolom is_referral_active
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_referral_active') THEN
        ALTER TABLE users ADD COLUMN is_referral_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_referral_active column to users table';
    END IF;
    
    -- Cek dan tambah kolom referral_earnings
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'referral_earnings') THEN
        ALTER TABLE users ADD COLUMN referral_earnings DECIMAL(15,2) DEFAULT 0;
        RAISE NOTICE 'Added referral_earnings column to users table';
    END IF;
END $$;

-- 2. Pastikan tabel referral_transactions ada
CREATE TABLE IF NOT EXISTS referral_transactions (
    id SERIAL PRIMARY KEY,
    referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    commission_amount DECIMAL(15,2) NOT NULL,
    order_amount DECIMAL(15,2) NOT NULL,
    commission_rate DECIMAL(5,4) DEFAULT 0.05,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    processed_by UUID REFERENCES users(id),
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Pastikan tabel referral_payouts ada
CREATE TABLE IF NOT EXISTS referral_payouts (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    transaction_ids INTEGER[] NOT NULL,
    payout_method VARCHAR(50) DEFAULT 'balance_credit',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    processed_by UUID REFERENCES users(id),
    admin_notes TEXT,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Pastikan indexes ada
CREATE INDEX IF NOT EXISTS idx_referral_transactions_referrer ON referral_transactions(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_transactions_referred ON referral_transactions(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_transactions_status ON referral_transactions(status);
CREATE INDEX IF NOT EXISTS idx_referral_payouts_user ON referral_payouts(user_id);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);

-- 5. Pastikan view referral_summary ada
CREATE OR REPLACE VIEW referral_summary AS
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.referral_code,
    u.referred_by,
    u.is_referral_active,
    u.referral_earnings,
    COALESCE(COUNT(DISTINCT ref_users.id), 0) as actual_referrals,
    COALESCE(SUM(rt.commission_amount), 0) as total_commissions_earned,
    COALESCE(SUM(CASE WHEN rt.status = 'approved' THEN rt.commission_amount ELSE 0 END), 0) as approved_commissions,
    COALESCE(SUM(CASE WHEN rt.status = 'pending' THEN rt.commission_amount ELSE 0 END), 0) as pending_commissions,
    COALESCE(COUNT(rt.id), 0) as total_transactions,
    COALESCE(COUNT(DISTINCT ref_users.id), 0) as total_referrals
FROM users u
LEFT JOIN users ref_users ON ref_users.referred_by = u.referral_code
LEFT JOIN referral_transactions rt ON rt.referrer_id = u.id
WHERE u.is_referral_active = true
GROUP BY u.id, u.email, u.full_name, u.referral_code, u.referred_by, u.is_referral_active, u.referral_earnings
ORDER BY total_commissions_earned DESC;

RAISE NOTICE 'Referral system tables and views are ready!';

-- 6. Generate referral codes untuk user yang belum punya
DO $$
DECLARE
    user_record RECORD;
    new_code TEXT;
    code_exists BOOLEAN;
    updated_count INTEGER := 0;
BEGIN
    FOR user_record IN 
        SELECT id FROM users WHERE referral_code IS NULL
    LOOP
        -- Generate kode referral yang unik
        LOOP
            new_code := 'REF' || UPPER(substr(md5(random()::text), 1, 8));
            
            -- Cek apakah kode sudah ada
            SELECT EXISTS(SELECT 1 FROM users WHERE referral_code = new_code) INTO code_exists;
            
            -- Jika tidak ada yang pakai, keluar dari loop
            IF NOT code_exists THEN
                EXIT;
            END IF;
        END LOOP;
        
        -- Update user dengan kode referral baru
        UPDATE users 
        SET 
            referral_code = new_code,
            is_referral_active = true,
            updated_at = NOW()
        WHERE id = user_record.id;
        
        updated_count := updated_count + 1;
    END LOOP;
    
    RAISE NOTICE 'Generated referral codes for % users', updated_count;
END $$;
