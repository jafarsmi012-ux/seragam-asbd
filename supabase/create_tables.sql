-- =============================================
-- Create Tables for ASBD Ordering System
-- SD Islam Al Azhar 62 Summarecon Bandung
-- =============================================

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  student_name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  product_type TEXT NOT NULL,
  size_asbd INTEGER NOT NULL,
  chest_cm INTEGER NOT NULL DEFAULT 0,
  pants_length_cm INTEGER NOT NULL DEFAULT 0,
  pants_waist_cm INTEGER NOT NULL DEFAULT 0,
  unit_price INTEGER NOT NULL DEFAULT 0,
  qty INTEGER NOT NULL,
  total_price INTEGER NOT NULL,
  sender_name TEXT DEFAULT '',
  sender_bank TEXT DEFAULT '',
  transfer_date DATE,
  transfer_amount INTEGER DEFAULT 0,
  proof_url TEXT NOT NULL DEFAULT '',
  proof_file_name TEXT DEFAULT '',
  status TEXT DEFAULT 'Menunggu Verifikasi',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Size Prices Table
CREATE TABLE IF NOT EXISTS size_prices (
  id INTEGER PRIMARY KEY,
  size_asbd INTEGER UNIQUE NOT NULL,
  chest_cm INTEGER NOT NULL,
  pants_length_cm INTEGER NOT NULL,
  pants_waist_cm INTEGER NOT NULL,
  price_set INTEGER NOT NULL,
  price_shirt INTEGER NOT NULL,
  price_pants INTEGER NOT NULL
);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

-- Enable RLS on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can INSERT orders (anon key)
CREATE POLICY "Allow public insert on orders"
  ON orders
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Allow authenticated users to SELECT orders (admin)
CREATE POLICY "Allow authenticated select on orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to UPDATE orders (admin)
CREATE POLICY "Allow authenticated update on orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Enable RLS on size_prices table
ALTER TABLE size_prices ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can SELECT size_prices
CREATE POLICY "Allow public select on size_prices"
  ON size_prices
  FOR SELECT
  TO anon
  USING (true);

-- =============================================
-- Storage Bucket for Payment Proofs
-- =============================================
-- Run this in Supabase SQL Editor to create the bucket:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', true);

-- Storage policy: Allow public upload
-- CREATE POLICY "Allow public upload" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'payment-proofs');

-- Storage policy: Allow public read
-- CREATE POLICY "Allow public read" ON storage.objects
--   FOR SELECT USING (bucket_id = 'payment-proofs');

-- =============================================
-- Indexes for performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_student_name ON orders(student_name);
CREATE INDEX IF NOT EXISTS idx_orders_class_name ON orders(class_name);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
