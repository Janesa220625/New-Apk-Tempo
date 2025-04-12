import React, { useState, useEffect } from "react";
import { getUserSettings, updateUserSettings } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Bell,
  Building,
  Check,
  Database,
  Globe,
  Mail,
  Save,
  Settings as SettingsIcon,
  Shield,
  Truck,
  Users,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [dateFormat, setDateFormat] = useState("dd-mm-yyyy");
  const [timezone, setTimezone] = useState("UTC+0");
  const [companyName, setCompanyName] = useState("Footwear Warehouse Inc.");

  // Temporary user ID for demo purposes
  // In a real app, this would come from authentication
  const userId = "00000000-0000-0000-0000-000000000000";

  // Load settings from Supabase on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const { success, data } = await getUserSettings(userId);

        if (success && data) {
          setDarkMode(data.dark_mode);
          setDateFormat(data.date_format);
          setTimezone(data.timezone);
          setCompanyName(data.company_name);
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [userId]);

  // Apply settings effects
  useEffect(() => {
    // Set document title based on company name
    document.title = companyName + " - Footwear IMS";

    // Apply dark mode when it changes
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode, companyName]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);
    setSaveError(null);

    // Get form data and update state
    const formData = new FormData(e.target as HTMLFormElement);
    const newDarkMode = (
      document.getElementById("dark-mode") as HTMLInputElement
    ).checked;
    const newDateFormat = (formData.get("date-format") as string) || dateFormat;
    const newTimezone = (formData.get("timezone") as string) || timezone;
    const newCompanyName =
      (formData.get("company-name") as string) || companyName;

    try {
      // Save settings to Supabase
      const { success, message } = await updateUserSettings(userId, {
        dark_mode: newDarkMode,
        date_format: newDateFormat,
        timezone: newTimezone,
        company_name: newCompanyName,
      });

      if (success) {
        // Update state with new values
        setDarkMode(newDarkMode);
        setDateFormat(newDateFormat);
        setTimezone(newTimezone);
        setCompanyName(newCompanyName);

        // Show success message
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);

        // Apply changes immediately
        document.title = newCompanyName + " - Footwear IMS";
      } else {
        setSaveError(message);
        setTimeout(() => setSaveError(null), 3000);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveError("An unexpected error occurred while saving settings.");
      setTimeout(() => setSaveError(null), 3000);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">System Settings</h1>
        <p className="text-gray-500">
          Configure application settings and preferences
        </p>
      </div>

      {loading ? (
        <div className="mb-6 p-4 border rounded-md bg-gray-50">
          <p className="text-gray-500">Loading settings...</p>
        </div>
      ) : (
        <>
          {saveSuccess && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-500" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Your settings have been saved successfully.
              </AlertDescription>
            </Alert>
          )}

          {saveError && (
            <Alert
              className="mb-6 bg-red-50 border-red-200"
              variant="destructive"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{saveError}</AlertDescription>
            </Alert>
          )}
        </>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full mb-6">
          <TabsTrigger value="general">
            <SettingsIcon className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="warehouse">
            <Building className="mr-2 h-4 w-4" />
            Warehouse
          </TabsTrigger>
          <TabsTrigger value="inventory">
            <Database className="mr-2 h-4 w-4" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <form onSubmit={handleSaveSettings}>
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure basic application settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input
                      id="company-name"
                      name="company-name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        value={timezone}
                        onValueChange={setTimezone}
                        name="timezone"
                      >
                        <SelectTrigger id="timezone">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC-8">
                            Pacific Time (UTC-8)
                          </SelectItem>
                          <SelectItem value="UTC-5">
                            Eastern Time (UTC-5)
                          </SelectItem>
                          <SelectItem value="UTC+0">UTC</SelectItem>
                          <SelectItem value="UTC+1">
                            Central European Time (UTC+1)
                          </SelectItem>
                          <SelectItem value="UTC+8">
                            China Standard Time (UTC+8)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date-format">Date Format</Label>
                      <Select
                        value={dateFormat}
                        onValueChange={setDateFormat}
                        name="date-format"
                      >
                        <SelectTrigger id="date-format">
                          <SelectValue placeholder="Select date format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mm-dd-yyyy">MM-DD-YYYY</SelectItem>
                          <SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem>
                          <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <div className="flex items-center gap-4">
                      <LanguageSwitcher />
                      <p className="text-sm text-muted-foreground">
                        Select your preferred language for the application
                        interface
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="dark-mode">Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable dark mode for the application interface
                      </p>
                    </div>
                    <Switch
                      id="dark-mode"
                      checked={darkMode}
                      onCheckedChange={setDarkMode}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="warehouse">
          <form onSubmit={handleSaveSettings}>
            <Card>
              <CardHeader>
                <CardTitle>Warehouse Settings</CardTitle>
                <CardDescription>
                  Configure warehouse and location settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="warehouse-name">
                      Primary Warehouse Name
                    </Label>
                    <Input
                      id="warehouse-name"
                      defaultValue="Main Distribution Center"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="warehouse-code">Warehouse Code</Label>
                      <Input id="warehouse-code" defaultValue="WH-001" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="warehouse-type">Warehouse Type</Label>
                      <Select defaultValue="distribution">
                        <SelectTrigger id="warehouse-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="distribution">
                            Distribution Center
                          </SelectItem>
                          <SelectItem value="retail">
                            Retail Warehouse
                          </SelectItem>
                          <SelectItem value="manufacturing">
                            Manufacturing Facility
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="warehouse-address">Warehouse Address</Label>
                    <Input
                      id="warehouse-address"
                      defaultValue="123 Logistics Way, Warehouse District"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="warehouse-city">City</Label>
                      <Input id="warehouse-city" defaultValue="Metropolis" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="warehouse-state">State/Province</Label>
                      <Input id="warehouse-state" defaultValue="State" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="warehouse-zip">Postal Code</Label>
                      <Input id="warehouse-zip" defaultValue="12345" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="warehouse-country">Country</Label>
                    <Select defaultValue="us">
                      <SelectTrigger id="warehouse-country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="au">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="multi-warehouse">
                        Multi-Warehouse Mode
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Enable management of multiple warehouses
                      </p>
                    </div>
                    <Switch id="multi-warehouse" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="inventory">
          <form onSubmit={handleSaveSettings}>
            <Card>
              <CardHeader>
                <CardTitle>Inventory Settings</CardTitle>
                <CardDescription>
                  Configure inventory management preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="low-stock-threshold">
                        Low Stock Threshold (%)
                      </Label>
                      <Input
                        id="low-stock-threshold"
                        type="number"
                        defaultValue="15"
                        min="1"
                        max="50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stock-opname-frequency">
                        Stock Opname Frequency
                      </Label>
                      <Select defaultValue="monthly">
                        <SelectTrigger id="stock-opname-frequency">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="default-box-contents">
                      Default Box Contents (pairs)
                    </Label>
                    <Input
                      id="default-box-contents"
                      type="number"
                      defaultValue="12"
                      min="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inventory-valuation">
                      Inventory Valuation Method
                    </Label>
                    <Select defaultValue="fifo">
                      <SelectTrigger id="inventory-valuation">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fifo">
                          FIFO (First In, First Out)
                        </SelectItem>
                        <SelectItem value="lifo">
                          LIFO (Last In, First Out)
                        </SelectItem>
                        <SelectItem value="avg">Average Cost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-reorder">Auto Reorder</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically create purchase orders for low stock items
                      </p>
                    </div>
                    <Switch id="auto-reorder" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="track-serial">Track Serial Numbers</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable tracking of individual item serial numbers
                      </p>
                    </div>
                    <Switch id="track-serial" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="barcode-scanning">Barcode Scanning</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable barcode scanning for inventory operations
                      </p>
                    </div>
                    <Switch id="barcode-scanning" defaultChecked />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="notifications">
          <form onSubmit={handleSaveSettings}>
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure alerts and notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notification-email">
                      Notification Email
                    </Label>
                    <Input
                      id="notification-email"
                      type="email"
                      defaultValue="alerts@warehouse.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email Notifications</Label>
                    <div className="space-y-2 border rounded-md p-4">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="notify-low-stock"
                          className="cursor-pointer"
                        >
                          Low Stock Alerts
                        </Label>
                        <Switch id="notify-low-stock" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="notify-incoming"
                          className="cursor-pointer"
                        >
                          Incoming Shipments
                        </Label>
                        <Switch id="notify-incoming" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="notify-outgoing"
                          className="cursor-pointer"
                        >
                          Outgoing Shipments
                        </Label>
                        <Switch id="notify-outgoing" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="notify-discrepancy"
                          className="cursor-pointer"
                        >
                          Inventory Discrepancies
                        </Label>
                        <Switch id="notify-discrepancy" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notify-user" className="cursor-pointer">
                          User Account Changes
                        </Label>
                        <Switch id="notify-user" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>In-App Notifications</Label>
                    <div className="space-y-2 border rounded-md p-4">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="app-notify-low-stock"
                          className="cursor-pointer"
                        >
                          Low Stock Alerts
                        </Label>
                        <Switch id="app-notify-low-stock" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="app-notify-incoming"
                          className="cursor-pointer"
                        >
                          Incoming Shipments
                        </Label>
                        <Switch id="app-notify-incoming" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="app-notify-outgoing"
                          className="cursor-pointer"
                        >
                          Outgoing Shipments
                        </Label>
                        <Switch id="app-notify-outgoing" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="app-notify-discrepancy"
                          className="cursor-pointer"
                        >
                          Inventory Discrepancies
                        </Label>
                        <Switch id="app-notify-discrepancy" defaultChecked />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notification-frequency">
                      Digest Frequency
                    </Label>
                    <Select defaultValue="daily">
                      <SelectTrigger id="notification-frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">Real-time</SelectItem>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="security">
          <form onSubmit={handleSaveSettings}>
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure security and access control settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password-policy">Password Policy</Label>
                    <Select defaultValue="strong">
                      <SelectTrigger id="password-policy">
                        <SelectValue placeholder="Select policy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">
                          Basic (8+ characters)
                        </SelectItem>
                        <SelectItem value="medium">
                          Medium (8+ chars, mixed case)
                        </SelectItem>
                        <SelectItem value="strong">
                          Strong (8+ chars, mixed case, numbers, symbols)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">
                      Session Timeout (minutes)
                    </Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      defaultValue="30"
                      min="5"
                      max="240"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="two-factor">
                        Two-Factor Authentication
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Require 2FA for all admin and manager accounts
                      </p>
                    </div>
                    <Switch id="two-factor" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="ip-restriction">IP Restriction</Label>
                      <p className="text-sm text-muted-foreground">
                        Limit access to specific IP addresses
                      </p>
                    </div>
                    <Switch id="ip-restriction" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="audit-logging">Audit Logging</Label>
                      <p className="text-sm text-muted-foreground">
                        Log all user actions for audit purposes
                      </p>
                    </div>
                    <Switch id="audit-logging" defaultChecked />
                  </div>

                  <div className="pt-4">
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Security Notice</AlertTitle>
                      <AlertDescription>
                        Changing security settings may require users to log in
                        again. Make sure to communicate changes to your team.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
