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
  Calendar,
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { IncomingBoxStock, Product } from "@/types/schema";

const IncomingBoxStockComponent = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBoxStock, setSelectedBoxStock] =
    useState<IncomingBoxStock | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState("all");

  // Mock product data for demonstration
  const mockProductData: Product[] = [
    {
      id: "1",
      sku: "SN-001",
      name: "Running Shoes Model X",
      price: 89.99,
      boxContents: 12,
      description: "High-performance running shoes with cushioned soles",
      category: "Boys Shoes",
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
      category: "Girls Shoes",
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
      category: "Boys Sandals",
      createdAt: "2023-05-28T00:00:00Z",
      updatedAt: "2023-05-28T00:00:00Z",
    },
  ];

  // Mock data for incoming box stock
  const mockBoxStockData: IncomingBoxStock[] = [
    {
      id: "1",
      incomingDate: "2023-07-10T00:00:00Z",
      productId: "1",
      sku: "SN-001",
      boxesReceived: 5,
      description: "Regular monthly shipment",
      totalUnits: 60, // 5 boxes * 12 pairs per box
      createdAt: "2023-07-10T00:00:00Z",
      updatedAt: "2023-07-10T00:00:00Z",
    },
    {
      id: "2",
      incomingDate: "2023-07-15T00:00:00Z",
      productId: "2",
      sku: "SN-002",
      boxesReceived: 8,
      description: "Special order for summer season",
      totalUnits: 80, // 8 boxes * 10 pairs per box
      createdAt: "2023-07-15T00:00:00Z",
      updatedAt: "2023-07-15T00:00:00Z",
    },
    {
      id: "3",
      incomingDate: "2023-07-20T00:00:00Z",
      productId: "3",
      sku: "BT-001",
      boxesReceived: 3,
      description: "Restocking for fall season",
      totalUnits: 24, // 3 boxes * 8 pairs per box
      createdAt: "2023-07-20T00:00:00Z",
      updatedAt: "2023-07-20T00:00:00Z",
    },
  ];

  const [boxStocks, setBoxStocks] =
    useState<IncomingBoxStock[]>(mockBoxStockData);

  const filteredBoxStocks = boxStocks.filter((boxStock) => {
    const matchesSearch =
      boxStock.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getProductName(boxStock.productId)
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    // Date filtering logic would go here
    return matchesSearch;
  });

  const getProductName = (productId: string): string => {
    const product = mockProductData.find((p) => p.id === productId);
    return product ? product.name : "Unknown Product";
  };

  const getBoxContents = (productId: string): number => {
    const product = mockProductData.find((p) => p.id === productId);
    return product ? product.boxContents : 0;
  };

  const handleViewBoxStock = (boxStock: IncomingBoxStock) => {
    setSelectedBoxStock(boxStock);
    setIsViewDialogOpen(true);
  };

  const handleDeleteBoxStock = (boxStock: IncomingBoxStock) => {
    setSelectedBoxStock(boxStock);
    setIsDeleteDialogOpen(true);
  };

  const handleAddBoxStock = (formData: FormData) => {
    // In a real application, this would be an API call
    const productId = formData.get("productId") as string;
    const boxesReceived = parseInt(formData.get("boxesReceived") as string);
    const boxContents = getBoxContents(productId);
    const product = mockProductData.find((p) => p.id === productId);

    if (!product) return;

    const currentDate = new Date().toISOString();
    const newBoxStock: IncomingBoxStock = {
      id: (boxStocks.length + 1).toString(),
      incomingDate: currentDate,
      productId: productId,
      sku: product.sku,
      boxesReceived: boxesReceived,
      description: formData.get("description") as string,
      totalUnits: boxesReceived * boxContents,
      createdAt: currentDate,
      updatedAt: currentDate,
    };

    setBoxStocks([...boxStocks, newBoxStock]);
    setIsAddDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!selectedBoxStock) return;

    // In a real application, this would be an API call
    setBoxStocks(
      boxStocks.filter((boxStock) => boxStock.id !== selectedBoxStock.id),
    );
    setIsDeleteDialogOpen(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Incoming Box Stock</h1>
          <p className="text-gray-500">
            Manage incoming shipments of boxed inventory
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Record Incoming Stock
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
                value={selectedDateRange}
                onValueChange={setSelectedDateRange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
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
                  <TableHead>Incoming Date</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead className="text-right">Boxes Received</TableHead>
                  <TableHead className="text-right">Total Units</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBoxStocks.map((boxStock) => (
                  <TableRow key={boxStock.id}>
                    <TableCell>{formatDate(boxStock.incomingDate)}</TableCell>
                    <TableCell className="font-medium">
                      {boxStock.sku}
                    </TableCell>
                    <TableCell>{getProductName(boxStock.productId)}</TableCell>
                    <TableCell className="text-right">
                      {boxStock.boxesReceived} boxes
                    </TableCell>
                    <TableCell className="text-right">
                      {boxStock.totalUnits} pairs
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewBoxStock(boxStock)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteBoxStock(boxStock)}
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
              Showing {filteredBoxStocks.length} of {boxStocks.length} incoming
              shipments
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

      {/* Add Box Stock Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Record Incoming Box Stock</DialogTitle>
            <DialogDescription>
              Enter the details for the incoming shipment of boxed inventory.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddBoxStock(new FormData(e.currentTarget));
            }}
          >
            <div className="grid gap-4 py-4">
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
                  <input
                    type="hidden"
                    id="incomingDate"
                    name="incomingDate"
                    value={new Date().toISOString()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productId">Product</Label>
                  <Select name="productId" defaultValue="">
                    <SelectTrigger id="productId">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockProductData.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.sku} - {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="boxesReceived">Boxes Received</Label>
                  <Input
                    id="boxesReceived"
                    name="boxesReceived"
                    type="number"
                    min="1"
                    placeholder="1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalUnits">
                    Total Units (Auto-calculated)
                  </Label>
                  <Input
                    id="totalUnits"
                    name="totalUnits"
                    type="number"
                    disabled
                    placeholder="Will be calculated automatically"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Additional notes about this shipment"
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
              <Button type="submit">Record Shipment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Box Stock Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Incoming Shipment Details</DialogTitle>
            <DialogDescription>
              Detailed information about this incoming shipment.
            </DialogDescription>
          </DialogHeader>
          {selectedBoxStock && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Incoming Date
                  </h3>
                  <p className="mt-1">
                    {formatDate(selectedBoxStock.incomingDate)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">SKU</h3>
                  <p className="mt-1">{selectedBoxStock.sku}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Product Name
                </h3>
                <p className="mt-1">
                  {getProductName(selectedBoxStock.productId)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Boxes Received
                  </h3>
                  <p className="mt-1">{selectedBoxStock.boxesReceived} boxes</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Total Units
                  </h3>
                  <p className="mt-1">{selectedBoxStock.totalUnits} pairs</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Description
                </h3>
                <p className="mt-1">
                  {selectedBoxStock.description || "No description provided"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Created At
                  </h3>
                  <p className="mt-1">
                    {formatDate(selectedBoxStock.createdAt)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Last Updated
                  </h3>
                  <p className="mt-1">
                    {formatDate(selectedBoxStock.updatedAt)}
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
              Are you sure you want to delete this incoming shipment record?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedBoxStock && (
            <div className="py-4">
              <p className="text-sm">
                <span className="font-medium">Date:</span>{" "}
                {formatDate(selectedBoxStock.incomingDate)}
              </p>
              <p className="text-sm">
                <span className="font-medium">SKU:</span> {selectedBoxStock.sku}
              </p>
              <p className="text-sm">
                <span className="font-medium">Product:</span>{" "}
                {getProductName(selectedBoxStock.productId)}
              </p>
              <p className="text-sm">
                <span className="font-medium">Quantity:</span>{" "}
                {selectedBoxStock.boxesReceived} boxes (
                {selectedBoxStock.totalUnits} pairs)
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

export default IncomingBoxStockComponent;
