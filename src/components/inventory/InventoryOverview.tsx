import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  AlertTriangleIcon,
  BoxIcon,
  ShirtIcon,
  BarChart3Icon,
  TrendingUpIcon,
  TrendingDownIcon,
} from "lucide-react";

interface InventoryMetric {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
}

interface LowStockAlert {
  id: string;
  product: string;
  currentStock: number;
  threshold: number;
  category: string;
}

interface InventoryOverviewProps {
  boxedInventoryCount?: number;
  individualPairsCount?: number;
  lowStockAlerts?: LowStockAlert[];
  inventoryDistribution?: {
    category: string;
    count: number;
    percentage: number;
  }[];
  recentActivity?: {
    action: string;
    product: string;
    quantity: number;
    timestamp: string;
  }[];
}

const InventoryOverview: React.FC<InventoryOverviewProps> = ({
  boxedInventoryCount = 1250,
  individualPairsCount = 8750,
  lowStockAlerts = [
    {
      id: "1",
      product: "Running Shoes Model X",
      currentStock: 5,
      threshold: 10,
      category: "Sports",
    },
    {
      id: "2",
      product: "Casual Sandals Y",
      currentStock: 3,
      threshold: 15,
      category: "Casual",
    },
    {
      id: "3",
      product: "Formal Shoes Z",
      currentStock: 8,
      threshold: 20,
      category: "Formal",
    },
  ],
  inventoryDistribution = [
    { category: "Sports", count: 3500, percentage: 40 },
    { category: "Casual", count: 2625, percentage: 30 },
    { category: "Formal", count: 1750, percentage: 20 },
    { category: "Kids", count: 875, percentage: 10 },
  ],
  recentActivity = [
    {
      action: "Added",
      product: "Running Shoes Model X",
      quantity: 50,
      timestamp: "2 hours ago",
    },
    {
      action: "Removed",
      product: "Casual Sandals Y",
      quantity: 25,
      timestamp: "4 hours ago",
    },
    {
      action: "Updated",
      product: "Formal Shoes Z",
      quantity: 15,
      timestamp: "1 day ago",
    },
  ],
}) => {
  const metrics: InventoryMetric[] = [
    {
      title: "Boxed Inventory",
      value: boxedInventoryCount,
      change: 12.5,
      icon: <BoxIcon className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Individual Pairs",
      value: individualPairsCount,
      change: -2.3,
      icon: <ShirtIcon className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Total SKUs",
      value: 325,
      change: 8.1,
      icon: <BarChart3Icon className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Inventory Value",
      value: "$245,000",
      change: 5.7,
      icon: <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />,
    },
  ];

  return (
    <div className="bg-background p-6 rounded-lg">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">
          Inventory Overview
        </h2>
        <p className="text-muted-foreground">
          Monitor your inventory metrics and trends at a glance.
        </p>
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
          <TabsTrigger value="alerts">Low Stock Alerts</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {metric.title}
                  </CardTitle>
                  {metric.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    {metric.change > 0 ? (
                      <>
                        <ArrowUpIcon className="h-4 w-4 text-green-500" />
                        <span className="text-green-500">{metric.change}%</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownIcon className="h-4 w-4 text-red-500" />
                        <span className="text-red-500">
                          {Math.abs(metric.change)}%
                        </span>
                      </>
                    )}
                    <span>from last month</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Alerts</CardTitle>
              <CardDescription>Products that need attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockAlerts.length > 0 ? (
                  lowStockAlerts.map((alert) => (
                    <Alert key={alert.id} variant="destructive">
                      <AlertTriangleIcon className="h-4 w-4" />
                      <AlertTitle className="flex items-center gap-2">
                        {alert.product}
                        <Badge variant="outline">{alert.category}</Badge>
                      </AlertTitle>
                      <AlertDescription>
                        <div className="mt-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Current Stock: {alert.currentStock}</span>
                            <span>Threshold: {alert.threshold}</span>
                          </div>
                          <Progress
                            value={(alert.currentStock / alert.threshold) * 100}
                            className="h-2"
                          />
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No low stock alerts at this time.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Distribution</CardTitle>
              <CardDescription>Breakdown by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inventoryDistribution.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.category}</span>
                        <Badge variant="secondary">{item.count} pairs</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {item.percentage}%
                      </span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest inventory changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <div>
                      <div className="font-medium">{activity.product}</div>
                      <div className="text-sm text-muted-foreground">
                        {activity.action} {activity.quantity} units
                      </div>
                    </div>
                    <Badge variant="outline">{activity.timestamp}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryOverview;
