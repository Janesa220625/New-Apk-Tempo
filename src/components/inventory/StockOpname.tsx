import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ClipboardList,
  Search,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ArrowRight,
  Plus,
} from "lucide-react";

interface StockItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  systemCount: number;
  physicalCount: number | null;
  discrepancy: number | null;
  status: "pending" | "counted" | "reconciled";
}

const StockOpname: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockOpnameItems, setStockOpnameItems] = useState<StockItem[]>([
    {
      id: "1",
      sku: "SH-001-BLK",
      name: "Running Shoes Black",
      category: "Shoes",
      systemCount: 24,
      physicalCount: null,
      discrepancy: null,
      status: "pending",
    },
    {
      id: "2",
      sku: "SH-002-WHT",
      name: "Tennis Shoes White",
      category: "Shoes",
      systemCount: 16,
      physicalCount: 14,
      discrepancy: -2,
      status: "counted",
    },
    {
      id: "3",
      sku: "SD-001-BRN",
      name: "Leather Sandals Brown",
      category: "Sandals",
      systemCount: 32,
      physicalCount: 32,
      discrepancy: 0,
      status: "reconciled",
    },
    {
      id: "4",
      sku: "SH-003-RED",
      name: "Casual Shoes Red",
      category: "Shoes",
      systemCount: 12,
      physicalCount: 15,
      discrepancy: 3,
      status: "counted",
    },
    {
      id: "5",
      sku: "SD-002-BLK",
      name: "Beach Sandals Black",
      category: "Sandals",
      systemCount: 20,
      physicalCount: null,
      discrepancy: null,
      status: "pending",
    },
  ]);

  const [currentStockOpname, setCurrentStockOpname] = useState({
    id: "SO-2023-06-15",
    date: "2023-06-15",
    status: "in-progress",
    progress: 60,
    totalItems: 5,
    countedItems: 3,
    discrepancies: 2,
  });

  const filteredItems = stockOpnameItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUpdateCount = (id: string, count: number) => {
    setStockOpnameItems((items) =>
      items.map((item) => {
        if (item.id === id) {
          const discrepancy = count - item.systemCount;
          return {
            ...item,
            physicalCount: count,
            discrepancy,
            status: "counted",
          };
        }
        return item;
      }),
    );
  };

  const handleReconcileItem = (id: string) => {
    setStockOpnameItems((items) =>
      items.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status: "reconciled",
          };
        }
        return item;
      }),
    );
  };

  const handleInitiateNewCount = () => {
    // This would typically involve API calls to create a new stock opname session
    alert("New stock opname initiated!");
  };

  const handleFinalizeStockOpname = () => {
    // This would typically involve API calls to finalize the stock opname and apply adjustments
    alert("Stock opname finalized and inventory adjusted!");
  };

  return (
    <div className="bg-background p-6 rounded-lg w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Stock Opname</h1>
          <p className="text-muted-foreground">
            Physical inventory reconciliation
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Stock Opname
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Initiate New Stock Opname</AlertDialogTitle>
              <AlertDialogDescription>
                This will create a new stock opname session. Any ongoing session
                will need to be finalized first.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleInitiateNewCount}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="overview">
            <ClipboardList className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="count">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Count Items
          </TabsTrigger>
          <TabsTrigger value="reconcile">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reconcile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Current Stock Opname</CardTitle>
                <CardDescription>
                  Session {currentStockOpname.id}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge
                    variant={
                      currentStockOpname.status === "in-progress"
                        ? "default"
                        : "outline"
                    }
                  >
                    {currentStockOpname.status === "in-progress"
                      ? "In Progress"
                      : "Completed"}
                  </Badge>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Date:</span>
                  <span>{currentStockOpname.date}</span>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Progress</span>
                    <span className="text-sm">
                      {currentStockOpname.progress}%
                    </span>
                  </div>
                  <Progress
                    value={currentStockOpname.progress}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Count Summary</CardTitle>
                <CardDescription>Item counting progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      {currentStockOpname.countedItems}
                    </div>
                    <div className="text-sm text-muted-foreground">Counted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      {currentStockOpname.totalItems -
                        currentStockOpname.countedItems}
                    </div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {currentStockOpname.totalItems}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Items
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Discrepancies</CardTitle>
                <CardDescription>Items with count differences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-500">
                      {currentStockOpname.discrepancies}
                    </div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-500">
                      {
                        stockOpnameItems.filter(
                          (i) => i.discrepancy && i.discrepancy > 0,
                        ).length
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">Surplus</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-500">
                      {
                        stockOpnameItems.filter(
                          (i) => i.discrepancy && i.discrepancy < 0,
                        ).length
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Shortage
                    </div>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("reconcile")}
                  >
                    View Discrepancies
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Stock Opname History</CardTitle>
              <CardDescription>
                Previous inventory reconciliation sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Discrepancies</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>SO-2023-05-15</TableCell>
                    <TableCell>May 15, 2023</TableCell>
                    <TableCell>120</TableCell>
                    <TableCell>5</TableCell>
                    <TableCell>
                      <Badge variant="outline">Completed</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>SO-2023-04-15</TableCell>
                    <TableCell>April 15, 2023</TableCell>
                    <TableCell>118</TableCell>
                    <TableCell>8</TableCell>
                    <TableCell>
                      <Badge variant="outline">Completed</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>SO-2023-03-15</TableCell>
                    <TableCell>March 15, 2023</TableCell>
                    <TableCell>105</TableCell>
                    <TableCell>12</TableCell>
                    <TableCell>
                      <Badge variant="outline">Completed</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="count" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Count Inventory Items</CardTitle>
              <CardDescription>
                Record physical counts for inventory items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search by SKU or name..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Shoes">Shoes</SelectItem>
                    <SelectItem value="Sandals">Sandals</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">System Count</TableHead>
                    <TableHead className="text-right">Physical Count</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono">{item.sku}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className="text-right">
                        {item.systemCount}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.status === "pending" ? (
                          <span className="text-muted-foreground">
                            Not counted
                          </span>
                        ) : (
                          item.physicalCount
                        )}
                      </TableCell>
                      <TableCell>
                        {item.status === "pending" && (
                          <Badge variant="outline">Pending</Badge>
                        )}
                        {item.status === "counted" && (
                          <Badge>
                            {item.discrepancy === 0 ? "Matched" : "Discrepancy"}
                          </Badge>
                        )}
                        {item.status === "reconciled" && (
                          <Badge variant="secondary">Reconciled</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              {item.status === "pending" ? "Count" : "Update"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Record Physical Count</DialogTitle>
                              <DialogDescription>
                                Enter the actual count for {item.name} (
                                {item.sku})
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label className="text-right">SKU:</label>
                                <div className="col-span-3 font-mono">
                                  {item.sku}
                                </div>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label className="text-right">
                                  System Count:
                                </label>
                                <div className="col-span-3">
                                  {item.systemCount}
                                </div>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label
                                  htmlFor="physical-count"
                                  className="text-right"
                                >
                                  Physical Count:
                                </label>
                                <Input
                                  id="physical-count"
                                  type="number"
                                  className="col-span-3"
                                  defaultValue={item.physicalCount || ""}
                                  min={0}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                type="submit"
                                onClick={() => {
                                  const input = document.getElementById(
                                    "physical-count",
                                  ) as HTMLInputElement;
                                  const count = parseInt(input.value);
                                  if (!isNaN(count) && count >= 0) {
                                    handleUpdateCount(item.id, count);
                                  }
                                }}
                              >
                                Save Count
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {filteredItems.length} of {stockOpnameItems.length}{" "}
                items
              </div>
              <Button
                variant="outline"
                onClick={() => setActiveTab("reconcile")}
              >
                Proceed to Reconciliation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="reconcile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reconcile Inventory Discrepancies</CardTitle>
              <CardDescription>
                Review and resolve count discrepancies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">System Count</TableHead>
                    <TableHead className="text-right">Physical Count</TableHead>
                    <TableHead className="text-right">Discrepancy</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockOpnameItems
                    .filter(
                      (item) =>
                        item.status === "counted" ||
                        item.status === "reconciled",
                    )
                    .map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono">{item.sku}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-right">
                          {item.systemCount}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.physicalCount}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.discrepancy !== null && (
                            <span
                              className={`font-medium ${item.discrepancy > 0 ? "text-amber-500" : item.discrepancy < 0 ? "text-blue-500" : "text-green-500"}`}
                            >
                              {item.discrepancy > 0 ? "+" : ""}
                              {item.discrepancy}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.status === "counted" &&
                            item.discrepancy !== 0 && (
                              <Badge variant="destructive">
                                <AlertTriangle className="mr-1 h-3 w-3" />
                                Unresolved
                              </Badge>
                            )}
                          {item.status === "counted" &&
                            item.discrepancy === 0 && (
                              <Badge
                                variant="outline"
                                className="text-green-500 border-green-500"
                              >
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Matched
                              </Badge>
                            )}
                          {item.status === "reconciled" && (
                            <Badge variant="secondary">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Reconciled
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.status === "counted" &&
                            item.discrepancy !== 0 && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    Reconcile
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>
                                      Reconcile Inventory Discrepancy
                                    </DialogTitle>
                                    <DialogDescription>
                                      Resolve the discrepancy for {item.name} (
                                      {item.sku})
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <label className="text-right">
                                        System Count:
                                      </label>
                                      <div className="col-span-3">
                                        {item.systemCount}
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <label className="text-right">
                                        Physical Count:
                                      </label>
                                      <div className="col-span-3">
                                        {item.physicalCount}
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <label className="text-right">
                                        Discrepancy:
                                      </label>
                                      <div className="col-span-3 font-medium">
                                        <span
                                          className={
                                            item.discrepancy &&
                                            item.discrepancy > 0
                                              ? "text-amber-500"
                                              : "text-blue-500"
                                          }
                                        >
                                          {item.discrepancy &&
                                          item.discrepancy > 0
                                            ? "+"
                                            : ""}
                                          {item.discrepancy}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <label className="text-right">
                                        Resolution:
                                      </label>
                                      <Select defaultValue="adjust">
                                        <SelectTrigger className="col-span-3">
                                          <SelectValue placeholder="Select resolution" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="adjust">
                                            Adjust System Inventory
                                          </SelectItem>
                                          <SelectItem value="recount">
                                            Request Recount
                                          </SelectItem>
                                          <SelectItem value="investigate">
                                            Investigate Discrepancy
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <label
                                        htmlFor="notes"
                                        className="text-right"
                                      >
                                        Notes:
                                      </label>
                                      <Input
                                        id="notes"
                                        className="col-span-3"
                                        placeholder="Add notes about this reconciliation"
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      onClick={() =>
                                        handleReconcileItem(item.id)
                                      }
                                    >
                                      Confirm Reconciliation
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            )}
                          {(item.status === "reconciled" ||
                            (item.status === "counted" &&
                              item.discrepancy === 0)) && (
                            <Button variant="ghost" size="sm" disabled>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Resolved
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("count")}>
                Back to Counting
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button>Finalize Stock Opname</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Finalize Stock Opname</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will apply all reconciled discrepancies to the
                      inventory system. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleFinalizeStockOpname}>
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StockOpname;
