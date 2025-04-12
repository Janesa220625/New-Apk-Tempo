import React, { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  RefreshCw,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  size: string;
  color: string;
  category: string;
  location: string;
  manufactureDate: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

const mockInventoryData: InventoryItem[] = [
  {
    id: "1",
    sku: "SH-001-BLK-42",
    name: "Running Shoes Pro",
    size: "42",
    color: "Black",
    category: "Sports",
    location: "Warehouse A",
    manufactureDate: "2023-05-15",
    status: "In Stock",
  },
  {
    id: "2",
    sku: "SH-001-RED-40",
    name: "Running Shoes Pro",
    size: "40",
    color: "Red",
    category: "Sports",
    location: "Warehouse A",
    manufactureDate: "2023-05-15",
    status: "Low Stock",
  },
  {
    id: "3",
    sku: "SH-002-WHT-38",
    name: "Casual Sneakers",
    size: "38",
    color: "White",
    category: "Casual",
    location: "Warehouse B",
    manufactureDate: "2023-06-20",
    status: "In Stock",
  },
  {
    id: "4",
    sku: "SH-003-BRN-44",
    name: "Leather Boots",
    size: "44",
    color: "Brown",
    category: "Formal",
    location: "Warehouse C",
    manufactureDate: "2023-04-10",
    status: "Out of Stock",
  },
  {
    id: "5",
    sku: "SH-004-BLU-41",
    name: "Canvas Shoes",
    size: "41",
    color: "Blue",
    category: "Casual",
    location: "Warehouse A",
    manufactureDate: "2023-07-05",
    status: "In Stock",
  },
];

const IndividualInventory = () => {
  const [inventoryData, setInventoryData] =
    useState<InventoryItem[]>(mockInventoryData);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredData = inventoryData.filter(
    (item) =>
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelectItem = (id: string) => {
    setSelectedItems((prev) => {
      if (prev.includes(id)) {
        return prev.filter((itemId) => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredData.map((item) => item.id));
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setCurrentItem(item);
    setEditDialogOpen(true);
  };

  const handleDelete = (ids: string[]) => {
    setInventoryData((prev) => prev.filter((item) => !ids.includes(item.id)));
    setSelectedItems([]);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "In Stock":
        return "bg-green-100 text-green-800";
      case "Low Stock":
        return "bg-yellow-100 text-yellow-800";
      case "Out of Stock":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            Individual Inventory Management
          </h1>
          <p className="text-gray-500">
            Manage individual pair inventory with size and color variants
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Pair
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Inventory Item</DialogTitle>
                <DialogDescription>
                  Add a new individual pair to the inventory system.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <label htmlFor="sku">SKU</label>
                    <Input id="sku" placeholder="Enter SKU" />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label htmlFor="name">Product Name</label>
                    <Input id="name" placeholder="Enter product name" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <label htmlFor="size">Size</label>
                    <Input id="size" placeholder="Enter size" />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label htmlFor="color">Color</label>
                    <Input id="color" placeholder="Enter color" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <label htmlFor="category">Category</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label htmlFor="location">Location</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="warehouseA">Warehouse A</SelectItem>
                        <SelectItem value="warehouseB">Warehouse B</SelectItem>
                        <SelectItem value="warehouseC">Warehouse C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="manufactureDate">Manufacture Date</label>
                  <Input id="manufactureDate" type="date" />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setAddDialogOpen(false)}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="matrix">Size/Color Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="relative w-72">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by SKU or name"
                    className="pl-8"
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  {selectedItems.length > 0 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(selectedItems)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            selectedItems.length === filteredData.length &&
                            filteredData.length > 0
                          }
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Manufacture Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.length > 0 ? (
                      filteredData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedItems.includes(item.id)}
                              onCheckedChange={() => handleSelectItem(item.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.sku}
                          </TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.size}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{
                                  backgroundColor: item.color.toLowerCase(),
                                }}
                              ></div>
                              {item.color}
                            </div>
                          </TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.location}</TableCell>
                          <TableCell>{item.manufactureDate}</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeColor(item.status)}>
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete([item.id])}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-4">
                          No inventory items found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-gray-500">
                Showing {filteredData.length} of {inventoryData.length} items
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="matrix" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Size/Color Matrix View</CardTitle>
              <CardDescription>
                View inventory distribution by size and color
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-4">Running Shoes Pro</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Size / Color
                          </th>
                          <th className="px-4 py-2 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Black
                          </th>
                          <th className="px-4 py-2 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Red
                          </th>
                          <th className="px-4 py-2 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            White
                          </th>
                          <th className="px-4 py-2 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Blue
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                            38
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                            5
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                            3
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                            0
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                            2
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                            40
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                            8
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                            2
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                            4
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                            6
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                            42
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                            12
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                            0
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                            7
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                            3
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                            44
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                            6
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                            1
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                            2
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                            0
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-4">Casual Sneakers</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Size / Color
                          </th>
                          <th className="px-4 py-2 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            White
                          </th>
                          <th className="px-4 py-2 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Blue
                          </th>
                          <th className="px-4 py-2 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Gray
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                            38
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                            10
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                            4
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                            2
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                            40
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                            8
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                            6
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                            3
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                            42
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                            5
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                            2
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                            0
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <DialogDescription>
              Update the details of the selected inventory item.
            </DialogDescription>
          </DialogHeader>
          {currentItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="edit-sku">SKU</label>
                  <Input id="edit-sku" defaultValue={currentItem.sku} />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="edit-name">Product Name</label>
                  <Input id="edit-name" defaultValue={currentItem.name} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="edit-size">Size</label>
                  <Input id="edit-size" defaultValue={currentItem.size} />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="edit-color">Color</label>
                  <Input id="edit-color" defaultValue={currentItem.color} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="edit-category">Category</label>
                  <Select defaultValue={currentItem.category.toLowerCase()}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="edit-location">Location</label>
                  <Select
                    defaultValue={currentItem.location
                      .replace(" ", "")
                      .toLowerCase()}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="warehousea">Warehouse A</SelectItem>
                      <SelectItem value="warehouseb">Warehouse B</SelectItem>
                      <SelectItem value="warehousec">Warehouse C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-col space-y-1.5">
                <label htmlFor="edit-manufactureDate">Manufacture Date</label>
                <Input
                  id="edit-manufactureDate"
                  type="date"
                  defaultValue={currentItem.manufactureDate}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <label htmlFor="edit-status">Status</label>
                <Select
                  defaultValue={currentItem.status
                    .toLowerCase()
                    .replace(" ", "")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instock">In Stock</SelectItem>
                    <SelectItem value="lowstock">Low Stock</SelectItem>
                    <SelectItem value="outofstock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setEditDialogOpen(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IndividualInventory;
