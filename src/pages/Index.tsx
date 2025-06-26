import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Network,
  Zap,
  Github,
  Plus,
  Settings,
  Database,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import { PingIntervalSelector } from "@/components/PingIntervalSelector";
import { InventoryTable } from "@/components/InventoryTable";
import { useInventoryPingMonitor } from "@/hooks/useInventoryPingMonitor";

const Index = () => {
  const navigate = useNavigate();

  const {
    inventory,
    stats,
    isMonitoring,
    isLoading,
    isScanning,
    lastScanTime,
    error,
    loadInventory,
    pingSingleHost,
    pingAllHosts,
    startMonitoring,
    stopMonitoring,
    removeInventoryItem,
    clearInventory,
  } = useInventoryPingMonitor();

  // Refresh data on mount
  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
                <Network className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  NetMonitor
                </h1>
                <p className="text-sm text-muted-foreground">
                  Real-time network monitoring dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="hidden sm:inline-flex">
                <Activity className="w-3 h-3 mr-1" />
                {isMonitoring ? "Monitoring" : "Stopped"}
              </Badge>
              {inventory.length > 0 && (
                <Badge variant="secondary" className="hidden sm:inline-flex">
                  {stats.total} IPs
                </Badge>
              )}
              <Button variant="ghost" size="sm" asChild>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Github className="w-4 h-4" />
                  <span className="hidden sm:inline">Source</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Error Display */}
        {error && (
          <Card className="border-red-500 bg-red-50 dark:bg-red-950">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <ExternalLink className="w-5 h-5 text-red-600" />
                <div className="flex-1">
                  <p className="text-red-800 font-medium">{error}</p>
                  <p className="text-red-600 text-sm mt-1">
                    Make sure the backend server is running. You can start it by
                    running:{" "}
                    <code className="bg-red-100 px-2 py-1 rounded">
                      node server.js
                    </code>
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={loadInventory}>
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          /* Loading State */
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Network className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Loading Inventory...</h3>
            <p className="text-muted-foreground">
              Connecting to backend server
            </p>
          </div>
        ) : inventory.length === 0 ? (
          /* Welcome Section - No Inventory */
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-6 py-12">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20">
                    <Zap className="w-10 h-10 text-primary" />
                  </div>
                </div>
                <h2 className="text-4xl font-bold text-foreground">
                  Network Monitoring Made Simple
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Build your IP inventory and monitor your entire network in
                  real-time. Get instant alerts when hosts go offline and track
                  performance metrics.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button onClick={() => navigate("/add-inventory")} size="lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Add IP Addresses
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/show-inventory")}
                  size="lg"
                >
                  <Database className="w-5 h-5 mr-2" />
                  View Inventory
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
                <Card className="text-center">
                  <CardHeader>
                    <Database className="w-8 h-8 mx-auto text-primary mb-2" />
                    <CardTitle className="text-lg">
                      Persistent Storage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Your IP inventory is saved on the backend. No more data
                      loss on refresh!
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardHeader>
                    <Settings className="w-8 h-8 mx-auto text-primary mb-2" />
                    <CardTitle className="text-lg">
                      Configurable Auto-Ping
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Set custom ping intervals from 10 seconds to 1 hour
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardHeader>
                    <Network className="w-8 h-8 mx-auto text-primary mb-2" />
                    <CardTitle className="text-lg">Smart Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Add manually, upload CSV/Excel, or manage existing
                      inventory
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Getting Started */}
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="w-5 h-5" />
                  Getting Started
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Quick Start</h4>
                    <ol className="text-sm text-muted-foreground space-y-2">
                      <li>
                        1. Start the backend server:{" "}
                        <code className="bg-muted px-2 py-1 rounded">
                          node server.js
                        </code>
                      </li>
                      <li>
                        2. Add IP addresses manually or upload CSV/Excel files
                      </li>
                      <li>
                        3. Configure auto-ping intervals and start monitoring
                      </li>
                      <li>
                        4. View real-time status and manage your inventory
                      </li>
                    </ol>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">
                      File Format Support
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• CSV and Excel (.xlsx, .xls) files</li>
                      <li>• Automatic conversion of Excel to CSV</li>
                      <li>• IP addresses can be in any column</li>
                      <li>• Automatic header row detection</li>
                      <li>• Mixed hostnames and IPs supported</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Dashboard Section - With Inventory */
          <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Database className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{stats.total}</p>
                      <p className="text-sm text-muted-foreground">Total IPs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {stats.online}
                      </p>
                      <p className="text-sm text-muted-foreground">Online</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">
                        {stats.offline}
                      </p>
                      <p className="text-sm text-muted-foreground">Offline</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {stats.uptime.toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground">Uptime</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-yellow-600 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-yellow-600">
                        {stats.checking}
                      </p>
                      <p className="text-sm text-muted-foreground">Checking</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Control Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <PingIntervalSelector
                  isMonitoring={isMonitoring}
                  onStartMonitoring={startMonitoring}
                  onStopMonitoring={stopMonitoring}
                  lastScanTime={lastScanTime}
                />
              </div>
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Inventory Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-center gap-4">
                      <Button
                        onClick={() => navigate("/add-inventory")}
                        className="flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add IPs
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate("/show-inventory")}
                        className="flex items-center gap-2"
                      >
                        <Database className="w-4 h-4" />
                        Manage Inventory
                      </Button>
                      <div className="flex-1" />
                      <div className="text-sm text-muted-foreground">
                        {inventory.length} IP{inventory.length !== 1 ? "s" : ""}{" "}
                        in inventory
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Inventory Table */}
            <InventoryTable
              inventory={inventory}
              stats={stats}
              onRefreshSingle={pingSingleHost}
              onRemoveItem={removeInventoryItem}
              onRefreshAll={pingAllHosts}
              isScanning={isScanning}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Network className="w-4 h-4" />
              <span>NetMonitor Pro - Built with React & TypeScript</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Real-time network monitoring</span>
              <Badge variant="outline">v1.0.0</Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
