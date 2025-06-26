import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  Pause,
  Search,
  Filter,
  RotateCcw,
  Trash2,
  Download,
} from "lucide-react";
import { StatusCard } from "./StatusCard";
import { IpEntry } from "@/lib/csvParser";
import { usePingMonitor } from "@/hooks/usePingMonitor";
import { cn } from "@/lib/utils";
import { FileUpload } from "@/components/FileUpload";
interface IpMonitorProps {
  entries: IpEntry[];
  className?: string;
}

export function IpMonitor({ entries, className }: IpMonitorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "online" | "offline" | "checking"
  >("all");
  const [refreshInterval, setRefreshInterval] = useState("20");

  const {
    entries: monitoredEntries,
    stats,
    isMonitoring,
    lastScanTime,
    pingSingleHost,
    pingAllHosts,
    startMonitoring,
    stopMonitoring,
    removeEntry,
    clearEntries,
  } = usePingMonitor(entries);

  const filteredEntries = useMemo(() => {
    return monitoredEntries.filter((entry) => {
      const matchesSearch =
        searchQuery === "" ||
        entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.ip.includes(searchQuery);

      const matchesStatus =
        statusFilter === "all" || entry.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [monitoredEntries, searchQuery, statusFilter]);

  const offlineEntries = useMemo(() => {
    return monitoredEntries.filter((entry) => entry.status === "offline");
  }, [monitoredEntries]);

  const handleToggleMonitoring = () => {
    if (isMonitoring) {
      stopMonitoring();
    } else {
      startMonitoring(parseInt(refreshInterval));
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      "Name,IP Address,Status,Response Time,Last Checked",
      ...monitoredEntries.map((entry) =>
        [
          entry.name,
          entry.ip,
          entry.status,
          entry.responseTime || "",
          entry.lastChecked.toISOString(),
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ping_results_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (monitoredEntries.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No hosts to monitor</h3>
              <p className="text-muted-foreground">
                Upload a CSV or Excel file to start monitoring your network
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Network Monitor Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                onClick={handleToggleMonitoring}
                variant={isMonitoring ? "destructive" : "default"}
                className="flex items-center gap-2"
              >
                {isMonitoring ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Stop Monitoring
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start Monitoring
                  </>
                )}
              </Button>

              <Select
                value={refreshInterval}
                onValueChange={setRefreshInterval}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 seconds</SelectItem>
                  <SelectItem value="20">20 seconds</SelectItem>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">1 minute</SelectItem>
                  <SelectItem value="300">5 minutes</SelectItem>
                  <SelectItem value="600">10 minutes</SelectItem>
                  <SelectItem value="1800">30 minutes</SelectItem>
                  <SelectItem value="3600">1 hour</SelectItem>
                  <SelectItem value="7200">2 hours</SelectItem>
                  <SelectItem value="14400">4 hours</SelectItem>
                  <SelectItem value="36000">10 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search hosts or IPs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex justify-center">
              <Button variant="outline" onClick={handleNewUpload}>
                <Upload className="w-4 h-4 mr-2" />
                Upload New File
              </Button>
            </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={pingAllHosts}
                disabled={isMonitoring}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Refresh All
              </Button>

              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={clearEntries}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="flex items-center gap-2">
            All Hosts
            <Badge variant="secondary">{filteredEntries.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="online" className="flex items-center gap-2">
            Online
            <Badge variant="secondary" className="bg-green-100 text-green-800">
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

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredEntries.map((entry) => (
              <StatusCard
                key={entry.id}
                entry={entry}
                onRefresh={pingSingleHost}
                onRemove={removeEntry}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="online" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredEntries
              .filter((entry) => entry.status === "online")
              .map((entry) => (
                <StatusCard
                  key={entry.id}
                  entry={entry}
                  onRefresh={pingSingleHost}
                  onRemove={removeEntry}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="offline" className="mt-6">
          {offlineEntries.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-destructive">
                  Offline Hosts - Attention Required
                </h3>
                <Badge variant="destructive">{offlineEntries.length}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {offlineEntries.map((entry) => (
                  <StatusCard
                    key={entry.id}
                    entry={entry}
                    onRefresh={pingSingleHost}
                    onRemove={removeEntry}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Filter className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-600">
                All hosts are online!
              </h3>
              <p className="text-muted-foreground">
                Great news - no offline hosts detected
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
