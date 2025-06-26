#!/usr/bin/env node

const { spawn } = require("child_process");
const fs = require("fs");

console.log("🚀 Starting NetMonitor on Single Port (3003)...\n");

// Check if dist folder exists, if not build the frontend
if (!fs.existsSync("./dist")) {
  console.log("📦 Building frontend...");
  const buildProcess = spawn("npm", ["run", "build"], {
    stdio: "inherit",
    shell: true,
  });

  buildProcess.on("close", (code) => {
    if (code === 0) {
      console.log("✅ Frontend build complete!");
      startServer();
    } else {
      console.error("❌ Frontend build failed");
      process.exit(1);
    }
  });
} else {
  console.log("📁 Using existing build...");
  startServer();
}

function startServer() {
  console.log("🔧 Starting Express server on port 3003...");

  const serverProcess = spawn("node", ["server.js"], {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, PORT: "3003" },
  });

  serverProcess.on("close", (code) => {
    if (code !== 0) {
      console.error(`❌ Server process exited with code ${code}`);
    }
  });

  // Handle process termination
  process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down server...");
    serverProcess.kill("SIGINT");
    process.exit(0);
  });
}
