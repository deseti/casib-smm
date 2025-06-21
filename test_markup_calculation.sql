-- Test markup system untuk satu layanan
-- Jalankan query ini di Supabase SQL Editor untuk testing

-- Lihat contoh layanan dengan markup calculation
SELECT 
    id,
    name,
    price_per_1000 as "Current Price (with markup)",
    ROUND(price_per_1000 / 1.10, 3) as "Estimated Original Price",
    ROUND(price_per_1000 - (price_per_1000 / 1.10), 3) as "Estimated Profit per 1000",
    ROUND(((price_per_1000 - (price_per_1000 / 1.10)) / (price_per_1000 / 1.10) * 100), 2) as "Markup %"
FROM services 
WHERE id IN (SELECT id FROM services LIMIT 5)
ORDER BY id;
