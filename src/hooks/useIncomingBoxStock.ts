import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { IncomingBoxStock, Product } from "@/types/schema";
import { incomingBoxStockService } from "@/services/incomingBoxStockService";
import { productService } from "@/services/productService";
import * as XLSX from "xlsx";

export interface BoxedInventorySummary {
  id: string;
  sku: string;
  productName: string;
  productId: string;
  category: string;
  boxQuantity: number;
  pairsPerBox: number;
  totalPairs: number;
  lastUpdated: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

export const useIncomingBoxStock = () => {
  // State for box stocks and products
  const [boxStocks, setBoxStocks] = useState<IncomingBoxStock[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch the current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          setCurrentUser(data.user.id);
        }
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch products from the product service
  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("DEBUG - Starting to fetch products...");
      const data = await productService.getProducts();
      console.log("DEBUG - fetchProducts response:", data);
      setProducts(data || []);
      return data;
    } catch (error: any) {
      console.error("Error fetching products:", error);
      setError(error.message || "Failed to fetch products");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch incoming box stocks from the database
  const fetchBoxStocks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("DEBUG - Starting to fetch box stocks...");
      const data = await incomingBoxStockService.getIncomingBoxStocks();
      console.log("DEBUG - fetchBoxStocks response:", data);
      setBoxStocks(data || []);
      setLastFetchTime(new Date());
      return data;
    } catch (error: any) {
      console.error("Error fetching incoming box stocks:", error);
      setError(error.message || "Failed to fetch incoming box stocks");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Load products and box stocks on component mount
  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        await fetchProducts();
        await fetchBoxStocks();
      } catch (err) {
        console.error("Error loading initial data:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadInitialData();

    // Set up a refresh interval
    const refreshInterval = setInterval(() => {
      if (isMounted) {
        fetchBoxStocks().catch((err) => {
          console.error("Error in refresh interval:", err);
        });
      }
    }, 60000); // Refresh every minute

    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
    };
  }, []);

  // Helper functions
  const getProductName = (productId: string): string => {
    console.log("DEBUG - getProductName called with productId:", productId);
    console.log("DEBUG - products array length:", products.length);
    if (!productId) {
      console.log("DEBUG - productId is empty or null");
      return "Unknown Product (No ID)";
    }
    const product = products.find((p) => p.id === productId);
    console.log("DEBUG - product found:", product);
    return product ? product.name : `Unknown Product (ID: ${productId})`;
  };

  const getBoxContents = (productId: string): number => {
    const product = products.find((p) => p.id === productId);
    return product ? product.box_contents : 0;
  };

  const getProductCategory = (productId: string): string => {
    const product = products.find((p) => p.id === productId);
    return product ? product.category : "Unknown";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  // Create a new box stock record
  const createBoxStock = async (newBoxStock: Partial<IncomingBoxStock>) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("DEBUG - Creating new box stock with data:", newBoxStock);
      const result = await incomingBoxStockService.createIncomingBoxStock(
        newBoxStock,
        currentUser || undefined,
      );
      console.log("DEBUG - Box stock creation result:", result);
      await fetchBoxStocks(); // Refresh the list
      return { success: true };
    } catch (error: any) {
      console.error("Error creating box stock:", error);
      setError(error.message || "Failed to create box stock");
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a box stock record
  const deleteBoxStock = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("DEBUG - Deleting box stock with ID:", id);
      await incomingBoxStockService.deleteIncomingBoxStock(id);
      console.log("DEBUG - Box stock deleted successfully");
      await fetchBoxStocks(); // Refresh the list
      return { success: true };
    } catch (error: any) {
      console.error("Error deleting box stock:", error);
      setError(error.message || "Failed to delete box stock");
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate boxed inventory summary from incoming box stocks
  const boxedInventorySummary = useMemo(() => {
    // Group by SKU and sum quantities
    const skuMap = new Map<string, BoxedInventorySummary>();

    boxStocks.forEach((stock) => {
      const productId = stock.product_id;
      const sku = stock.sku;
      const pairsPerBox = getBoxContents(productId);

      if (!skuMap.has(sku)) {
        skuMap.set(sku, {
          id: sku, // Use SKU as ID for the summary
          sku,
          productId,
          productName: getProductName(productId),
          category: getProductCategory(productId),
          boxQuantity: stock.boxes_received,
          pairsPerBox,
          totalPairs: stock.boxes_received * pairsPerBox,
          lastUpdated: stock.updated_at,
          status: "In Stock",
        });
      } else {
        const existing = skuMap.get(sku)!;
        const newBoxQuantity = existing.boxQuantity + stock.boxes_received;
        const newTotalPairs = newBoxQuantity * pairsPerBox;

        // Update with the latest values and most recent date
        skuMap.set(sku, {
          ...existing,
          boxQuantity: newBoxQuantity,
          totalPairs: newTotalPairs,
          lastUpdated:
            new Date(stock.updated_at) > new Date(existing.lastUpdated)
              ? stock.updated_at
              : existing.lastUpdated,
        });
      }
    });

    // Convert map to array and determine status
    const summaryArray = Array.from(skuMap.values()).map((item) => {
      let status: "In Stock" | "Low Stock" | "Out of Stock" = "In Stock";

      if (item.boxQuantity === 0) {
        status = "Out of Stock";
      } else if (item.boxQuantity < 5) {
        // Arbitrary threshold for low stock
        status = "Low Stock";
      }

      return { ...item, status };
    });

    return summaryArray;
  }, [boxStocks, products]);

  return {
    boxStocks,
    products,
    isLoading,
    currentUser,
    lastFetchTime,
    error,
    fetchBoxStocks,
    fetchProducts,
    getProductName,
    getBoxContents,
    getProductCategory,
    formatDate,
    createBoxStock,
    deleteBoxStock,
    boxedInventorySummary,
  };
};
