import React, { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  Download,
  Trash2,
  Edit,
  Eye,
} from "lucide-react";
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

const ProductMaster = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Mock data for demonstration
  const mockProductData: Product[] = [
    {
      id: "1",
      sku: "SN-001",
      name: "Running Shoes Model X",
      price: 89.99,
      boxContents: 12,
      description: "High-performance running shoes with cushioned soles",
      category: "Sneakers",
      createdAt: "2023-06-15T00:00:00Z",
      updatedAt: "2023-06-15T00:00:00Z",
    },
    {
      id: "2",
      sku: "SN-002",
      name: "Casual Sneakers Y",
      price: 59.99,
      boxContents: 10,
      description: "Comfortable everyday sneakers",
      category: "Sneakers",
      createdAt: "2023-06-10T00:00:00Z",
      updatedAt: "2023-06-10T00:00:00Z",
    },
    {
      id: "3",
      sku: "BT-001",
      name: "Leather Boots Z",
      price: 129.99,
      boxContents: 8,
      description: "Premium leather boots for formal occasions",
      category: "Boots",
      createdAt: "2023-05-28T00:00:00Z",
      updatedAt: "2023-05-28T00:00:00Z",
    },
    {
      id: "4",
      sku: "SD-001",
      name: "Summer Sandals",
      price: 49.99,
      boxContents: 20,
      description: "Lightweight summer sandals",
      category: "Women's Sandals",
      createdAt: "2023-06-12T00:00:00Z",
      updatedAt: "2023-06-12T00:00:00Z",
    },
    {
      id: "5",
      sku: "BT-002",
      name: "Winter Boots",
      price: 149.99,
      boxContents: 6,
      description: "Insulated winter boots for cold weather",
      category: "Boots",
      createdAt: "2023-06-01T00:00:00Z",
      updatedAt: "2023-06-01T00:00:00Z",
    },
  ];

  const [products, setProducts] = useState<Product[]>(mockProductData);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
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

  const handleAddProduct = (formData: FormData) => {
    // In a real application, this would be an API call
    const newProduct: Product = {
      id: (products.length + 1).toString(),
      sku: formData.get("sku") as string,
      name: formData.get("name") as string,
      price: parseFloat(formData.get("price") as string),
      boxContents: parseInt(formData.get("boxContents") as string),
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProducts([...products, newProduct]);
    setIsAddDialogOpen(false);
  };

  const handleUpdateProduct = (formData: FormData) => {
    if (!selectedProduct) return;

    // In a real application, this would be an API call
    const updatedProduct: Product = {
      ...selectedProduct,
      sku: formData.get("sku") as string,
      name: formData.get("name") as string,
      price: parseFloat(formData.get("price") as string),
      boxContents: parseInt(formData.get("boxContents") as string),
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      updatedAt: new Date().toISOString(),
    };

    setProducts(
      products.map((product) =>
        product.id === selectedProduct.id ? updatedProduct : product,
      ),
    );
    setIsEditDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!selectedProduct) return;

    // In a real application, this would be an API call
    setProducts(
      products.filter((product) => product.id !== selectedProduct.id),
    );
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Product Master</h1>
          <p className="text-gray-500">Manage product catalog</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
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
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                  <SelectItem value="Sneakers">Sneakers</SelectItem>
                  <SelectItem value="Boots">Boots</SelectItem>
                  <SelectItem value="Men's Sandals">Men's Sandals</SelectItem>
                  <SelectItem value="Women's Sandals">
                    Women's Sandals
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Box Contents</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.sku}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="text-right">
                      ${product.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {product.boxContents} pairs
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
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter>
          <div className="w-full flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Showing {filteredProducts.length} of {products.length} products
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
            <DialogTitle>Add New Product</DialogTitle>
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
                  <Label htmlFor="sku">SKU Code</Label>
                  <Input
                    id="sku"
                    name="sku"
                    placeholder="Enter SKU code"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
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
                  <Label htmlFor="price">Price (per pair)</Label>
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
                  <Label htmlFor="boxContents">
                    Box Contents (pairs per box)
                  </Label>
                  <Input
                    id="boxContents"
                    name="boxContents"
                    type="number"
                    min="1"
                    placeholder="1"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category" defaultValue="Sneakers">
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sneakers">Sneakers</SelectItem>
                    <SelectItem value="Boots">Boots</SelectItem>
                    <SelectItem value="Men's Sandals">Men's Sandals</SelectItem>
                    <SelectItem value="Women's Sandals">
                      Women's Sandals
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
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
              <Button type="submit">Add Product</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
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
                    <Label htmlFor="edit-boxContents">
                      Box Contents (pairs per box)
                    </Label>
                    <Input
                      id="edit-boxContents"
                      name="boxContents"
                      type="number"
                      min="1"
                      defaultValue={selectedProduct.boxContents}
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
                      <SelectItem value="Sneakers">Sneakers</SelectItem>
                      <SelectItem value="Boots">Boots</SelectItem>
                      <SelectItem value="Men's Sandals">
                        Men's Sandals
                      </SelectItem>
                      <SelectItem value="Women's Sandals">
                        Women's Sandals
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
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* View Product Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
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
                    ${selectedProduct.price.toFixed(2)} per pair
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Box Contents
                </h3>
                <p className="mt-1">
                  {selectedProduct.boxContents} pairs per box
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Created At
                  </h3>
                  <p className="mt-1">
                    {new Date(selectedProduct.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Last Updated
                  </h3>
                  <p className="mt-1">
                    {new Date(selectedProduct.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
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
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductMaster;
