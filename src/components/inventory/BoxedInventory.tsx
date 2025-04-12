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
import { useTranslation } from "react-i18next";

interface BoxInventoryItem {
  id: string;
  sku: string;
  productName: string;
  category: string;
  boxQuantity: number;
  pairsPerBox: number;
  totalPairs: number;
  lastUpdated: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

const BoxedInventory = () => {
  const { t } = useTranslation();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BoxInventoryItem | null>(
    null,
  );

  // Mock data for demonstration
  const mockInventoryData: BoxInventoryItem[] = [
    {
      id: "1",
      sku: "SH-RN-001",
      productName: "Running Shoes Model X",
      category: "Boys Shoes",
      boxQuantity: 25,
      pairsPerBox: 12,
      totalPairs: 300,
      lastUpdated: "2023-06-15",
      status: "In Stock",
    },
    {
      id: "2",
      sku: "SH-CS-002",
      productName: "Casual Sneakers Y",
      category: "Girls Shoes",
      boxQuantity: 8,
      pairsPerBox: 10,
      totalPairs: 80,
      lastUpdated: "2023-06-10",
      status: "Low Stock",
    },
    {
      id: "3",
      sku: "SH-DR-003",
      productName: "Dress Shoes Z",
      category: "Boys Sandals",
      boxQuantity: 0,
      pairsPerBox: 8,
      totalPairs: 0,
      lastUpdated: "2023-05-28",
      status: "Out of Stock",
    },
    {
      id: "4",
      sku: "SH-SD-004",
      productName: "Summer Sandals",
      category: "Girls Shoes",
      boxQuantity: 15,
      pairsPerBox: 20,
      totalPairs: 300,
      lastUpdated: "2023-06-12",
      status: "In Stock",
    },
    {
      id: "5",
      sku: "SH-BT-005",
      productName: "Winter Boots",
      category: "Girls Sandals",
      boxQuantity: 12,
      pairsPerBox: 6,
      totalPairs: 72,
      lastUpdated: "2023-06-01",
      status: "In Stock",
    },
  ];

  const handleViewItem = (item: BoxInventoryItem) => {
    setSelectedItem(item);
    setIsViewDialogOpen(true);
  };

  const handleEditItem = (item: BoxInventoryItem) => {
    setSelectedItem(item);
    setIsEditDialogOpen(true);
  };

  const handleDeleteItem = (item: BoxInventoryItem) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
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
            {t("inventory.boxedInventory")}
          </h1>
          <p className="text-gray-500">{t("inventory.boxedInventoryDesc")}</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> {t("inventory.addBoxStock")}
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
                  placeholder={`${t("common.search")} ${t("fields.sku")} ${t("common.or")} ${t("fields.productName")}...`}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("fields.category")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("common.all")} {t("fields.category")}
                  </SelectItem>
                  <SelectItem value="boys-shoes">Boys Shoes</SelectItem>
                  <SelectItem value="girls-shoes">Girls Shoes</SelectItem>
                  <SelectItem value="boys-sandals">Boys Sandals</SelectItem>
                  <SelectItem value="girls-sandals">Girls Sandals</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("fields.status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("common.all")} {t("fields.status")}
                  </SelectItem>
                  <SelectItem value="in-stock">
                    {t("status.inStock")}
                  </SelectItem>
                  <SelectItem value="low-stock">
                    {t("status.lowStock")}
                  </SelectItem>
                  <SelectItem value="out-of-stock">
                    {t("status.outOfStock")}
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
                  <TableHead>{t("fields.sku")}</TableHead>
                  <TableHead>{t("fields.productName")}</TableHead>
                  <TableHead>{t("fields.category")}</TableHead>
                  <TableHead className="text-right">
                    {t("fields.boxQuantity")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("fields.pairsPerBox")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("fields.totalPairs")}
                  </TableHead>
                  <TableHead>{t("fields.lastUpdated")}</TableHead>
                  <TableHead>{t("fields.status")}</TableHead>
                  <TableHead className="text-right">
                    {t("common.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockInventoryData.map((item) => (
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
                    <TableCell>{item.lastUpdated}</TableCell>
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditItem(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteItem(item)}
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
              {t("common.showing")} 1-5 {t("common.of")} 5 {t("common.items")}
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
            <DialogTitle>{t("inventory.addBoxStock")}</DialogTitle>
            <DialogDescription>
              {t("dialogs.addBoxStockDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">{t("fields.sku")}</Label>
                <Input id="sku" placeholder={t("placeholders.enterSku")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productName">{t("fields.productName")}</Label>
                <Input
                  id="productName"
                  placeholder={t("placeholders.enterProductName")}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">{t("fields.category")}</Label>
                <Select>
                  <SelectTrigger id="category">
                    <SelectValue
                      placeholder={t("placeholders.selectCategory")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boys-shoes">Boys Shoes</SelectItem>
                    <SelectItem value="girls-shoes">Girls Shoes</SelectItem>
                    <SelectItem value="boys-sandals">Boys Sandals</SelectItem>
                    <SelectItem value="girls-sandals">Girls Sandals</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="boxQuantity">{t("fields.boxQuantity")}</Label>
                <Input id="boxQuantity" type="number" min="0" placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pairsPerBox">{t("fields.pairsPerBox")}</Label>
                <Input id="pairsPerBox" type="number" min="1" placeholder="1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receivedDate">{t("fields.incomingDate")}</Label>
                <Input id="receivedDate" type="date" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">
                {t("fields.notes")} ({t("common.optional")})
              </Label>
              <Input
                id="notes"
                placeholder={t("placeholders.additionalInfo")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit">{t("inventory.addBoxStock")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Box Stock Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t("dialogs.editBoxStock")}</DialogTitle>
            <DialogDescription>
              {t("dialogs.editBoxStockDesc")}
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-sku">{t("fields.sku")}</Label>
                  <Input id="edit-sku" defaultValue={selectedItem.sku} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-productName">
                    {t("fields.productName")}
                  </Label>
                  <Input
                    id="edit-productName"
                    defaultValue={selectedItem.productName}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category">{t("fields.category")}</Label>
                  <Select defaultValue={selectedItem.category.toLowerCase()}>
                    <SelectTrigger id="edit-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="boys-shoes">Boys Shoes</SelectItem>
                      <SelectItem value="girls-shoes">Girls Shoes</SelectItem>
                      <SelectItem value="boys-sandals">Boys Sandals</SelectItem>
                      <SelectItem value="girls-sandals">
                        Girls Sandals
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-boxQuantity">
                    {t("fields.boxQuantity")}
                  </Label>
                  <Input
                    id="edit-boxQuantity"
                    type="number"
                    min="0"
                    defaultValue={selectedItem.boxQuantity}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-pairsPerBox">
                    {t("fields.pairsPerBox")}
                  </Label>
                  <Input
                    id="edit-pairsPerBox"
                    type="number"
                    min="1"
                    defaultValue={selectedItem.pairsPerBox}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lastUpdated">
                    {t("fields.lastUpdated")}
                  </Label>
                  <Input
                    id="edit-lastUpdated"
                    type="date"
                    defaultValue={selectedItem.lastUpdated}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit">{t("common.saveChanges")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Box Stock Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t("dialogs.boxStockDetails")}</DialogTitle>
            <DialogDescription>
              {t("dialogs.boxStockDetailsDesc")}
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {t("fields.sku")}
                  </h3>
                  <p className="mt-1">{selectedItem.sku}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {t("fields.productName")}
                  </h3>
                  <p className="mt-1">{selectedItem.productName}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {t("fields.category")}
                  </h3>
                  <p className="mt-1">{selectedItem.category}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {t("fields.status")}
                  </h3>
                  <div className="mt-1">
                    {getStatusBadge(selectedItem.status)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {t("fields.boxQuantity")}
                  </h3>
                  <p className="mt-1">{selectedItem.boxQuantity}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {t("fields.pairsPerBox")}
                  </h3>
                  <p className="mt-1">{selectedItem.pairsPerBox}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {t("fields.totalPairs")}
                  </h3>
                  <p className="mt-1">{selectedItem.totalPairs}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  {t("fields.lastUpdated")}
                </h3>
                <p className="mt-1">{selectedItem.lastUpdated}</p>
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
            <DialogTitle>{t("dialogs.confirmDeletion")}</DialogTitle>
            <DialogDescription>
              {t("dialogs.deleteBoxStockConfirmation")}
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="py-4">
              <p className="text-sm">
                <span className="font-medium">{t("fields.sku")}:</span>{" "}
                {selectedItem.sku}
              </p>
              <p className="text-sm">
                <span className="font-medium">{t("fields.productName")}:</span>{" "}
                {selectedItem.productName}
              </p>
              <p className="text-sm">
                <span className="font-medium">{t("fields.boxQuantity")}:</span>{" "}
                {selectedItem.boxQuantity}
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
            <Button variant="destructive">{t("common.delete")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BoxedInventory;
