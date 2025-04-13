import { supabase } from "@/lib/supabase";
import type { IncomingBoxStock, InsertType, UpdateType } from "@/types/schema";

export const incomingBoxStockService = {
  /**
   * Get all incoming box stock records
   */
  async getIncomingBoxStocks(): Promise<IncomingBoxStock[]> {
    console.log("incomingBoxStockService: Fetching all incoming box stocks");
    try {
      const { data, error } = await supabase
        .from("incoming_box_stock")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching incoming box stocks:", error);
        throw error;
      }

      console.log(
        `incomingBoxStockService: Retrieved ${data?.length || 0} records`,
        data,
      );
      return data as IncomingBoxStock[];
    } catch (error) {
      console.error("Unexpected error in getIncomingBoxStocks:", error);
      throw error;
    }
  },

  /**
   * Get an incoming box stock record by ID
   */
  async getIncomingBoxStockById(id: string): Promise<IncomingBoxStock | null> {
    console.log(`incomingBoxStockService: Fetching box stock with ID ${id}`);
    try {
      const { data, error } = await supabase
        .from("incoming_box_stock")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(
          `Error fetching incoming box stock with ID ${id}:`,
          error,
        );
        throw error;
      }

      console.log(
        `incomingBoxStockService: Retrieved box stock with ID ${id}:`,
        data,
      );
      return data as IncomingBoxStock;
    } catch (error) {
      console.error(
        `Unexpected error in getIncomingBoxStockById for ID ${id}:`,
        error,
      );
      throw error;
    }
  },

  /**
   * Create a new incoming box stock record
   * @param incomingBoxStock The incoming box stock data to insert
   * @param userId Optional user ID of the creator
   */
  async createIncomingBoxStock(
    incomingBoxStock: InsertType<"incoming_box_stock">,
    userId?: string,
  ): Promise<IncomingBoxStock> {
    try {
      // Ensure all required fields are present and properly formatted
      const stockWithCreator = userId
        ? {
            ...incomingBoxStock,
            creator_id: userId,
            // Ensure these fields are properly formatted
            boxes_received: Number(incomingBoxStock.boxes_received),
            total_units: Number(incomingBoxStock.total_units),
            // Add created_at and updated_at if not present
            created_at: incomingBoxStock.created_at || new Date().toISOString(),
            updated_at: incomingBoxStock.updated_at || new Date().toISOString(),
          }
        : {
            ...incomingBoxStock,
            boxes_received: Number(incomingBoxStock.boxes_received),
            total_units: Number(incomingBoxStock.total_units),
            created_at: incomingBoxStock.created_at || new Date().toISOString(),
            updated_at: incomingBoxStock.updated_at || new Date().toISOString(),
          };

      console.log(
        "incomingBoxStockService: Creating new box stock with data:",
        stockWithCreator,
      );

      const { data, error } = await supabase
        .from("incoming_box_stock")
        .insert(stockWithCreator)
        .select()
        .single();

      if (error) {
        console.error("Error creating incoming box stock:", error);
        throw error;
      }

      console.log(
        "incomingBoxStockService: Successfully created box stock:",
        data,
      );
      return data as IncomingBoxStock;
    } catch (error) {
      console.error("Unexpected error in createIncomingBoxStock:", error);
      throw error;
    }
  },

  /**
   * Update an incoming box stock record
   */
  async updateIncomingBoxStock(
    id: string,
    incomingBoxStock: UpdateType<"incoming_box_stock">,
  ): Promise<IncomingBoxStock> {
    console.log(`incomingBoxStockService: Updating box stock with ID ${id}`);
    try {
      const { data, error } = await supabase
        .from("incoming_box_stock")
        .update({
          ...incomingBoxStock,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error(
          `Error updating incoming box stock with ID ${id}:`,
          error,
        );
        throw error;
      }

      console.log(
        `incomingBoxStockService: Successfully updated box stock with ID ${id}:`,
        data,
      );
      return data as IncomingBoxStock;
    } catch (error) {
      console.error(
        `Unexpected error in updateIncomingBoxStock for ID ${id}:`,
        error,
      );
      throw error;
    }
  },

  /**
   * Delete an incoming box stock record
   */
  async deleteIncomingBoxStock(id: string): Promise<void> {
    console.log(`incomingBoxStockService: Deleting box stock with ID ${id}`);
    try {
      const { error } = await supabase
        .from("incoming_box_stock")
        .delete()
        .eq("id", id);

      if (error) {
        console.error(
          `Error deleting incoming box stock with ID ${id}:`,
          error,
        );
        throw error;
      }

      console.log(
        `incomingBoxStockService: Successfully deleted box stock with ID ${id}`,
      );
    } catch (error) {
      console.error(
        `Unexpected error in deleteIncomingBoxStock for ID ${id}:`,
        error,
      );
      throw error;
    }
  },
};
