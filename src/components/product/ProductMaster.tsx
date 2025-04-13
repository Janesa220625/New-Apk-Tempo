import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "@supabase/auth-helpers-react";
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  Download,
  Trash2,
  Edit,
  Eye,
  Loader2,
} from "lucide-react";
import { formatRupiah } from "@/utils/currency";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Product } from "@/types/schema";
import { productService } from "@/services/productService";
import { useToast } from "@/components/ui/use-toast";

export default function ProductMaster() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const user = useUser();

  // Fetch products from Supabase
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching products...");
      const data = await productService.getProducts();
      console.log("Products fetched successfully:", data);
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load products on component mount
  useEffect(() => {
    fetchProducts();

    // Set up a refresh interval to ensure products are up to date
    const refreshInterval = setInterval(() => {
      fetchProducts();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(refreshInterval);
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsViewDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleAddProduct = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const newProduct = {
        sku: formData.get("sku") as string,
        name: formData.get("name") as string,
        price: parseFloat(formData.get("price") as string),
        box_contents: parseInt(formData.get("box_contents") as string),
        description: formData.get("description") as string,
        category: formData.get("category") as string,
      };

      console.log("Adding new product:", newProduct);

      // Pass the current user's ID when creating a product
      const createdProduct = await productService.createProduct(
        newProduct,
        user?.id,
      );
      console.log("Product created successfully:", createdProduct);

      toast({
        title: "Success",
        description: "Product added successfully",
      });

      // Immediately fetch products to update the list
      await fetchProducts();
      setIsAddDialogOpen(false);
    } catch (error: any) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to add product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduct = async (formData: FormData) => {
    if (!selectedProduct) return;
    setIsSubmitting(true);
    try {
      const updatedProduct = {
        sku: formData.get("sku") as string,
        name: formData.get("name") as string,
        price: parseFloat(formData.get("price") as string),
        box_contents: parseInt(formData.get("box_contents") as string),
        description: formData.get("description") as string,
        category: formData.get("category") as string,
      };

      await productService.updateProduct(selectedProduct.id, updatedProduct);
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      await fetchProducts();
      setIsEditDialogOpen(false);
    } catch (error: any) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to update product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    setIsSubmitting(true);
    try {
      await productService.deleteProduct(selectedProduct.id);
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      await fetchProducts();
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const { t } = useTranslation();

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t("product.productMaster")}</h1>
          <p className="text-gray-500">{t("product.productMasterDesc")}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> {t("product.addProduct")}
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search by SKU or product name..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Boys Shoes">Boys Shoes</SelectItem>
                  <SelectItem value="Girls Shoes">Girls Shoes</SelectItem>
                  <SelectItem value="Boys Sandals">Boys Sandals</SelectItem>
                  <SelectItem value="Girls Sandals">Girls Sandals</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={fetchProducts}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Debug info - can be removed in production */}
          <div className="mb-4 p-2 bg-blue-50 border border-blue-100 rounded text-sm">
            <div>
              <strong>Debug Info:</strong>
            </div>
            <div>Products loaded: {products.length}</div>
            {products.length > 0 && (
              <div>
                Latest product: {products[0]?.name || "None"} (SKU:{" "}
                {products[0]?.sku || "None"})
              </div>
            )}
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("fields.sku")}</TableHead>
                  <TableHead>{t("fields.productName")}</TableHead>
                  <TableHead>{t("fields.category")}</TableHead>
                  <TableHead className="text-right">
                    {t("fields.price")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("fields.boxContents")}
                  </TableHead>
                  <TableHead>{t("fields.creator")}</TableHead>
                  <TableHead className="text-right">
                    {t("common.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Loading products...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No products found.{" "}
                      {searchQuery &&
                        `Try a different search term than "${searchQuery}".`}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.sku}
                      </TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="text-right">
                        {formatRupiah(product.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        {product.box_contents} pairs
                      </TableCell>
                      <TableCell>
                        {product.creator_id
                          ? product.creator_id.substring(0, 8) + "..."
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewProduct(product)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteProduct(product)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter>
          <div className="w-full flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Showing {filteredProducts.length} of {products.length} products
              {searchQuery && (
                <span className="ml-2">filtered by "{searchQuery}"</span>
              )}
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardFooter>
      </Card>

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t("product.addProduct")}</DialogTitle>
            <DialogDescription>
              Enter the details for the new product to add to the catalog.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddProduct(new FormData(e.currentTarget));
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">{t("fields.sku")}</Label>
                  <Input
                    id="sku"
                    name="sku"
                    placeholder="Enter SKU code"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">{t("fields.productName")}</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter product name"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">{t("fields.price")} (per pair)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="box_contents">
                    {t("fields.boxContents")} (pairs per box)
                  </Label>
                  <Input
                    id="box_contents"
                    name="box_contents"
                    type="number"
                    min="1"
                    placeholder="1"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">{t("fields.category")}</Label>
                <Select name="category" defaultValue="Boys Shoes">
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Boys Shoes">Boys Shoes</SelectItem>
                    <SelectItem value="Girls Shoes">Girls Shoes</SelectItem>
                    <SelectItem value="Boys Sandals">Boys Sandals</SelectItem>
                    <SelectItem value="Girls Sandals">Girls Sandals</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">
                  {t("fields.description")} (Optional)
                </Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Product description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("common.saving")}
                  </>
                ) : (
                  t("product.addProduct")
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t("product.editProduct")}</DialogTitle>
            <DialogDescription>
              Update the details for this product.
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateProduct(new FormData(e.currentTarget));
              }}
            >
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-sku">SKU Code</Label>
                    <Input
                      id="edit-sku"
                      name="sku"
                      defaultValue={selectedProduct.sku}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Product Name</Label>
                    <Input
                      id="edit-name"
                      name="name"
                      defaultValue={selectedProduct.name}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-price">Price (per pair)</Label>
                    <Input
                      id="edit-price"
                      name="price"
                      type="number"
                      min="0.01"
                      step="0.01"
                      defaultValue={selectedProduct.price}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-box_contents">
                      Box Contents (pairs per box)
                    </Label>
                    <Input
                      id="edit-box_contents"
                      name="box_contents"
                      type="number"
                      min="1"
                      defaultValue={selectedProduct.box_contents}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    name="category"
                    defaultValue={selectedProduct.category}
                  >
                    <SelectTrigger id="edit-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Boys Shoes">Boys Shoes</SelectItem>
                      <SelectItem value="Girls Shoes">Girls Shoes</SelectItem>
                      <SelectItem value="Boys Sandals">Boys Sandals</SelectItem>
                      <SelectItem value="Girls Sandals">
                        Girls Sandals
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">
                    Description (Optional)
                  </Label>
                  <Input
                    id="edit-description"
                    name="description"
                    defaultValue={selectedProduct.description}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("common.saving")}
                    </>
                  ) : (
                    t("common.save")
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* View Product Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t("product.viewProduct")}</DialogTitle>
            <DialogDescription>
              Detailed information about this product.
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    SKU Code
                  </h3>
                  <p className="mt-1">{selectedProduct.sku}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Product Name
                  </h3>
                  <p className="mt-1">{selectedProduct.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Category
                  </h3>
                  <p className="mt-1">{selectedProduct.category}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Price</h3>
                  <p className="mt-1">
                    {formatRupiah(selectedProduct.price)} per pair
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Box Contents
                </h3>
                <p className="mt-1">
                  {selectedProduct.box_contents} pairs per box
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Description
                </h3>
                <p className="mt-1">
                  {selectedProduct.description || "No description provided"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Creator ID
                </h3>
                <p className="mt-1">
                  {selectedProduct.creator_id || "No creator information"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Created At
                  </h3>
                  <p className="mt-1">
                    {new Date(selectedProduct.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Last Updated
                  </h3>
                  <p className="mt-1">
                    {new Date(selectedProduct.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>
              {t("common.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("product.deleteProduct")}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="py-4">
              <p className="text-sm">
                <span className="font-medium">SKU:</span> {selectedProduct.sku}
              </p>
              <p className="text-sm">
                <span className="font-medium">Product:</span>{" "}
                {selectedProduct.name}
              </p>
              <p className="text-sm">
                <span className="font-medium">Category:</span>{" "}
                {selectedProduct.category}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("common.deleting")}
                </>
              ) : (
                t("common.delete")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
