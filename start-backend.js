#!/usr/bin/env node

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Starting NetMonitor Backend Server...\n");

// Check if server.js exists
if (!fs.existsSync("./server.js")) {
  console.error("❌ Error: server.js not found in current directory");
  console.log(
    "Please make sure you are running this from the project root directory.",
  );
  process.exit(1);
}

// Check if backend dependencies are installed
try {
  require.resolve("express");
  require.resolve("cors");
} catch (error) {
  console.log("📦 Installing backend dependencies...");
  const installProcess = spawn(
    "npm",
    ["install", "express", "cors", "multer"],
    {
      stdio: "inherit",
      shell: true,
    },
  );

  installProcess.on("close", (code) => {
    if (code === 0) {
      startServer();
    } else {
      console.error("❌ Failed to install dependencies");
      process.exit(1);
    }
  });
  return;
}

function startServer() {
  console.log("🔧 Starting Express server on port 3001...");

  const serverProcess = spawn("node", ["server.js"], {
    stdio: "inherit",
    shell: true,
  });

  serverProcess.on("close", (code) => {
    if (code !== 0) {
      console.error(`❌ Server process exited with code ${code}`);
    }
  });

  // Handle process termination
  process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down backend server...");
    serverProcess.kill("SIGINT");
    process.exit(0);
  });
}

startServer();
