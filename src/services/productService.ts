import { supabase } from "@/lib/supabase";
import type { Product, InsertType, UpdateType } from "@/types/schema";

export const productService = {
  /**
   * Get all products
   */
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      throw error;
    }

    return data as Product[];
  },

  /**
   * Get a product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching product with ID ${id}:`, error);
      throw error;
    }

    return data as Product;
  },

  /**
   * Create a new product
   * @param product The product data to insert
   * @param userId Optional user ID of the creator
   */
  async createProduct(
    product: InsertType<"products">,
    userId?: string,
  ): Promise<Product> {
    const productWithCreator = userId
      ? { ...product, creator_id: userId }
      : product;

    const { data, error } = await supabase
      .from("products")
      .insert(productWithCreator)
      .select()
      .single();

    if (error) {
      console.error("Error creating product:", error);
      throw error;
    }

    return data as Product;
  },

  /**
   * Update a product
   */
  async updateProduct(
    id: string,
    product: UpdateType<"products">,
  ): Promise<Product> {
    const { data, error } = await supabase
      .from("products")
      .update({
        ...product,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating product with ID ${id}:`, error);
      throw error;
    }

    return data as Product;
  },

  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error(`Error deleting product with ID ${id}:`, error);
      throw error;
    }
  },
};
