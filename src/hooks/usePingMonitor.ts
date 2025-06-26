import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { IpEntry } from "@/lib/csvParser";
import { simulatePing, PingResult } from "@/lib/pingSimulator";

export interface PingStats {
  total: number;
  online: number;
  offline: number;
  checking: number;
  uptime: number;
}

export function usePingMonitor(initialEntries: IpEntry[] = []) {
  const [entries, setEntries] = useState<IpEntry[]>(initialEntries);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(true);

  // Calculate stats, but don't include "checking" status in final calculations when not actively scanning
  const stats: PingStats = useMemo(() => {
    const total = entries.length;
    const checking = entries.filter((e) => e.status === "checking").length;

    // If we're actively scanning, show real-time stats
    // If not scanning, exclude "checking" entries from calculations
    const validEntries = isScanning
      ? entries
      : entries.filter((e) => e.status !== "checking");

    const online = validEntries.filter((e) => e.status === "online").length;
    const offline = validEntries.filter((e) => e.status === "offline").length;

    return {
      total,
      online,
      offline,
      checking: isScanning ? checking : 0,
      uptime:
        validEntries.length > 0 ? (online / validEntries.length) * 100 : 0,
    };
  }, [entries, isScanning]);

  const pingSingleHost = useCallback(async (entry: IpEntry): Promise<void> => {
    if (!isActiveRef.current) return;

    // Set to checking state
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entry.id
          ? { ...e, status: "checking" as const, lastChecked: new Date() }
          : e,
      ),
    );

    try {
      const result = await simulatePing(entry.ip);

      if (!isActiveRef.current) return;

      setEntries((prev) =>
        prev.map((e) =>
          e.id === entry.id
            ? {
                ...e,
                status: result.status,
                responseTime: result.responseTime,
                lastChecked: result.timestamp,
              }
            : e,
        ),
      );
    } catch (error) {
      if (!isActiveRef.current) return;

      setEntries((prev) =>
        prev.map((e) =>
          e.id === entry.id
            ? { ...e, status: "offline" as const, lastChecked: new Date() }
            : e,
        ),
      );
    }
  }, []);

  const pingAllHosts = useCallback(async (): Promise<void> => {
    if (entries.length === 0) return;

    setIsScanning(true);
    setLastScanTime(new Date());

    // Ping all hosts concurrently with some delay between starts to avoid overwhelming
    const pingPromises = entries.map(
      (entry, index) =>
        new Promise<void>((resolve) => {
          setTimeout(async () => {
            await pingSingleHost(entry);
            resolve();
          }, index * 100); // Stagger by 100ms
        }),
    );

    await Promise.all(pingPromises);

    // Mark scanning as complete after all pings finish
    setIsScanning(false);
  }, [entries, pingSingleHost]);

  const startMonitoring = useCallback(
    (intervalSeconds: number = 20) => {
      if (isMonitoring) return;

      setIsMonitoring(true);
      isActiveRef.current = true;

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

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    isActiveRef.current = false;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const addEntries = useCallback((newEntries: IpEntry[]) => {
    setEntries((prev) => [...prev, ...newEntries]);
  }, []);

  const clearEntries = useCallback(() => {
    setEntries([]);
    stopMonitoring();
  }, [stopMonitoring]);

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Update entries when initialEntries change
  useEffect(() => {
    setEntries(initialEntries);
  }, [initialEntries]);

  return {
    entries,
    stats,
    isMonitoring,
    lastScanTime,
    pingSingleHost,
    pingAllHosts,
    startMonitoring,
    stopMonitoring,
    addEntries,
    clearEntries,
    removeEntry,
  };
}
