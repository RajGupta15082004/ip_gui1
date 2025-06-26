import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, Settings } from "lucide-react";

interface PingIntervalSelectorProps {
  isMonitoring: boolean;
  onStartMonitoring: (intervalSeconds: number) => void;
  onStopMonitoring: () => void;
  lastScanTime?: Date | null;
  className?: string;
}

const INTERVAL_OPTIONS = [
  { value: "10", label: "10 seconds", description: "Very frequent" },
  { value: "20", label: "20 seconds", description: "Frequent" },
  { value: "30", label: "30 seconds", description: "Default" },
  { value: "60", label: "1 minute", description: "Standard" },
  { value: "120", label: "2 minutes", description: "Moderate" },
  { value: "300", label: "5 minutes", description: "Conservative" },
  { value: "600", label: "10 minutes", description: "Low frequency" },
  { value: "1800", label: "30 minutes", description: "Very low" },
  { value: "3600", label: "1 hour", description: "Minimal" },
];

export function PingIntervalSelector({
  isMonitoring,
  onStartMonitoring,
  onStopMonitoring,
  lastScanTime,
  className,
}: PingIntervalSelectorProps) {
  const [selectedInterval, setSelectedInterval] = useState("30");

  const handleToggleMonitoring = () => {
    if (isMonitoring) {
      onStopMonitoring();
    } else {
      const intervalSeconds = parseInt(selectedInterval);
      onStartMonitoring(intervalSeconds);
    }
  };

  const formatLastScanTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffSeconds < 60) {
      return `${diffSeconds}s ago`;
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else {
      return `${diffHours}h ago`;
    }
  };

  const getIntervalInfo = (value: string) => {
    return INTERVAL_OPTIONS.find((option) => option.value === value);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="w-5 h-5" />
          Auto-Ping Monitor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Status and Last Scan */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <Badge
                variant={isMonitoring ? "default" : "secondary"}
                className={
                  isMonitoring
                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                    : ""
                }
              >
                {isMonitoring ? "Active" : "Stopped"}
              </Badge>
            </div>
            {lastScanTime && (
              <div className="text-xs text-muted-foreground">
                Last scan: {formatLastScanTime(lastScanTime)}
              </div>
            )}
          </div>

          {/* Interval Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Ping Interval</label>
            <Select
              value={selectedInterval}
              onValueChange={setSelectedInterval}
              disabled={isMonitoring}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select interval" />
              </SelectTrigger>
              <SelectContent>
                {INTERVAL_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!isMonitoring && (
              <p className="text-xs text-muted-foreground">
                {getIntervalInfo(selectedInterval)?.description} monitoring
                frequency
              </p>
            )}
          </div>

          {/* Control Button */}
          <Button
            onClick={handleToggleMonitoring}
            className="w-full"
            variant={isMonitoring ? "destructive" : "default"}
          >
            {isMonitoring ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Stop Auto-Ping
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Auto-Ping
              </>
            )}
          </Button>

          {isMonitoring && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Automatically pinging every{" "}
                <span className="font-medium">
                  {getIntervalInfo(selectedInterval)?.label}
                </span>
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
