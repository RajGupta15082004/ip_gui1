export interface IpEntry {
  id: string;
  name: string;
  ip: string;
  status: "online" | "offline" | "checking";
  lastChecked: Date;
  responseTime?: number;
}

export interface ParsedData {
  entries: IpEntry[];
  errors: string[];
}

export function parseCSV(content: string): ParsedData {
  const lines = content.split("\n").filter((line) => line.trim());
  const entries: IpEntry[] = [];
  const errors: string[] = [];

  if (lines.length === 0) {
    return { entries: [], errors: ["File is empty"] };
  }

  // Skip header row if it exists
  const startIndex =
    lines[0].toLowerCase().includes("ip") ||
    lines[0].toLowerCase().includes("name")
      ? 1
      : 0;

  lines.slice(startIndex).forEach((line, index) => {
    const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));

    if (values.length === 0) return;

    // Try to find IP address in any column
    const ipRegex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    let ip = "";
    let name = "";

    // Look for IP in each column
    for (let i = 0; i < values.length; i++) {
      if (ipRegex.test(values[i])) {
        ip = values[i];
        // Use other columns as name, prioritizing non-empty values
        name =
          values.find((v, idx) => idx !== i && v.length > 0) ||
          `Server ${entries.length + 1}`;
        break;
      }
    }

    if (!ip) {
      // If no valid IP found, try to use the longest value as IP (might be hostname)
      const longestValue = values.reduce(
        (a, b) => (a.length > b.length ? a : b),
        "",
      );
      if (longestValue && longestValue.includes(".")) {
        ip = longestValue;
        name =
          values.find((v) => v !== ip && v.length > 0) ||
          `Server ${entries.length + 1}`;
      } else {
        errors.push(
          `Line ${startIndex + index + 1}: No valid IP address found`,
        );
        return;
      }
    }

    entries.push({
      id: `${ip}-${Date.now()}-${Math.random()}`,
      name,
      ip,
      status: "checking",
      lastChecked: new Date(),
    });
  });

  return { entries, errors };
}

export function parseExcel(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        // Import xlsx dynamically
        const XLSX = await import("xlsx");
        const data = e.target?.result as ArrayBuffer;

        // Parse the Excel file
        const workbook = XLSX.read(data, { type: "array" });

        // Get the first worksheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to CSV format
        const csvContent = XLSX.utils.sheet_to_csv(worksheet);

        // Parse as CSV
        const result = parseCSV(csvContent);
        resolve(result);
      } catch (error) {
        reject(
          new Error(
            "Failed to parse Excel file: " +
              (error instanceof Error ? error.message : "Unknown error"),
          ),
        );
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}
