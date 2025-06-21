-- SISTEM REFERRAL/AFILIASI SMM PANEL
-- Tanggal: 20 Juni 2025

-- 1. Tambahkan kolom referral di tabel users
ALTER TABLE users 
ADD COLUMN referral_code VARCHAR(20) UNIQUE,
ADD COLUMN referred_by VARCHAR(20),
ADD COLUMN referral_earnings DECIMAL(15,3) DEFAULT 0.000,
ADD COLUMN total_referrals INTEGER DEFAULT 0,
ADD COLUMN is_referral_active BOOLEAN DEFAULT true;

-- 2. Buat tabel referral_transactions untuk tracking komisi
CREATE TABLE referral_transactions (
    id BIGSERIAL PRIMARY KEY,
    referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    referred_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
    commission_percentage DECIMAL(5,2) DEFAULT 5.00,
    commission_amount DECIMAL(15,3) NOT NULL,
    order_amount DECIMAL(15,3) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, paid
    created_at TIMESTAMP DEFAULT NOW(),
    approved_at TIMESTAMP,
    approved_by UUID REFERENCES users(id),
    notes TEXT
);

-- 3. Buat tabel referral_payouts untuk tracking pembayaran komisi
CREATE TABLE referral_payouts (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(15,3) NOT NULL,
    transaction_ids BIGINT[], -- Array ID dari referral_transactions
    payout_method VARCHAR(50) DEFAULT 'balance_addition',
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    processed_by UUID REFERENCES users(id),
    processed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Function untuk generate referral code unik
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS VARCHAR(20) AS $$
DECLARE
    code VARCHAR(20);
    exists_code BOOLEAN;
BEGIN
    LOOP
        -- Generate random 8 character code
        code := UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 8));
        
        -- Check if code exists
        SELECT EXISTS(SELECT 1 FROM users WHERE referral_code = code) INTO exists_code;
        
        IF NOT exists_code THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- 5. Function untuk set referral code otomatis saat user baru
CREATE OR REPLACE FUNCTION auto_set_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := generate_referral_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger untuk auto-generate referral code
CREATE TRIGGER trigger_auto_referral_code
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION auto_set_referral_code();

-- 7. Function untuk menambah komisi referral saat ada order baru
CREATE OR REPLACE FUNCTION add_referral_commission(
    p_order_id BIGINT,
    p_user_id UUID,
    p_order_amount DECIMAL(15,3)
)
RETURNS VOID AS $$
DECLARE
    referrer_record RECORD;
    commission_amount DECIMAL(15,3);
    commission_rate DECIMAL(5,2) := 5.00; -- 5% komisi
BEGIN    -- Cari user yang mereferral
    SELECT u.id, u.referral_code, u.email, u.full_name 
    INTO referrer_record
    FROM users u 
    JOIN users referred ON u.referral_code = referred.referred_by
    WHERE referred.id = p_user_id 
    AND u.is_referral_active = true;
    
    -- Jika ada referrer
    IF referrer_record.id IS NOT NULL THEN
        -- Hitung komisi
        commission_amount := p_order_amount * (commission_rate / 100);
        
        -- Insert ke referral_transactions
        INSERT INTO referral_transactions (
            referrer_id,
            referred_user_id,
            order_id,
            commission_percentage,
            commission_amount,
            order_amount,
            status
        ) VALUES (
            referrer_record.id,
            p_user_id,
            p_order_id,
            commission_rate,
            commission_amount,
            p_order_amount,
            'pending'
        );
        
        -- Update statistik referrer
        UPDATE users 
        SET referral_earnings = referral_earnings + commission_amount
        WHERE id = referrer_record.id;
          RAISE NOTICE 'Referral commission added: % for referrer % (%) from order %', 
                     commission_amount, referrer_record.full_name, referrer_record.email, p_order_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 8. Function untuk approve dan bayar komisi referral
CREATE OR REPLACE FUNCTION approve_referral_commission(
    p_transaction_id BIGINT,
    p_admin_id UUID,
    p_add_to_balance BOOLEAN DEFAULT true
)
RETURNS JSON AS $$
DECLARE
    ref_transaction RECORD;
    result JSON;
BEGIN    -- Ambil data transaksi referral
    SELECT rt.*, u.email as referrer_email, u.full_name as referrer_name
    INTO ref_transaction
    FROM referral_transactions rt
    JOIN users u ON rt.referrer_id = u.id
    WHERE rt.id = p_transaction_id AND rt.status = 'pending';
    
    IF ref_transaction.id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Transaksi referral tidak ditemukan atau sudah diproses'
        );
    END IF;
    
    -- Update status transaksi referral
    UPDATE referral_transactions 
    SET 
        status = 'approved',
        approved_at = NOW(),
        approved_by = p_admin_id
    WHERE id = p_transaction_id;
    
    -- Jika diminta untuk langsung menambah ke saldo
    IF p_add_to_balance THEN
        UPDATE users 
        SET balance = balance + ref_transaction.commission_amount
        WHERE id = ref_transaction.referrer_id;
        
        -- Log payout
        INSERT INTO referral_payouts (
            user_id,
            amount,
            transaction_ids,
            status,
            processed_by,
            processed_at,
            notes
        ) VALUES (
            ref_transaction.referrer_id,
            ref_transaction.commission_amount,
            ARRAY[p_transaction_id],
            'completed',
            p_admin_id,
            NOW(),
            'Auto approved and added to balance'
        );
    END IF;
    
    result := json_build_object(
        'success', true,
        'message', 'Komisi referral berhasil diapprove',
        'commission_amount', ref_transaction.commission_amount,
        'referrer_email', ref_transaction.referrer_email,
        'added_to_balance', p_add_to_balance
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 9. Update existing users dengan referral code
UPDATE users 
SET referral_code = generate_referral_code() 
WHERE referral_code IS NULL;

-- 10. Indexes untuk performance
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_referred_by ON users(referred_by);
CREATE INDEX idx_referral_transactions_referrer ON referral_transactions(referrer_id);
CREATE INDEX idx_referral_transactions_status ON referral_transactions(status);
CREATE INDEX idx_referral_payouts_user ON referral_payouts(user_id);

-- 11. View untuk laporan referral
CREATE OR REPLACE VIEW referral_summary AS
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.referral_code,
    u.referred_by,
    u.referral_earnings,
    u.total_referrals,
    u.is_referral_active,
    COUNT(ref_users.id) as actual_referrals,
    COUNT(rt.id) as total_transactions,
    COALESCE(SUM(rt.commission_amount), 0) as total_commissions_earned,
    COALESCE(SUM(CASE WHEN rt.status = 'approved' THEN rt.commission_amount ELSE 0 END), 0) as approved_commissions,
    COALESCE(SUM(CASE WHEN rt.status = 'pending' THEN rt.commission_amount ELSE 0 END), 0) as pending_commissions
FROM users u
LEFT JOIN users ref_users ON u.referral_code = ref_users.referred_by
LEFT JOIN referral_transactions rt ON u.id = rt.referrer_id
GROUP BY u.id, u.email, u.full_name, u.referral_code, u.referred_by, 
         u.referral_earnings, u.total_referrals, u.is_referral_active
ORDER BY total_commissions_earned DESC;

-- Test data dan contoh query
-- SELECT * FROM referral_summary;
-- SELECT * FROM referral_transactions WHERE status = 'pending';
-- SELECT * FROM referral_payouts WHERE status = 'pending';
