-- SQL Script untuk update database dengan integrasi provider
-- Jalankan script ini di Supabase SQL Editor

-- 1. Tambahkan kolom untuk tracking provider order
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS provider_order_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS start_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS remains INTEGER DEFAULT 0;

-- 2. Buat function untuk create order dengan integrasi provider
CREATE OR REPLACE FUNCTION create_order_with_provider(
    p_user_id INTEGER,
    p_service_id INTEGER,
    p_quantity INTEGER,
    p_link TEXT,
    p_total_price DECIMAL,
    p_provider_order_id VARCHAR(100),
    p_start_count INTEGER DEFAULT 0,
    p_status VARCHAR(50) DEFAULT 'pending'
)
RETURNS TABLE(
    order_id INTEGER,
    service_name TEXT,
    total_price DECIMAL,
    new_balance DECIMAL
) AS $$
DECLARE
    service_record RECORD;
    current_balance DECIMAL;
    new_balance DECIMAL;
    new_order_id INTEGER;
BEGIN
    -- Ambil detail service
    SELECT name, price_per_1000, min_order, max_order 
    INTO service_record
    FROM services 
    WHERE id = p_service_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Service tidak ditemukan';
    END IF;
    
    -- Validasi quantity
    IF p_quantity < service_record.min_order OR p_quantity > service_record.max_order THEN
        RAISE EXCEPTION 'Quantity tidak valid: harus antara % dan %', 
            service_record.min_order, service_record.max_order;
    END IF;
    
    -- Ambil saldo user saat ini
    SELECT balance INTO current_balance 
    FROM users 
    WHERE id = p_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User tidak ditemukan';
    END IF;
    
    -- Cek saldo mencukupi
    IF current_balance < p_total_price THEN
        RAISE EXCEPTION 'Saldo tidak mencukupi. Saldo: %, Diperlukan: %', 
            current_balance, p_total_price;
    END IF;
    
    -- Kurangi saldo user
    new_balance := current_balance - p_total_price;
    
    UPDATE users 
    SET balance = new_balance 
    WHERE id = p_user_id;
    
    -- Buat order baru
    INSERT INTO orders (
        user_id, 
        service_id, 
        quantity, 
        link, 
        total_price, 
        status,
        provider_order_id,
        start_count,
        remains
    ) VALUES (
        p_user_id, 
        p_service_id, 
        p_quantity, 
        p_link, 
        p_total_price, 
        p_status,
        p_provider_order_id,
        p_start_count,
        p_quantity
    ) RETURNING id INTO new_order_id;
    
    -- Return hasil
    RETURN QUERY 
    SELECT 
        new_order_id,
        service_record.name,
        p_total_price,
        new_balance;
END;
$$ LANGUAGE plpgsql;

-- 3. Buat function untuk update status order dari provider
CREATE OR REPLACE FUNCTION update_order_status(
    p_order_id INTEGER,
    p_status VARCHAR(50),
    p_start_count INTEGER DEFAULT NULL,
    p_remains INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE orders 
    SET 
        status = p_status,
        start_count = COALESCE(p_start_count, start_count),
        remains = COALESCE(p_remains, remains),
        updated_at = NOW()
    WHERE id = p_order_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 4. Buat function untuk sync status dengan provider
CREATE OR REPLACE FUNCTION sync_order_status_with_provider(
    p_provider_order_id VARCHAR(100),
    p_status VARCHAR(50),
    p_start_count INTEGER DEFAULT NULL,
    p_remains INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE orders 
    SET 
        status = p_status,
        start_count = COALESCE(p_start_count, start_count),
        remains = COALESCE(p_remains, remains),
        updated_at = NOW()
    WHERE provider_order_id = p_provider_order_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 5. Cek struktur tabel yang sudah diupdate
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;
