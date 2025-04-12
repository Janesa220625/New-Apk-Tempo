import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type { Product, InsertType, Tables } from "@/types/schema";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
  );
}

export const supabase = createClient<Database>(
  supabaseUrl as string,
  supabaseAnonKey as string,
);

// Sample product data for seeding the database
const sampleProducts: InsertType<"products">[] = [
  {
    sku: "BS-001",
    name: "Boys Sport Shoes",
    price: 150000,
    box_contents: 12,
    description: "Comfortable sport shoes for boys",
    category: "Boys Shoes",
  },
  {
    sku: "GS-001",
    name: "Girls Fashion Shoes",
    price: 175000,
    box_contents: 12,
    description: "Stylish fashion shoes for girls",
    category: "Girls Shoes",
  },
  {
    sku: "BS-002",
    name: "Boys Casual Sandals",
    price: 120000,
    box_contents: 24,
    description: "Casual sandals for boys",
    category: "Boys Sandals",
  },
  {
    sku: "GS-002",
    name: "Girls Summer Sandals",
    price: 135000,
    box_contents: 24,
    description: "Lightweight summer sandals for girls",
    category: "Girls Sandals",
  },
  {
    sku: "BS-003",
    name: "Boys School Shoes",
    price: 200000,
    box_contents: 12,
    description: "Durable school shoes for boys",
    category: "Boys Shoes",
  },
];

/**
 * Seeds the products table with initial data if it's empty
 * @returns Promise with the result of the seeding operation
 */
/**
 * Fetches user settings from the database
 * @param userId The ID of the user whose settings to fetch
 * @returns Promise with the user settings
 */
export const getUserSettings = async (
  userId: string,
): Promise<{
  success: boolean;
  data: Tables<"user_settings"> | null;
  message: string;
}> => {
  try {
    // Check if user has settings
    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is the error code for no rows returned
      console.error("Error fetching user settings:", error);
      return {
        success: false,
        data: null,
        message: `Error fetching user settings: ${error.message}`,
      };
    }

    // If no settings exist, create default settings
    if (!data) {
      const { data: newSettings, error: createError } = await supabase
        .from("user_settings")
        .insert({
          user_id: userId,
          dark_mode: false,
          date_format: "dd-mm-yyyy",
          timezone: "UTC+0",
          company_name: "Footwear Warehouse Inc.",
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating default user settings:", createError);
        return {
          success: false,
          data: null,
          message: `Error creating default user settings: ${createError.message}`,
        };
      }

      return {
        success: true,
        data: newSettings,
        message: "Default user settings created successfully",
      };
    }

    return {
      success: true,
      data,
      message: "User settings fetched successfully",
    };
  } catch (error) {
    console.error("Unexpected error fetching user settings:", error);
    return {
      success: false,
      data: null,
      message: `Unexpected error fetching user settings: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};

/**
 * Updates user settings in the database
 * @param userId The ID of the user whose settings to update
 * @param settings The settings to update
 * @returns Promise with the result of the update operation
 */
export const updateUserSettings = async (
  userId: string,
  settings: Partial<Tables<"user_settings">>,
): Promise<{
  success: boolean;
  data: Tables<"user_settings"> | null;
  message: string;
}> => {
  try {
    const { data, error } = await supabase
      .from("user_settings")
      .update({
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user settings:", error);
      return {
        success: false,
        data: null,
        message: `Error updating user settings: ${error.message}`,
      };
    }

    return {
      success: true,
      data,
      message: "User settings updated successfully",
    };
  } catch (error) {
    console.error("Unexpected error updating user settings:", error);
    return {
      success: false,
      data: null,
      message: `Unexpected error updating user settings: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};

export const seedProducts = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    // Check if products table is empty
    const { data: existingProducts, error: checkError } = await supabase
      .from("products")
      .select("id")
      .limit(1);

    if (checkError) {
      console.error("Error checking products table:", checkError);
      return {
        success: false,
        message: `Error checking products table: ${checkError.message}`,
      };
    }

    // If products exist, don't seed
    if (existingProducts && existingProducts.length > 0) {
      console.log("Products table already has data, skipping seed operation");
      return {
        success: true,
        message: "Products table already has data, skipping seed operation",
      };
    }

    // Insert sample products
    const { error: insertError } = await supabase
      .from("products")
      .insert(sampleProducts);

    if (insertError) {
      console.error("Error seeding products table:", insertError);
      return {
        success: false,
        message: `Error seeding products table: ${insertError.message}`,
      };
    }

    console.log("Successfully seeded products table with sample data");
    return {
      success: true,
      message: "Successfully seeded products table with sample data",
    };
  } catch (error) {
    console.error("Unexpected error during product seeding:", error);
    return {
      success: false,
      message: `Unexpected error during product seeding: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};
