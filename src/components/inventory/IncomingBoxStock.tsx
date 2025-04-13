import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  Filter,
  RefreshCw,
  Download,
  Calendar,
  Loader2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { IncomingBoxStock as IncomingBoxStockType } from "@/types/schema";
import { useIncomingBoxStock } from "@/hooks/useIncomingBoxStock";
import { useDateFilter } from "@/hooks/useDateFilter";
import IncomingBoxStockTable from "./IncomingBoxStockTable";
import AddIncomingBox from "./AddIncomingBox";

const IncomingBoxStockComponent = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedBoxStock, setSelectedBoxStock] =
    useState<IncomingBoxStockType | null>(null);

  // Use custom hooks
  const {
    boxStocks,
    products,
    isLoading,
    error,
    fetchBoxStocks,
    fetchProducts,
    getProductName,
    formatDate,
    deleteBoxStock,
  } = useIncomingBoxStock();

  // Use the date filter hook
  const {
    selectedDateRange,
    startDate,
    endDate,
    handleDateRangeChange,
    isDateInRange,
  } = useDateFilter();

  // Load data on component mount
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        await fetchProducts();
        if (isMounted) {
          await fetchBoxStocks();
        }
      } catch (err) {
        console.error("Error loading initial data:", err);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter box stocks based on search and date
  const filteredBoxStocks = boxStocks.filter((boxStock) => {
    // Filter by search query
    const matchesSearch =
      !searchQuery ||
      boxStock.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getProductName(boxStock.product_id)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (boxStock.supplier_name?.toLowerCase() || "").includes(
        searchQuery.toLowerCase(),
      );

    // Filter by date range
    const matchesDateFilter = isDateInRange(boxStock.incoming_date);

    return matchesSearch && matchesDateFilter;
  });

  const handleViewBoxStock = (boxStock: IncomingBoxStockType) => {
    setSelectedBoxStock(boxStock);
    setIsViewDialogOpen(true);
  };

  const handleDeleteBoxStock = (boxStock: IncomingBoxStockType) => {
    setSelectedBoxStock(boxStock);
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBoxStock) return;

    try {
      await deleteBoxStock(selectedBoxStock.id);
      setIsDeleteAlertOpen(false);
    } catch (error) {
      console.error("Error deleting incoming box stock:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 h-full w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {t("inventory.incomingStock", "Incoming Box Stock")}
          </h1>
          <p className="text-gray-500">
            {t(
              "inventory.incomingStockDesc",
              "Manage incoming shipments of boxed inventory",
            )}
          </p>
        </div>
        <AddIncomingBox products={products} onBoxAdded={fetchBoxStocks} />
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search by SKU, product name or supplier..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select
                value={selectedDateRange}
                onValueChange={handleDateRangeChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>

              {selectedDateRange === "custom" && (
                <div className="flex gap-2">
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="date"
                      className="pl-8 w-[150px]"
                      value={startDate}
                      onChange={(e) =>
                        handleDateRangeChange("custom", e.target.value, endDate)
                      }
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="date"
                      className="pl-8 w-[150px]"
                      value={endDate}
                      onChange={(e) =>
                        handleDateRangeChange(
                          "custom",
                          startDate,
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>
              )}

              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={fetchBoxStocks}
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
            <div>Box stocks loaded: {boxStocks.length}</div>
            <div>Filtered box stocks: {filteredBoxStocks.length}</div>
            {error && <div className="text-red-500">Error: {error}</div>}
          </div>

          <IncomingBoxStockTable
            boxStocks={filteredBoxStocks}
            products={products}
            isLoading={isLoading}
            onViewBoxStock={handleViewBoxStock}
            onDeleteBoxStock={handleDeleteBoxStock}
          />
        </CardContent>
        <CardFooter>
          <div className="w-full flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Showing {filteredBoxStocks.length} of {boxStocks.length} incoming
              shipments
              {searchQuery && (
                <span className="ml-1">filtered by "{searchQuery}"</span>
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
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardFooter>
      </Card>

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
                    {formatDate(selectedBoxStock.incoming_date)}
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
                  {getProductName(selectedBoxStock.product_id)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Boxes Received
                  </h3>
                  <p className="mt-1">
                    {selectedBoxStock.boxes_received} boxes
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Total Units
                  </h3>
                  <p className="mt-1">{selectedBoxStock.total_units} pairs</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Supplier Name
                </h3>
                <p className="mt-1">
                  {selectedBoxStock.supplier_name || "No supplier specified"}
                </p>
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
                    {formatDate(selectedBoxStock.created_at)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Last Updated
                  </h3>
                  <p className="mt-1">
                    {formatDate(selectedBoxStock.updated_at)}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Created By
                </h3>
                <p className="mt-1 flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  {selectedBoxStock.creator_id
                    ? selectedBoxStock.creator_id.substring(0, 8) + "..."
                    : "System"}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this incoming shipment record?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedBoxStock && (
            <div className="py-4 border rounded-md p-3 bg-muted/20">
              <p className="text-sm">
                <span className="font-medium">Date:</span>{" "}
                {formatDate(selectedBoxStock.incoming_date)}
              </p>
              <p className="text-sm">
                <span className="font-medium">SKU:</span> {selectedBoxStock.sku}
              </p>
              <p className="text-sm">
                <span className="font-medium">Product:</span>{" "}
                {getProductName(selectedBoxStock.product_id)}
              </p>
              <p className="text-sm">
                <span className="font-medium">Supplier:</span>{" "}
                {selectedBoxStock.supplier_name || "N/A"}
              </p>
              <p className="text-sm">
                <span className="font-medium">Quantity:</span>{" "}
                {selectedBoxStock.boxes_received} boxes (
                {selectedBoxStock.total_units} pairs)
              </p>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default IncomingBoxStockComponent;
