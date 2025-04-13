-- Add creator_id column to incoming_box_stock table
ALTER TABLE incoming_box_stock ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES auth.users(id);

-- Enable RLS on incoming_box_stock table
ALTER TABLE incoming_box_stock ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to select any incoming_box_stock
DROP POLICY IF EXISTS "Allow users to view all incoming box stock" ON incoming_box_stock;
CREATE POLICY "Allow users to view all incoming box stock"
  ON incoming_box_stock FOR SELECT
  USING (true);

-- Create policy to allow users to insert their own incoming_box_stock
DROP POLICY IF EXISTS "Allow users to insert their own incoming box stock" ON incoming_box_stock;
CREATE POLICY "Allow users to insert their own incoming box stock"
  ON incoming_box_stock FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- Create policy to allow users to update their own incoming_box_stock
DROP POLICY IF EXISTS "Allow users to update their own incoming box stock" ON incoming_box_stock;
CREATE POLICY "Allow users to update their own incoming box stock"
  ON incoming_box_stock FOR UPDATE
  USING (auth.uid() = creator_id);

-- Create policy to allow users to delete their own incoming_box_stock
DROP POLICY IF EXISTS "Allow users to delete their own incoming box stock" ON incoming_box_stock;
CREATE POLICY "Allow users to delete their own incoming box stock"
  ON incoming_box_stock FOR DELETE
  USING (auth.uid() = creator_id);

-- Add the table to the realtime publication
alter publication supabase_realtime add table incoming_box_stock;