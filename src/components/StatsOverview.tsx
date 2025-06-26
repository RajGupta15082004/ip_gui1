import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Zap,
} from "lucide-react";
import { PingStats } from "@/hooks/usePingMonitor";
import { cn } from "@/lib/utils";
import { FileUpload } from "@/components/FileUpload";
interface StatsOverviewProps {
  stats: PingStats;
  isMonitoring: boolean;
  lastScanTime: Date | null;
  className?: string;
}

export function StatsOverview({
  stats,
  isMonitoring,
  lastScanTime,
  className,
}: StatsOverviewProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 95) return "text-green-600";
    if (uptime >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  const getUptimeProgressColor = (uptime: number) => {
    if (uptime >= 95) return "bg-green-500";
    if (uptime >= 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",
        className,
      )}
    >
      {/* Total Hosts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Hosts</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            {isMonitoring ? "Monitoring active" : "Monitoring paused"}
          </p>
        </CardContent>
      </Card>

      {/* Online Hosts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Online</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-green-600">
              {stats.online}
            </div>
            <Badge variant="secondary" className="text-xs">
              {stats.total > 0
                ? Math.round((stats.online / stats.total) * 100)
                : 0}
              %
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">Responsive hosts</p>
        </CardContent>
      </Card>

      {/* Offline Hosts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Offline</CardTitle>
          <XCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-red-600">
              {stats.offline}
            </div>
            <Badge variant="secondary" className="text-xs">
              {stats.total > 0
                ? Math.round((stats.offline / stats.total) * 100)
                : 0}
              %
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">Unreachable hosts</p>
        </CardContent>
      </Card>

      {/* Uptime */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Network Uptime</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div
              className={cn("text-2xl font-bold", getUptimeColor(stats.uptime))}
            >
              {stats.uptime.toFixed(1)}%
            </div>
            <Progress
              value={stats.uptime}
              className="h-2"
              style={{
                background: `linear-gradient(to right, ${getUptimeProgressColor(stats.uptime)} ${stats.uptime}%, hsl(var(--muted)) ${stats.uptime}%)`,
              }}
            />
            <p className="text-xs text-muted-foreground">
              Overall availability
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Status Panel */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  isMonitoring ? "status-online" : "bg-gray-400",
                )}
              />
              <span className="text-muted-foreground">
                Monitoring: {isMonitoring ? "Active" : "Paused"}
              </span>
            </div>

            {stats.checking > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full status-checking" />
                <span className="text-muted-foreground">
                  Checking: {stats.checking} hosts
                </span>
              </div>
            )}

            {lastScanTime && (
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Last scan: {formatTime(lastScanTime)}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <Badge
                variant={stats.uptime >= 95 ? "default" : "destructive"}
                className="text-xs"
              >
                {stats.uptime >= 95
                  ? "Healthy"
                  : stats.uptime >= 80
                    ? "Degraded"
                    : "Critical"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
