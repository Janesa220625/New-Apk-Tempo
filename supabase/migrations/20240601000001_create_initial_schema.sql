-- Create initial schema for Footwear Inventory Management System

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  box_contents INTEGER NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Incoming Box Stock table
CREATE TABLE IF NOT EXISTS incoming_box_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incoming_date TIMESTAMP WITH TIME ZONE NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id),
  sku TEXT NOT NULL,
  boxes_received INTEGER NOT NULL,
  description TEXT,
  total_units INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Unit Stock table
CREATE TABLE IF NOT EXISTS unit_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  sku TEXT NOT NULL,
  color TEXT NOT NULL,
  size TEXT NOT NULL,
  units_available INTEGER NOT NULL,
  manufacturing_date TIMESTAMP WITH TIME ZONE,
  source_box_stock_id UUID REFERENCES incoming_box_stock(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Recipients table
CREATE TABLE IF NOT EXISTS recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  warehouse_address TEXT NOT NULL,
  contact_person TEXT,
  telephone_number TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Outgoing Stock table
CREATE TABLE IF NOT EXISTS outgoing_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outgoing_date TIMESTAMP WITH TIME ZONE NOT NULL,
  shipping_document_number TEXT NOT NULL,
  recipient_id UUID NOT NULL REFERENCES recipients(id),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Outgoing Stock Items table
CREATE TABLE IF NOT EXISTS outgoing_stock_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outgoing_stock_id UUID NOT NULL REFERENCES outgoing_stock(id),
  product_id UUID NOT NULL REFERENCES products(id),
  sku TEXT NOT NULL,
  color TEXT NOT NULL,
  size TEXT NOT NULL,
  units_shipped INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable realtime for all tables
alter publication supabase_realtime add table products;
alter publication supabase_realtime add table incoming_box_stock;
alter publication supabase_realtime add table unit_stock;
alter publication supabase_realtime add table recipients;
alter publication supabase_realtime add table outgoing_stock;
alter publication supabase_realtime add table outgoing_stock_items;
