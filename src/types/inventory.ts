export interface InventoryItem {
  id: string;
  name: string;
  ip: string;
  status: "online" | "offline" | "checking";
  lastChecked: Date;
  responseTime?: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface PingResult {
  id: string;
  status: "online" | "offline";
  responseTime?: number;
  timestamp: Date;
}

export interface PingStats {
  total: number;
  online: number;
  offline: number;
  checking: number;
  uptime: number;
}

export interface BulkUploadResult {
  added: InventoryItem[];
  duplicates: string[];
  totalAdded: number;
}
