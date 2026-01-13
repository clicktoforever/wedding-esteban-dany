-- Sample data for testing Crowdfunding Gift Registry
-- Run this in Supabase SQL Editor after running crowdfunding-schema.sql

-- Insert sample crowdfunding gifts
INSERT INTO gifts (name, description, image_url, category, is_crowdfunding, total_amount, collected_amount, status, price) VALUES
  (
    'Licuadora Premium',
    'Licuadora de alta potencia con 12 velocidades y vaso de vidrio térmico',
    'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800',
    'Electrodomésticos',
    true,
    250.00,
    0,
    'AVAILABLE',
    250.00
  ),
  (
    'Juego de Sábanas King',
    'Juego completo de sábanas 100% algodón egipcio con funda decorativa',
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
    'Hogar',
    true,
    180.00,
    0,
    'AVAILABLE',
    180.00
  ),
  (
    'Cafetera Espresso',
    'Máquina de café espresso automática con vaporizador de leche',
    'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800',
    'Electrodomésticos',
    true,
    450.00,
    0,
    'AVAILABLE',
    450.00
  ),
  (
    'Set de Toallas Premium',
    '8 toallas de baño y 4 toallones 100% algodón turco',
    'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=800',
    'Baño',
    true,
    120.00,
    0,
    'AVAILABLE',
    120.00
  ),
  (
    'Robot de Cocina',
    'Robot multifunción con batidora, procesador y accesorios',
    'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800',
    'Electrodomésticos',
    true,
    380.00,
    0,
    'AVAILABLE',
    380.00
  );

-- Insert a gift with some initial contributions (for testing progress bars)
INSERT INTO gifts (name, description, image_url, category, is_crowdfunding, total_amount, collected_amount, status, price) VALUES
  (
    'Aspiradora Robot',
    'Aspiradora inteligente con mapeo láser y control por app',
    'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800',
    'Electrodomésticos',
    true,
    500.00,
    325.00,
    'AVAILABLE',
    500.00
  );

-- Insert sample transactions for the partially funded gift
-- Note: You'll need to get the actual gift_id after inserting
-- Replace 'GIFT_ID_HERE' with the actual UUID from the gifts table

-- Example: Get the gift ID first
-- SELECT id FROM gifts WHERE name = 'Aspiradora Robot';

-- Then insert transactions (replace the UUID with actual one)
-- INSERT INTO gift_transactions (gift_id, donor_name, amount, status, external_transaction_id) VALUES
--   ('GIFT_ID_HERE', 'María García', 150.00, 'APPROVED', 'TEST-TXN-001'),
--   ('GIFT_ID_HERE', 'Juan Pérez', 100.00, 'APPROVED', 'TEST-TXN-002'),
--   ('GIFT_ID_HERE', 'Ana López', 75.00, 'APPROVED', 'TEST-TXN-003');

-- Insert traditional (non-crowdfunding) gifts for comparison
INSERT INTO gifts (name, description, image_url, category, is_crowdfunding, is_purchased, price) VALUES
  (
    'Set de Cubiertos 24 piezas',
    'Set completo de cubiertos en acero inoxidable con estuche',
    'https://images.unsplash.com/photo-1606676539940-12768ce0e762?w=800',
    'Mesa',
    false,
    false,
    95.00
  ),
  (
    'Olla a Presión',
    'Olla a presión de 6 litros con válvula de seguridad',
    'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800',
    'Cocina',
    false,
    false,
    85.00
  );

-- Verify the data
SELECT 
  name,
  category,
  is_crowdfunding,
  total_amount,
  collected_amount,
  status,
  CASE 
    WHEN is_crowdfunding THEN 
      ROUND((collected_amount / NULLIF(total_amount, 0) * 100)::numeric, 2)
    ELSE NULL
  END as progress_percentage
FROM gifts
ORDER BY is_crowdfunding DESC, category, name;

-- Check gift progress view
SELECT * FROM gift_progress;

COMMENT ON TABLE gifts IS 'Updated with sample data for crowdfunding testing';
