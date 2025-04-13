import React, { useState, useEffect } from "react";
import { useProductSearch } from "@/hooks/useProductSearch";
import { useIncomingBoxStock } from "@/hooks/useIncomingBoxStock";
import { Plus, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/schema";

interface AddIncomingBoxProps {
  onBoxAdded?: () => void;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  buttonText?: string;
  products: Product[];
}

const AddIncomingBox: React.FC<AddIncomingBoxProps> = ({
  onBoxAdded,
  buttonVariant = "default",
  buttonSize = "default",
  buttonText = "Add New Box",
  products,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [supplierName, setSupplierName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const {
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
  } = useProductSearch(products);

  // Ensure we're only using products from the Product Master
  useEffect(() => {
    if (products.length === 0) {
      console.warn("No products available from Product Master");
    } else {
      console.log(`${products.length} products loaded from Product Master`);
    }
  }, [products]);

  const { isLoading, createBoxStock } = useIncomingBoxStock();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Validate inputs
      if (!selectedProductId) {
        throw new Error("Please select a product");
      }

      if (!supplierName.trim()) {
        throw new Error("Supplier name is required");
      }

      if (boxesReceived <= 0) {
        throw new Error("Boxes received must be a positive number");
      }

      // Get product details and validate product exists in Product Master
      const product = products.find((p) => p.id === selectedProductId);
      if (!product) {
        throw new Error(
          "Selected product not found in Product Master. Please select a valid product.",
        );
      }

      // Validate product has box_contents defined
      if (!product.box_contents || product.box_contents <= 0) {
        throw new Error(
          `Product ${product.name} (${product.sku}) has invalid box contents value. Please update the product in Product Master.`,
        );
      }

      // Create the new box stock record
      const newBoxStock = {
        incoming_date: new Date().toISOString(),
        product_id: selectedProductId,
        sku: product.sku,
        boxes_received: boxesReceived,
        supplier_name: supplierName.trim(),
        description: description.trim(),
        total_units: boxesReceived * product.box_contents,
      };

      console.log("Creating new box stock with validated data:", newBoxStock);

      // Save to database
      const result = await createBoxStock(newBoxStock);

      if (result.success) {
        // Reset form and close dialog
        resetForm();
        setIsOpen(false);

        // Notify parent component
        if (onBoxAdded) {
          onBoxAdded();
        }
      } else {
        throw new Error(result.error || "Failed to add box stock");
      }
    } catch (err: any) {
      console.error("Error in handleSubmit:", err);
      setError(err.message || "An error occurred");
    }
  };

  const resetForm = () => {
    resetProductSearch();
    setSupplierName("");
    setDescription("");
    setError(null);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant={buttonVariant}
          size={buttonSize}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Box</DialogTitle>
          <DialogDescription>
            Enter the details for the incoming shipment of boxed inventory.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="skuSearch" className="text-base font-medium">
                Product SKU
              </Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="skuSearch"
                  placeholder="Search by SKU to select a product"
                  value={skuSearchQuery}
                  onChange={(e) => setSkuSearchQuery(e.target.value)}
                  className="w-full pl-8"
                />
                {skuSearchQuery && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredProductsBySku.length > 0 ? (
                      filteredProductsBySku.map((product) => (
                        <div
                          key={product.id}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            handleSkuSelection(product.sku);
                            setSkuSearchQuery("");
                          }}
                        >
                          <div className="font-medium">{product.sku}</div>
                          <div className="text-sm text-gray-500">
                            {product.name}
                          </div>
                          <div className="text-xs text-blue-600 mt-1">
                            {product.box_contents > 0
                              ? `${product.box_contents} units per box`
                              : "⚠️ Box contents not defined"}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-2 text-gray-500">
                        No matching products found in Product Master
                      </div>
                    )}
                  </div>
                )}
              </div>

              {selectedSku && selectedProductDetails && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-md font-medium text-blue-800">
                      Selected Product Information
                    </div>
                    <Badge variant="outline" className="bg-blue-100">
                      SKU: {selectedSku}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs text-gray-500">Product Name</div>
                      <div className="text-sm font-medium">
                        {selectedProductDetails.name}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Box Contents</div>
                      <div
                        className={`text-sm font-medium ${selectedProductDetails.box_contents <= 0 ? "text-red-600" : ""}`}
                      >
                        {selectedProductDetails.box_contents > 0
                          ? `${selectedProductDetails.box_contents} units per box`
                          : "⚠️ Box contents not defined"}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <div className="text-xs text-gray-500">Category</div>
                      <div className="text-sm font-medium">
                        {selectedProductDetails.category || "Not specified"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Product ID</div>
                      <div className="text-sm font-medium text-gray-600 truncate">
                        {selectedProductDetails.id}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="incomingDate">Incoming Date</Label>
                <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                  {new Date().toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplierName">Supplier Name</Label>
                <Input
                  id="supplierName"
                  placeholder="Enter supplier name"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="boxesReceived" className="font-medium">
                  Boxes Received
                </Label>
                <Input
                  id="boxesReceived"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={boxesReceived}
                  onChange={(e) =>
                    setBoxesReceived(parseInt(e.target.value) || 1)
                  }
                  required
                  className="text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalUnits" className="font-medium">
                  Total Units (Auto-calculated)
                </Label>
                <div className="relative">
                  <Input
                    id="totalUnits"
                    type="number"
                    disabled
                    value={calculatedTotalUnits}
                    placeholder="Will be calculated automatically"
                    className="bg-gray-50 text-lg font-medium"
                  />
                  {calculatedTotalUnits > 0 && (
                    <div className="absolute right-3 top-2.5 text-sm text-blue-600">
                      pairs
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Additional notes about this shipment"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-sm text-red-500 p-2 border border-red-200 bg-red-50 rounded flex items-start gap-2">
                <div className="shrink-0 mt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-alert-circle"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div>{error}</div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Save Receipt"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddIncomingBox;
