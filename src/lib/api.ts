const API_BASE_URL = "http://localhost:3001/api";

export interface InventoryItem {
  id: string;
  name: string;
  ip: string;
  status: "online" | "offline" | "checking";
  lastChecked: string;
  responseTime?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API request failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  // Get all inventory items
  async getInventory(): Promise<ApiResponse<InventoryItem[]>> {
    return this.makeRequest<InventoryItem[]>("/inventory");
  }

  // Add a single IP to inventory
  async addInventoryItem(item: {
    name: string;
    ip: string;
  }): Promise<ApiResponse<InventoryItem>> {
    return this.makeRequest<InventoryItem>("/inventory", {
      method: "POST",
      body: JSON.stringify(item),
    });
  }

  // Bulk add IPs to inventory
  async bulkAddInventory(entries: { name: string; ip: string }[]): Promise<
    ApiResponse<{
      added: InventoryItem[];
      duplicates: string[];
      totalAdded: number;
    }>
  > {
    return this.makeRequest("/inventory/bulk", {
      method: "POST",
      body: JSON.stringify({ entries }),
    });
  }

  // Update an inventory item
  async updateInventoryItem(
    id: string,
    updates: Partial<InventoryItem>,
  ): Promise<ApiResponse<InventoryItem>> {
    return this.makeRequest<InventoryItem>(`/inventory/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  // Bulk update ping results
  async updatePingResults(
    results: Array<{
      id: string;
      status: "online" | "offline";
      responseTime?: number;
      lastChecked: string;
    }>,
  ): Promise<ApiResponse<InventoryItem[]>> {
    return this.makeRequest<InventoryItem[]>("/inventory/ping-results", {
      method: "PUT",
      body: JSON.stringify({ results }),
    });
  }

  // Delete an inventory item
  async deleteInventoryItem(id: string): Promise<ApiResponse<InventoryItem>> {
    return this.makeRequest<InventoryItem>(`/inventory/${id}`, {
      method: "DELETE",
    });
  }

  // Clear all inventory
  async clearInventory(): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>("/inventory", {
      method: "DELETE",
    });
  }

  // Health check
  async healthCheck(): Promise<
    ApiResponse<{ message: string; timestamp: string }>
  > {
    return this.makeRequest<{ message: string; timestamp: string }>("/health");
  }
}

export const apiClient = new ApiClient();
