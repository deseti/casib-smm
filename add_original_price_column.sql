-- Script untuk menambahkan kolom original_price dengan precision yang lebih besar
-- Jalankan di Supabase SQL Editor

-- Drop kolom jika sudah ada (untuk restart yang bersih)
ALTER TABLE services DROP COLUMN IF EXISTS original_price;

-- Tambahkan kolom original_price dengan precision yang lebih besar
ALTER TABLE services 
ADD COLUMN original_price DECIMAL(15, 3) DEFAULT 0;

-- Update existing records dengan original_price = price_per_1000 / 1.10
UPDATE services 
SET original_price = ROUND(price_per_1000 / 1.10, 3);

-- Tambahkan comment untuk dokumentasi
COMMENT ON COLUMN services.original_price IS 'Harga asli dari provider CentralSMM sebelum markup';
COMMENT ON COLUMN services.price_per_1000 IS 'Harga dengan markup yang ditampilkan ke user';

-- Tampilkan contoh data setelah update (dengan handling nilai besar)
SELECT 
    id,
    name,
    original_price as "Harga Provider",
    price_per_1000 as "Harga User (+ 10%)",
    ROUND((price_per_1000 - original_price), 3) as "Profit per 1000",
    CASE 
        WHEN original_price > 0 THEN ROUND(((price_per_1000 - original_price) / original_price * 100), 2)
        ELSE 0 
    END as "Markup %"
FROM services 
ORDER BY id 
LIMIT 10;
