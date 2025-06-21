-- Script untuk memastikan function generate_referral_code_for_user ada

-- Function untuk generate referral code untuk user tertentu
CREATE OR REPLACE FUNCTION generate_referral_code_for_user(user_id UUID)
RETURNS VOID AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
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
    WHERE id = user_id;
    
    RAISE NOTICE 'Generated referral code % for user %', new_code, user_id;
END;
$$ LANGUAGE plpgsql;

-- Function untuk mengecek dan memberikan referral code pada semua user yang belum punya
CREATE OR REPLACE FUNCTION ensure_all_users_have_referral_code()
RETURNS INTEGER AS $$
DECLARE
    user_record RECORD;
    updated_count INTEGER := 0;
BEGIN
    -- Loop semua user yang belum punya referral_code
    FOR user_record IN 
        SELECT id FROM users WHERE referral_code IS NULL
    LOOP
        -- Generate referral code untuk user ini
        PERFORM generate_referral_code_for_user(user_record.id);
        updated_count := updated_count + 1;
    END LOOP;
    
    RAISE NOTICE 'Updated % users with referral codes', updated_count;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Jalankan untuk semua user yang belum punya referral code
SELECT ensure_all_users_have_referral_code();
