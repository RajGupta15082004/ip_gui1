import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  Trash2,
  Zap,
} from "lucide-react";
import { IpEntry } from "@/lib/csvParser";
import { cn } from "@/lib/utils";

interface StatusCardProps {
  entry: IpEntry;
  onRefresh: (entry: IpEntry) => void;
  onRemove: (id: string) => void;
  className?: string;
}

export function StatusCard({
  entry,
  onRefresh,
  onRemove,
  className,
}: StatusCardProps) {
  const getStatusIcon = () => {
    switch (entry.status) {
      case "online":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "offline":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "checking":
        return <Clock className="w-4 h-4 text-yellow-600 animate-pulse" />;
    }
  };

  const getStatusBadge = () => {
    switch (entry.status) {
      case "online":
        return (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 border-green-200"
          >
            Online
          </Badge>
        );
      case "offline":
        return (
          <Badge
            variant="secondary"
            className="bg-red-100 text-red-800 border-red-200"
          >
            Offline
          </Badge>
        );
      case "checking":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 border-yellow-200"
          >
            Checking...
          </Badge>
        );
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getCardBorderClass = () => {
    switch (entry.status) {
      case "online":
        return "border-green-200 dark:border-green-800";
      case "offline":
        return "border-red-200 dark:border-red-800";
      case "checking":
        return "border-yellow-200 dark:border-yellow-800";
      default:
        return "border-border";
    }
  };

  return (
    <Card
      className={cn(
        "relative transition-all duration-200 hover:shadow-md",
        getCardBorderClass(),
        className,
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <h3 className="font-medium text-sm truncate" title={entry.name}>
                {entry.name}
              </h3>
            </div>
            <p
              className="text-xs text-muted-foreground font-mono"
              title={entry.ip}
            >
              {entry.ip}
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onRefresh(entry)}
              disabled={entry.status === "checking"}
              title="Refresh status"
            >
              <RotateCcw
                className={cn(
                  "w-3 h-3",
                  entry.status === "checking" && "animate-spin",
                )}
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
              onClick={() => onRemove(entry.id)}
              title="Remove host"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            {getStatusBadge()}
            {entry.status === "online" && entry.responseTime && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Zap className="w-3 h-3" />
                {entry.responseTime}ms
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            Last checked: {formatTime(entry.lastChecked)}
          </div>

          {/* Status indicator pulse */}
          <div className="flex justify-center">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                entry.status === "online" && "status-online",
                entry.status === "offline" && "status-offline",
                entry.status === "checking" && "status-checking",
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
