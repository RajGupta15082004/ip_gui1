export interface PingResult {
  ip: string;
  status: "online" | "offline";
  responseTime?: number;
  timestamp: Date;
}

// Simulate ping results with realistic behavior
export async function simulatePing(ip: string): Promise<PingResult> {
  // Simulate network delay
  const delay = Math.random() * 2000 + 500; // 500-2500ms

  await new Promise((resolve) => setTimeout(resolve, delay));

  // Simulate different success rates based on IP patterns
  let successRate = 0.85; // Default 85% success rate

  // Some IPs are more likely to be offline
  if (ip.includes("192.168.") || ip.includes("10.0.")) {
    successRate = 0.95; // Local networks more reliable
  } else if (ip.includes("172.")) {
    successRate = 0.75; // Less reliable
  }

  // Add some randomness for specific IPs to make it interesting
  const lastOctet = parseInt(ip.split(".")[3] || "0");
  if (lastOctet > 200) {
    successRate *= 0.7; // Higher IP numbers less reliable
  }

  const isOnline = Math.random() < successRate;

  return {
    ip,
    status: isOnline ? "online" : "offline",
    responseTime: isOnline ? Math.round(Math.random() * 150 + 10) : undefined, // 10-160ms
    timestamp: new Date(),
  };
}

export function isValidIP(ip: string): boolean {
  const ipRegex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
}

export function isValidHostname(hostname: string): boolean {
  const hostnameRegex =
    /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.([a-zA-Z]{2,}|[a-zA-Z0-9-]*[a-zA-Z0-9])$/;
  return hostnameRegex.test(hostname) || isValidIP(hostname);
}
