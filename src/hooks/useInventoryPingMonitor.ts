import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { InventoryItem, PingStats, PingResult } from "@/types/inventory";
import { apiClient } from "@/lib/api";
import { simulatePing } from "@/lib/pingSimulator";

export function useInventoryPingMonitor() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(true);

  // Calculate stats
  const stats: PingStats = useMemo(() => {
    const total = inventory.length;
    const checking = inventory.filter(
      (item) => item.status === "checking",
    ).length;

    // If we're actively scanning, show real-time stats
    // If not scanning, exclude "checking" entries from calculations
    const validItems = isScanning
      ? inventory
      : inventory.filter((item) => item.status !== "checking");

    const online = validItems.filter((item) => item.status === "online").length;
    const offline = validItems.filter(
      (item) => item.status === "offline",
    ).length;

    return {
      total,
      online,
      offline,
      checking: isScanning ? checking : 0,
      uptime: validItems.length > 0 ? (online / validItems.length) * 100 : 0,
    };
  }, [inventory, isScanning]);

  // Load inventory from backend
  const loadInventory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiClient.getInventory();
      if (result.success && result.data) {
        const processedData = result.data.map((item) => ({
          ...item,
          lastChecked: new Date(item.lastChecked),
          createdAt: new Date(item.createdAt),
          updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
        }));
        setInventory(processedData);
      } else {
        setError(result.error || "Failed to load inventory");
      }
    } catch (error) {
      setError("Network error. Please check if the backend server is running.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Ping a single host
  const pingSingleHost = useCallback(
    async (item: InventoryItem): Promise<void> => {
      if (!isActiveRef.current) return;

      // Update local state to show checking
      setInventory((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, status: "checking" as const, lastChecked: new Date() }
            : i,
        ),
      );

      try {
        const result = await simulatePing(item.ip);

        if (!isActiveRef.current) return;

        const updatedItem = {
          ...item,
          status: result.status,
          responseTime: result.responseTime,
          lastChecked: result.timestamp,
        };

        // Update local state
        setInventory((prev) =>
          prev.map((i) => (i.id === item.id ? updatedItem : i)),
        );

        // Update backend
        await apiClient.updateInventoryItem(item.id, {
          status: result.status,
          responseTime: result.responseTime,
          lastChecked: result.timestamp.toISOString(),
        });
      } catch (error) {
        if (!isActiveRef.current) return;

        const now = new Date();
        const updatedItem = {
          ...item,
          status: "offline" as const,
          lastChecked: now,
        };

        // Update local state
        setInventory((prev) =>
          prev.map((i) => (i.id === item.id ? updatedItem : i)),
        );

        // Update backend
        await apiClient.updateInventoryItem(item.id, {
          status: "offline",
          lastChecked: now.toISOString(),
        });
      }
    },
    [],
  );

  // Ping all hosts
  const pingAllHosts = useCallback(async (): Promise<void> => {
    if (inventory.length === 0) return;

    setIsScanning(true);
    setLastScanTime(new Date());

    try {
      // Ping all hosts concurrently with staggered starts
      const pingPromises = inventory.map(
        (item, index) =>
          new Promise<PingResult>((resolve) => {
            setTimeout(async () => {
              try {
                const result = await simulatePing(item.ip);
                resolve({
                  id: item.id,
                  status: result.status,
                  responseTime: result.responseTime,
                  timestamp: result.timestamp,
                });
              } catch (error) {
                resolve({
                  id: item.id,
                  status: "offline",
                  timestamp: new Date(),
                });
              }
            }, index * 100); // Stagger by 100ms
          }),
      );

      const results = await Promise.all(pingPromises);

      if (!isActiveRef.current) return;

      // Update local state with all results
      setInventory((prev) =>
        prev.map((item) => {
          const result = results.find((r) => r.id === item.id);
          return result
            ? {
                ...item,
                status: result.status,
                responseTime: result.responseTime,
                lastChecked: result.timestamp,
              }
            : item;
        }),
      );

      // Bulk update backend
      const updatePayload = results.map((result) => ({
        id: result.id,
        status: result.status,
        responseTime: result.responseTime,
        lastChecked: result.timestamp.toISOString(),
      }));

      await apiClient.updatePingResults(updatePayload);
    } catch (error) {
      console.error("Error during bulk ping:", error);
      setError("Error occurred during ping monitoring");
    } finally {
      setIsScanning(false);
    }
  }, [inventory]);

  // Start monitoring with configurable interval
  const startMonitoring = useCallback(
    (intervalSeconds: number = 30) => {
      if (isMonitoring) return;

      setIsMonitoring(true);
      isActiveRef.current = true;
      setError(null);

      // Initial ping
      pingAllHosts();

      // Set up interval
      intervalRef.current = setInterval(() => {
        if (isActiveRef.current) {
          pingAllHosts();
        }
      }, intervalSeconds * 1000);
    },
    [isMonitoring, pingAllHosts],
  );

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    isActiveRef.current = false;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Remove item from inventory
  const removeInventoryItem = useCallback(async (id: string) => {
    try {
      const result = await apiClient.deleteInventoryItem(id);
      if (result.success) {
        setInventory((prev) => prev.filter((item) => item.id !== id));
      } else {
        setError(result.error || "Failed to delete item");
      }
    } catch (error) {
      setError("Network error while deleting item");
    }
  }, []);

  // Clear all inventory
  const clearInventory = useCallback(async () => {
    try {
      const result = await apiClient.clearInventory();
      if (result.success) {
        setInventory([]);
        stopMonitoring();
      } else {
        setError(result.error || "Failed to clear inventory");
      }
    } catch (error) {
      setError("Network error while clearing inventory");
    }
  }, [stopMonitoring]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Load inventory on mount
  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  return {
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
  };
}
