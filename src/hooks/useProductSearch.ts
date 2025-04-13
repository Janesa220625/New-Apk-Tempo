import { useState, useEffect } from "react";
import { Product } from "@/types/schema";

export const useProductSearch = (products: Product[]) => {
  const [skuSearchQuery, setSkuSearchQuery] = useState("");
  const [filteredProductsBySku, setFilteredProductsBySku] = useState<Product[]>(
    [],
  );
  const [selectedSku, setSelectedSku] = useState<string>("");
  const [selectedProductDetails, setSelectedProductDetails] =
    useState<Product | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [boxesReceived, setBoxesReceived] = useState<number>(1);
  const [calculatedTotalUnits, setCalculatedTotalUnits] = useState<number>(0);

  // Filter products by SKU as user types
  useEffect(() => {
    if (skuSearchQuery.trim() === "") {
      setFilteredProductsBySku([]);
      return;
    }

    const filtered = products.filter((product) =>
      product.sku.toLowerCase().includes(skuSearchQuery.toLowerCase()),
    );
    setFilteredProductsBySku(filtered);
  }, [skuSearchQuery, products]);

  // Update product details when SKU is selected
  const handleSkuSelection = (sku: string) => {
    setSelectedSku(sku);
    const product = products.find((p) => p.sku === sku);
    setSelectedProductDetails(product || null);
    if (product) {
      setSelectedProductId(product.id);
      setCalculatedTotalUnits(boxesReceived * product.box_contents);
    } else {
      setSelectedProductId("");
      setCalculatedTotalUnits(0);
    }
  };

  // Calculate total units whenever product or boxes received changes
  useEffect(() => {
    if (selectedProductId && boxesReceived) {
      const product = products.find((p) => p.id === selectedProductId);
      if (product) {
        setCalculatedTotalUnits(boxesReceived * product.box_contents);
      }
    } else {
      setCalculatedTotalUnits(0);
    }
  }, [selectedProductId, boxesReceived, products]);

  // Reset product search state
  const resetProductSearch = () => {
    setSkuSearchQuery("");
    setSelectedSku("");
    setSelectedProductDetails(null);
    setSelectedProductId("");
    setBoxesReceived(1);
    setCalculatedTotalUnits(0);
  };

  return {
    skuSearchQuery,
    setSkuSearchQuery,
    filteredProductsBySku,
    selectedSku,
    selectedProductDetails,
    selectedProductId,
    boxesReceived,
    setBoxesReceived,
    calculatedTotalUnits,
    handleSkuSelection,
    resetProductSearch,
  };
};
