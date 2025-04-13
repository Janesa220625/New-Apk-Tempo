-- Check if incoming_box_stock table exists, if not create it with proper schema
CREATE TABLE IF NOT EXISTS incoming_box_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incoming_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  product_id UUID REFERENCES products(id),
  sku TEXT NOT NULL,
  boxes_received INTEGER NOT NULL,
  supplier_name TEXT NOT NULL,
  description TEXT,
  total_units INTEGER NOT NULL,
  creator_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security (already done in previous migration)
-- ALTER TABLE incoming_box_stock ENABLE ROW LEVEL SECURITY;

-- Add the table to the realtime publication if not already added
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
