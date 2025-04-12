-- Create tables for the Footwear Inventory Management System

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  box_contents INTEGER NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Incoming Box Stock table
CREATE TABLE incoming_box_stock (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incoming_date TIMESTAMP WITH TIME ZONE NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  boxes_received INTEGER NOT NULL,
  description TEXT,
  total_units INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unit Stock table
CREATE TABLE unit_stock (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  color TEXT NOT NULL,
  size TEXT NOT NULL,
  units_available INTEGER NOT NULL,
  manufacturing_date TIMESTAMP WITH TIME ZONE,
  source_box_stock_id UUID NOT NULL REFERENCES incoming_box_stock(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipients table
CREATE TABLE recipients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  warehouse_address TEXT NOT NULL,
  contact_person TEXT,
  telephone_number TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Outgoing Stock table
CREATE TABLE outgoing_stock (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outgoing_date TIMESTAMP WITH TIME ZONE NOT NULL,
  shipping_document_number TEXT NOT NULL,
  recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Outgoing Stock Items table
CREATE TABLE outgoing_stock_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outgoing_stock_id UUID NOT NULL REFERENCES outgoing_stock(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  color TEXT NOT NULL,
  size TEXT NOT NULL,
  units_shipped INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE incoming_box_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE outgoing_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE outgoing_stock_items ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Authenticated users can read all data" 
  ON products FOR SELECT 
  TO authenticated 
  USING (true);

-- Repeat similar policies for other tables
-- Add more granular policies as needed for your application
