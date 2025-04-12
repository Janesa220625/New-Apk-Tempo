-- Add creator_id column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES auth.users(id);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_creator_id ON products(creator_id);
