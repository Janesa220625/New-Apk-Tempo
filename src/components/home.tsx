import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell,
  Box,
  ChevronDown,
  Home,
  Package,
  Search,
  Settings as SettingsIcon,
  ShoppingBag,
  Users,
  Clipboard,
  PackageOpen,
  Database,
} from "lucide-react";
import InventoryOverview from "./inventory/InventoryOverview";
import BoxedInventory from "./inventory/BoxedInventory";
import IndividualInventory from "./inventory/IndividualInventory";
import StockOpname from "./inventory/StockOpname";
import ProductMaster from "./product/ProductMaster";
import IncomingBoxStockComponent from "./inventory/IncomingBoxStock";
import UserManagement from "./admin/UserManagement";
import Settings from "./admin/Settings";

const HomePage = () => {
  const [activeTab, setActiveTab] = React.useState("overview");

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <Box className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Footwear IMS</h1>
        </div>

        <nav className="space-y-1 flex-1">
          <Button
            variant={activeTab === "overview" ? "default" : "ghost"}
            className="w-full justify-start gap-2"
            onClick={() => setActiveTab("overview")}
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Button>
          <Button
            variant={activeTab === "products" ? "default" : "ghost"}
            className="w-full justify-start gap-2"
            onClick={() => setActiveTab("products")}
          >
            <Clipboard className="h-4 w-4" />
            Product Master
          </Button>
          <Button
            variant={activeTab === "incoming" ? "default" : "ghost"}
            className="w-full justify-start gap-2"
            onClick={() => setActiveTab("incoming")}
          >
            <PackageOpen className="h-4 w-4" />
            Incoming Box Stock
          </Button>
          <Button
            variant={activeTab === "boxed" ? "default" : "ghost"}
            className="w-full justify-start gap-2"
            onClick={() => setActiveTab("boxed")}
          >
            <Package className="h-4 w-4" />
            Boxed Inventory
          </Button>
          <Button
            variant={activeTab === "individual" ? "default" : "ghost"}
            className="w-full justify-start gap-2"
            onClick={() => setActiveTab("individual")}
          >
            <ShoppingBag className="h-4 w-4" />
            Individual Pairs
          </Button>
          <Button
            variant={activeTab === "stockopname" ? "default" : "ghost"}
            className="w-full justify-start gap-2"
            onClick={() => setActiveTab("stockopname")}
          >
            <Box className="h-4 w-4" />
            Stock Opname
          </Button>
          <Button
            variant={activeTab === "users" ? "default" : "ghost"}
            className="w-full justify-start gap-2"
            onClick={() => setActiveTab("users")}
          >
            <Users className="h-4 w-4" />
            User Management
          </Button>
          <Button
            variant={activeTab === "settings" ? "default" : "ghost"}
            className="w-full justify-start gap-2"
            onClick={() => setActiveTab("settings")}
          >
            <SettingsIcon className="h-4 w-4" />
            Settings
          </Button>
        </nav>

        <div className="mt-auto pt-4 border-t">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=warehouse" />
              <AvatarFallback>WA</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Warehouse Admin</p>
              <p className="text-xs text-muted-foreground">
                admin@warehouse.com
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b p-4 bg-card">
          <div className="flex items-center justify-between">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search inventory..."
                className="pl-8 h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="gap-1">
                Warehouse 1
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your footwear inventory across warehouses.
            </p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="products">Product Master</TabsTrigger>
              <TabsTrigger value="incoming">Incoming Box Stock</TabsTrigger>
              <TabsTrigger value="boxed">Boxed Inventory</TabsTrigger>
              <TabsTrigger value="individual">Individual Pairs</TabsTrigger>
              <TabsTrigger value="stockopname">Stock Opname</TabsTrigger>
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <InventoryOverview />
            </TabsContent>

            <TabsContent value="products">
              <ProductMaster />
            </TabsContent>

            <TabsContent value="incoming">
              <IncomingBoxStockComponent />
            </TabsContent>

            <TabsContent value="boxed">
              <BoxedInventory />
            </TabsContent>

            <TabsContent value="individual">
              <IndividualInventory />
            </TabsContent>

            <TabsContent value="stockopname">
              <StockOpname />
            </TabsContent>

            <TabsContent value="users">
              <UserManagement />
            </TabsContent>

            <TabsContent value="settings">
              <Settings />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default HomePage;
