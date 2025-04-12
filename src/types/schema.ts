// Database schema types for the Footwear Inventory Management System

export interface Product {
  id: string;
  sku: string; // Unique SKU code
  name: string; // Product name
  price: number; // Price per unit/pair
  box_contents: number; // Number of pairs per box
  description?: string; // Optional product description
  category: string; // Product category (e.g., Sneakers, Boots)
  created_at: string;
  updated_at: string;
}

export interface IncomingBoxStock {
  id: string;
  incoming_date: string;
  product_id: string; // Reference to Product
  sku: string; // Denormalized for quick access
  boxes_received: number;
  description?: string;
  total_units: number; // Calculated field (boxes_received * box_contents)
  created_at: string;
  updated_at: string;
}

export interface UnitStock {
  id: string;
  product_id: string; // Reference to Product
  sku: string; // Denormalized for quick access
  color: string;
  size: string;
  units_available: number;
  manufacturing_date?: string;
  source_box_stock_id: string; // Reference to IncomingBoxStock if converted from box
  created_at: string;
  updated_at: string;
}

export interface Recipient {
  id: string;
  name: string;
  warehouse_address: string;
  contact_person?: string;
  telephone_number?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface OutgoingStock {
  id: string;
  outgoing_date: string;
  shipping_document_number: string;
  recipient_id: string; // Reference to Recipient
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface OutgoingStockItem {
  id: string;
  outgoing_stock_id: string; // Reference to OutgoingStock
  product_id: string; // Reference to Product
  sku: string; // Denormalized for quick access
  color: string;
  size: string;
  units_shipped: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Helper types for working with Supabase
export type Tables = {
  products: Product;
  incoming_box_stock: IncomingBoxStock;
  unit_stock: UnitStock;
  recipients: Recipient;
  outgoing_stock: OutgoingStock;
  outgoing_stock_items: OutgoingStockItem;
};

// Type for database row insertions
export type InsertType<T extends keyof Tables> = Omit<
  Tables[T],
  "id" | "created_at" | "updated_at"
>;

// Type for database row updates
export type UpdateType<T extends keyof Tables> = Partial<InsertType<T>>;
