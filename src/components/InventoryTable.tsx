import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Trash2,
  RefreshCw,
  Download,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { InventoryItem, PingStats } from "@/types/inventory";
import { cn } from "@/lib/utils";

interface InventoryTableProps {
  inventory: InventoryItem[];
  stats: PingStats;
  onRefreshSingle: (item: InventoryItem) => void;
  onRemoveItem: (id: string) => void;
  onRefreshAll: () => void;
  isScanning?: boolean;
  className?: string;
}

export function InventoryTable({
  inventory,
  stats,
  onRefreshSingle,
  onRemoveItem,
  onRefreshAll,
  isScanning = false,
  className,
}: InventoryTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.ip.includes(searchQuery);

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [inventory, searchQuery, statusFilter]);

  const onlineItems = useMemo(
    () => inventory.filter((item) => item.status === "online"),
    [inventory],
  );

  const offlineItems = useMemo(
    () => inventory.filter((item) => item.status === "offline"),
    [inventory],
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "offline":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "checking":
        return <Clock className="w-4 h-4 text-yellow-600 animate-pulse" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Online
          </Badge>
        );
      case "offline":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Offline
          </Badge>
        );
      case "checking":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Checking
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const exportToCSV = () => {
    const csvContent = [
      "Name,IP Address,Status,Response Time,Last Checked",
      ...filteredInventory.map((item) =>
        [
          item.name,
          item.ip,
          item.status,
          item.responseTime || "",
          item.lastChecked.toISOString(),
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderInventoryTable = (items: InventoryItem[]) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>Response Time</TableHead>
            <TableHead>Last Checked</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getStatusIcon(item.status)}
                  {getStatusBadge(item.status)}
                </div>
              </TableCell>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="font-mono">{item.ip}</TableCell>
              <TableCell>
                {item.responseTime ? `${item.responseTime}ms` : "-"}
              </TableCell>
              <TableCell>{formatDate(item.lastChecked)}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center gap-1 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRefreshSingle(item)}
                    disabled={isScanning}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Remove from Inventory
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove "{item.name}" (
                          {item.ip}) from your inventory?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onRemoveItem(item.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  if (inventory.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-12 text-center">
          <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No inventory found</h3>
          <p className="text-muted-foreground">
            Add some IP addresses to your inventory to start monitoring.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Network Inventory</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefreshAll}
              disabled={isScanning}
            >
              <RefreshCw
                className={cn("w-4 h-4 mr-2", isScanning && "animate-spin")}
              />
              {isScanning ? "Scanning..." : "Refresh All"}
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search and Filter Controls */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="checking">Checking</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabbed View */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="flex items-center gap-2">
                All Hosts
                <Badge variant="secondary">{stats.total}</Badge>
              </TabsTrigger>
              <TabsTrigger value="online" className="flex items-center gap-2">
                Online
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  {stats.online}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="offline" className="flex items-center gap-2">
                Offline
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  {stats.offline}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              {filteredInventory.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No hosts match your search criteria.
                  </p>
                </div>
              ) : (
                renderInventoryTable(filteredInventory)
              )}
            </TabsContent>

            <TabsContent value="online" className="mt-4">
              {onlineItems.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No online hosts found.
                  </p>
                </div>
              ) : (
                renderInventoryTable(onlineItems)
              )}
            </TabsContent>

            <TabsContent value="offline" className="mt-4">
              {offlineItems.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-4 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-600 mb-2">
                    All hosts are online!
                  </h3>
                  <p className="text-muted-foreground">
                    Great news - no offline hosts detected.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-destructive">
                      Offline Hosts - Attention Required
                    </h3>
                    <Badge variant="destructive">{offlineItems.length}</Badge>
                  </div>
                  {renderInventoryTable(offlineItems)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
