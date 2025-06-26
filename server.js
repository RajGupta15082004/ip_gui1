const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Data file path
const DATA_FILE = path.join(__dirname, "inventory.json");

// Initialize data file if it doesn't exist
async function initializeDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch (error) {
    // File doesn't exist, create it with empty inventory
    await fs.writeFile(DATA_FILE, JSON.stringify({ inventory: [] }, null, 2));
  }
}

// Helper function to read inventory
async function readInventory() {
  try {
    const data = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(data);
    return parsed.inventory || [];
  } catch (error) {
    console.error("Error reading inventory:", error);
    return [];
  }
}

// Helper function to write inventory
async function writeInventory(inventory) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify({ inventory }, null, 2));
    return true;
  } catch (error) {
    console.error("Error writing inventory:", error);
    return false;
  }
}

// Routes

// Get all inventory items
app.get("/api/inventory", async (req, res) => {
  try {
    const inventory = await readInventory();
    res.json({ success: true, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add a single IP to inventory
app.post("/api/inventory", async (req, res) => {
  try {
    const { name, ip } = req.body;

    if (!ip) {
      return res
        .status(400)
        .json({ success: false, error: "IP address is required" });
    }

    const inventory = await readInventory();

    // Check if IP already exists
    const existingIndex = inventory.findIndex((item) => item.ip === ip);
    if (existingIndex !== -1) {
      return res.status(409).json({
        success: false,
        error: "IP address already exists in inventory",
      });
    }

    const newItem = {
      id: `${ip}-${Date.now()}-${Math.random()}`,
      name: name || `Server ${inventory.length + 1}`,
      ip,
      status: "checking",
      lastChecked: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    inventory.push(newItem);

    const success = await writeInventory(inventory);
    if (success) {
      res.json({ success: true, data: newItem });
    } else {
      res
        .status(500)
        .json({ success: false, error: "Failed to save inventory" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bulk add IPs to inventory
app.post("/api/inventory/bulk", async (req, res) => {
  try {
    const { entries } = req.body;

    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Entries array is required and must not be empty",
      });
    }

    const inventory = await readInventory();
    const newItems = [];
    const duplicates = [];

    for (const entry of entries) {
      if (!entry.ip) continue;

      // Check for duplicates
      const existingIndex = inventory.findIndex((item) => item.ip === entry.ip);
      if (existingIndex !== -1) {
        duplicates.push(entry.ip);
        continue;
      }

      const newItem = {
        id: `${entry.ip}-${Date.now()}-${Math.random()}`,
        name: entry.name || `Server ${inventory.length + newItems.length + 1}`,
        ip: entry.ip,
        status: "checking",
        lastChecked: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      newItems.push(newItem);
    }

    // Add new items to inventory
    inventory.push(...newItems);

    const success = await writeInventory(inventory);
    if (success) {
      res.json({
        success: true,
        data: {
          added: newItems,
          duplicates,
          totalAdded: newItems.length,
        },
      });
    } else {
      res
        .status(500)
        .json({ success: false, error: "Failed to save inventory" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update an inventory item
app.put("/api/inventory/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, ip, status, responseTime, lastChecked } = req.body;

    const inventory = await readInventory();
    const itemIndex = inventory.findIndex((item) => item.id === id);

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, error: "Item not found" });
    }

    // Update the item
    inventory[itemIndex] = {
      ...inventory[itemIndex],
      ...(name !== undefined && { name }),
      ...(ip !== undefined && { ip }),
      ...(status !== undefined && { status }),
      ...(responseTime !== undefined && { responseTime }),
      ...(lastChecked !== undefined && { lastChecked }),
      updatedAt: new Date().toISOString(),
    };

    const success = await writeInventory(inventory);
    if (success) {
      res.json({ success: true, data: inventory[itemIndex] });
    } else {
      res
        .status(500)
        .json({ success: false, error: "Failed to update inventory" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bulk update ping results
app.put("/api/inventory/ping-results", async (req, res) => {
  try {
    const { results } = req.body;

    if (!Array.isArray(results)) {
      return res.status(400).json({
        success: false,
        error: "Results array is required",
      });
    }

    const inventory = await readInventory();

    // Update items with ping results
    for (const result of results) {
      const itemIndex = inventory.findIndex((item) => item.id === result.id);
      if (itemIndex !== -1) {
        inventory[itemIndex] = {
          ...inventory[itemIndex],
          status: result.status,
          responseTime: result.responseTime,
          lastChecked: result.lastChecked || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
    }

    const success = await writeInventory(inventory);
    if (success) {
      res.json({ success: true, data: inventory });
    } else {
      res
        .status(500)
        .json({ success: false, error: "Failed to update inventory" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete an inventory item
app.delete("/api/inventory/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const inventory = await readInventory();
    const itemIndex = inventory.findIndex((item) => item.id === id);

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, error: "Item not found" });
    }

    const deletedItem = inventory.splice(itemIndex, 1)[0];

    const success = await writeInventory(inventory);
    if (success) {
      res.json({ success: true, data: deletedItem });
    } else {
      res
        .status(500)
        .json({ success: false, error: "Failed to delete from inventory" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Clear all inventory
app.delete("/api/inventory", async (req, res) => {
  try {
    const success = await writeInventory([]);
    if (success) {
      res.json({ success: true, message: "Inventory cleared successfully" });
    } else {
      res
        .status(500)
        .json({ success: false, error: "Failed to clear inventory" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Initialize and start server
async function startServer() {
  await initializeDataFile();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api`);
  });
}

startServer();
