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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { verifySupabaseSetup } from "@/utils/supabase-verification";
import { supabase } from "@/lib/supabase";

const SupabaseVerification = () => {
  const [verificationResults, setVerificationResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [testData, setTestData] = useState<{
    database?: any;
    auth?: any;
    storage?: any;
    realtime?: any;
    functions?: any;
  }>({});

  // Override console.log to capture logs
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  React.useEffect(() => {
    console.log = (...args) => {
      const message = args
        .map((arg) =>
          typeof arg === "object" ? JSON.stringify(arg, null, 2) : arg,
        )
        .join(" ");
      setLogs((prev) => [...prev, message]);
      originalConsoleLog(...args);
    };

    console.error = (...args) => {
      const message = args
        .map((arg) =>
          typeof arg === "object" ? JSON.stringify(arg, null, 2) : arg,
        )
        .join(" ");
      setLogs((prev) => [...prev, `ERROR: ${message}`]);
      originalConsoleError(...args);
    };

    console.warn = (...args) => {
      const message = args
        .map((arg) =>
          typeof arg === "object" ? JSON.stringify(arg, null, 2) : arg,
        )
        .join(" ");
      setLogs((prev) => [...prev, `WARNING: ${message}`]);
      originalConsoleWarn(...args);
    };

    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, []);

  const runVerification = async () => {
    setLoading(true);
    setLogs([]);
    setTestData({});

    try {
      // Run the comprehensive verification
      const results = await verifySupabaseSetup();
      setVerificationResults(results);

      // Update the test data with the detailed results
      if (results.results) {
        setTestData({
          database: results.results.database,
          auth: results.results.auth,
          storage: results.results.storage,
          realtime: results.results.realtime,
          functions: results.results.functions,
        });
      } else {
        // Run additional specific tests for the UI if detailed results aren't available
        await runSpecificTests();
      }
    } catch (error) {
      console.error("Verification failed:", error);
      setVerificationResults({ success: false, error });
    } finally {
      setLoading(false);
    }
  };

  const runSpecificTests = async () => {
    // Database test
    try {
      const { data, error } = await supabase
        .from("products")
        .select("count()")
        .single();

      setTestData((prev) => ({
        ...prev,
        database: { success: !error, data, error },
      }));
    } catch (error) {
      setTestData((prev) => ({
        ...prev,
        database: { success: false, error },
      }));
    }

    // Auth test
    try {
      const { data, error } = await supabase.auth.getSession();
      setTestData((prev) => ({
        ...prev,
        auth: { success: !error, data, error },
      }));
    } catch (error) {
      setTestData((prev) => ({
        ...prev,
        auth: { success: false, error },
      }));
    }

    // Storage test
    try {
      const { data, error } = await supabase.storage.listBuckets();
      setTestData((prev) => ({
        ...prev,
        storage: { success: !error, data, error },
      }));
    } catch (error) {
      setTestData((prev) => ({
        ...prev,
        storage: { success: false, error },
      }));
    }
  };

  const getStatusBadge = (status: boolean | undefined) => {
    if (status === undefined)
      return <Badge variant="outline">Not Tested</Badge>;
    return status ? (
      <Badge className="bg-green-500">Passed</Badge>
    ) : (
      <Badge variant="destructive">Failed</Badge>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">
            Supabase Project Verification
          </CardTitle>
          <CardDescription>
            Verify your Supabase project configuration and data for the
            Warehouse Inventory System
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold">Verification Status</h2>
              {verificationResults && (
                <div className="mt-2">
                  {verificationResults.success ? (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <AlertTitle>Verification Successful</AlertTitle>
                      <AlertDescription>
                        Your Supabase project is correctly configured.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertTitle>Verification Failed</AlertTitle>
                      <AlertDescription>
                        There were issues with your Supabase configuration.
                        Check the logs for details.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>
            <Button
              onClick={runVerification}
              disabled={loading}
              className="min-w-32"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Run Verification"
              )}
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="database">Database</TabsTrigger>
              <TabsTrigger value="auth">Authentication</TabsTrigger>
              <TabsTrigger value="storage">Storage</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Database</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span>Status:</span>
                      {getStatusBadge(testData.database?.success)}
                    </div>
                    {testData.database?.data && (
                      <p className="text-sm mt-2">
                        Products count: {testData.database.data.count}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Authentication</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span>Status:</span>
                      {getStatusBadge(testData.auth?.success)}
                    </div>
                    {testData.auth?.data?.session ? (
                      <p className="text-sm mt-2">
                        Logged in as: {testData.auth.data.session.user.email}
                      </p>
                    ) : (
                      <p className="text-sm mt-2 text-amber-600">
                        No active session
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Storage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span>Status:</span>
                      {getStatusBadge(testData.storage?.success)}
                    </div>
                    {testData.storage?.data && (
                      <p className="text-sm mt-2">
                        Buckets: {testData.storage.data.length}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Realtime</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span>Status:</span>
                      {verificationResults?.channel ? (
                        <Badge className="bg-green-500">Connected</Badge>
                      ) : (
                        <Badge variant="outline">Not Tested</Badge>
                      )}
                    </div>
                    <p className="text-sm mt-2">
                      {verificationResults?.channel
                        ? "Listening to product changes"
                        : "Run verification to test realtime"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Edge Functions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span>Status:</span>
                      <Badge variant="outline">Check Logs</Badge>
                    </div>
                    <p className="text-sm mt-2">
                      See logs tab for edge function test results
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="database" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Database Schema Verification</CardTitle>
                  <CardDescription>
                    Checking tables and data in your Supabase database
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Manual Verification Required</AlertTitle>
                      <AlertDescription>
                        For a complete database schema verification, please
                        check the Supabase dashboard Table Editor.
                      </AlertDescription>
                    </Alert>

                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Expected Tables:</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>products</li>
                        <li>incoming_box_stock</li>
                        <li>unit_stock</li>
                        <li>recipients</li>
                        <li>outgoing_stock</li>
                        <li>outgoing_stock_items</li>
                      </ul>
                    </div>

                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Sample SQL Queries:</h3>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                        {`-- Check products table
SELECT * FROM products LIMIT 10;

-- Check incoming_box_stock table
SELECT * FROM incoming_box_stock LIMIT 10;

-- Join products with inventory
SELECT p.name, p.sku, i.boxes_received, i.total_units 
FROM products p
JOIN incoming_box_stock i ON p.id = i.product_id
LIMIT 10;`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="auth" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Authentication Verification</CardTitle>
                  <CardDescription>
                    Checking authentication configuration and user management
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Manual Verification Required</AlertTitle>
                      <AlertDescription>
                        For complete authentication verification, please check
                        the Supabase dashboard Authentication section.
                      </AlertDescription>
                    </Alert>

                    <div className="mt-4">
                      <h3 className="font-medium mb-2">
                        Authentication Checklist:
                      </h3>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Email authentication is enabled</li>
                        <li>Email templates are configured</li>
                        <li>User roles and permissions are set up</li>
                        <li>Row-level security policies are configured</li>
                      </ul>
                    </div>

                    <div className="mt-4">
                      <h3 className="font-medium mb-2">
                        Test Authentication Code:
                      </h3>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                        {`// Test registration
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'password123'
});

// Test login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'password123'
});

// Get current user
const { data: { user } } = await supabase.auth.getUser();
console.log("Current user:", user);`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="storage" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Storage Verification</CardTitle>
                  <CardDescription>
                    Checking storage buckets and file management
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Manual Verification Required</AlertTitle>
                      <AlertDescription>
                        For complete storage verification, please check the
                        Supabase dashboard Storage section.
                      </AlertDescription>
                    </Alert>

                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Storage Checklist:</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Required buckets are created</li>
                        <li>Bucket permissions are configured correctly</li>
                        <li>File upload size limits are appropriate</li>
                      </ul>
                    </div>

                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Test Storage Code:</h3>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                        {`// List buckets
const { data, error } = await supabase.storage.listBuckets();

// List files in a bucket
const { data, error } = await supabase.storage
  .from('your-bucket-name')
  .list();

// Upload a file
const { data, error } = await supabase.storage
  .from('your-bucket-name')
  .upload('file-path.jpg', fileObject);

// Download a file
const { data, error } = await supabase.storage
  .from('your-bucket-name')
  .download('file-path.jpg');`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Verification Logs</CardTitle>
                  <CardDescription>
                    Detailed logs from the verification process
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] w-full rounded border p-4">
                    {logs.length > 0 ? (
                      <div className="space-y-2 font-mono text-sm">
                        {logs.map((log, index) => (
                          <div
                            key={index}
                            className={`p-2 rounded ${
                              log.includes("ERROR")
                                ? "bg-red-50"
                                : log.includes("WARNING")
                                  ? "bg-yellow-50"
                                  : ""
                            }`}
                          >
                            {log}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Run verification to see logs
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-between">
          <p className="text-sm text-gray-500">
            Last verification:{" "}
            {verificationResults ? new Date().toLocaleString() : "Never"}
          </p>
          <Button
            variant="outline"
            onClick={() => window.open("https://app.supabase.com", "_blank")}
          >
            Open Supabase Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SupabaseVerification;
