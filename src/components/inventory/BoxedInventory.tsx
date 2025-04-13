import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useTranslation } from "react-i18next";
import {
  useIncomingBoxStock,
  BoxedInventorySummary,
} from "@/hooks/useIncomingBoxStock";

const BoxedInventory = () => {
  const { t } = useTranslation();
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] =
    useState<BoxedInventorySummary | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Use the hook to get the boxed inventory summary
  const {
    boxedInventorySummary,
    isLoading,
    error,
    fetchBoxStocks,
    fetchProducts,
    formatDate,
  } = useIncomingBoxStock();

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

  // Filter inventory data based on search query, category, and status
  const filteredInventory = boxedInventorySummary.filter((item) => {
    // Filter by search query
    const matchesSearch =
      !searchQuery ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.productName.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by category
    const matchesCategory =
      categoryFilter === "all" ||
      item.category.toLowerCase().replace(" ", "-") === categoryFilter;

    // Filter by status
    const matchesStatus =
      statusFilter === "all" ||
      item.status.toLowerCase().replace(" ", "-") === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleViewItem = (item: BoxedInventorySummary) => {
    setSelectedItem(item);
    setIsViewDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "In Stock":
        return <Badge className="bg-green-500">{t("status.inStock")}</Badge>;
      case "Low Stock":
        return <Badge className="bg-yellow-500">{t("status.lowStock")}</Badge>;
      case "Out of Stock":
        return <Badge className="bg-red-500">{t("status.outOfStock")}</Badge>;
      default:
        return <Badge>{t("common.unknown")}</Badge>;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {t("inventory.boxedInventory", "Boxed Inventory")}
          </h1>
          <p className="text-gray-500">
            {t(
              "inventory.boxedInventoryDesc",
              "Summary of available box stock across all warehouses",
            )}
          </p>
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
                  placeholder={`${t("common.search", "Search")} ${t("fields.sku", "SKU")} ${t("common.or", "or")} ${t("fields.productName", "product name")}...`}
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("fields.category", "Category")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("common.all", "All")}{" "}
                    {t("fields.category", "Categories")}
                  </SelectItem>
                  <SelectItem value="boys-shoes">Boys Shoes</SelectItem>
                  <SelectItem value="girls-shoes">Girls Shoes</SelectItem>
                  <SelectItem value="boys-sandals">Boys Sandals</SelectItem>
                  <SelectItem value="girls-sandals">Girls Sandals</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("fields.status", "Status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("common.all", "All")} {t("fields.status", "Statuses")}
                  </SelectItem>
                  <SelectItem value="in-stock">
                    {t("status.inStock", "In Stock")}
                  </SelectItem>
                  <SelectItem value="low-stock">
                    {t("status.lowStock", "Low Stock")}
                  </SelectItem>
                  <SelectItem value="out-of-stock">
                    {t("status.outOfStock", "Out of Stock")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  fetchProducts();
                  fetchBoxStocks();
                }}
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
          {error && (
            <div className="mb-4 p-2 bg-red-50 border border-red-100 rounded text-sm">
              <div className="text-red-500">Error: {error}</div>
            </div>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("fields.sku", "SKU")}</TableHead>
                  <TableHead>
                    {t("fields.productName", "Product Name")}
                  </TableHead>
                  <TableHead>{t("fields.category", "Category")}</TableHead>
                  <TableHead className="text-right">
                    {t("fields.boxQuantity", "Box Quantity")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("fields.pairsPerBox", "Pairs Per Box")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("fields.totalPairs", "Total Pairs")}
                  </TableHead>
                  <TableHead>
                    {t("fields.lastUpdated", "Last Updated")}
                  </TableHead>
                  <TableHead>{t("fields.status", "Status")}</TableHead>
                  <TableHead className="text-right">
                    {t("common.actions", "Actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <p className="mt-2 text-sm text-gray-500">
                        {t("common.loading", "Loading inventory data...")}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : filteredInventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-4">
                      <p className="text-sm text-gray-500">
                        {searchQuery ||
                        categoryFilter !== "all" ||
                        statusFilter !== "all"
                          ? t(
                              "common.noMatchingResults",
                              "No matching results found",
                            )
                          : t("common.noData", "No inventory data available")}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.sku}</TableCell>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className="text-right">
                        {item.boxQuantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.pairsPerBox}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.totalPairs}
                      </TableCell>
                      <TableCell>{formatDate(item.lastUpdated)}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewItem(item)}
                          >
                            <Eye className="h-4 w-4" />
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
              {t("common.showing", "Showing")} {filteredInventory.length}{" "}
              {t("common.of", "of")} {boxedInventorySummary.length}{" "}
              {t("common.items", "items")}
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
            <DialogTitle>
              {t("dialogs.boxStockDetails", "Box Stock Details")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "dialogs.boxStockDetailsDesc",
                "Detailed information about this box stock item.",
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {t("fields.sku", "SKU")}
                  </h3>
                  <p className="mt-1">{selectedItem.sku}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {t("fields.productName", "Product Name")}
                  </h3>
                  <p className="mt-1">{selectedItem.productName}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {t("fields.category", "Category")}
                  </h3>
                  <p className="mt-1">{selectedItem.category}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {t("fields.status", "Status")}
                  </h3>
                  <div className="mt-1">
                    {getStatusBadge(selectedItem.status)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {t("fields.boxQuantity", "Box Quantity")}
                  </h3>
                  <p className="mt-1">{selectedItem.boxQuantity}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {t("fields.pairsPerBox", "Pairs Per Box")}
                  </h3>
                  <p className="mt-1">{selectedItem.pairsPerBox}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {t("fields.totalPairs", "Total Pairs")}
                  </h3>
                  <p className="mt-1">{selectedItem.totalPairs}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  {t("fields.lastUpdated", "Last Updated")}
                </h3>
                <p className="mt-1">{formatDate(selectedItem.lastUpdated)}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>
              {t("common.close", "Close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BoxedInventory;
