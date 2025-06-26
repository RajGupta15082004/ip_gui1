import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Upload,
  ArrowLeft,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { FileUpload } from "@/components/FileUpload";
import { apiClient } from "@/lib/api";
import { parseCSV, parseExcel, ParsedData } from "@/lib/csvParser";
import { cn } from "@/lib/utils";

interface IpEntryForm {
  name: string;
  ip: string;
}

const AddInventory = () => {
  const navigate = useNavigate();
  const [singleEntry, setSingleEntry] = useState<IpEntryForm>({
    name: "",
    ip: "",
  });
  const [bulkEntries, setBulkEntries] = useState<IpEntryForm[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
    details?: any;
  }>({ type: null, message: "" });

  const validateIp = (ip: string): boolean => {
    const ipRegex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip) || ip.includes("."); // Allow hostnames too
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!singleEntry.ip.trim()) {
      setSubmitStatus({ type: "error", message: "IP address is required" });
      return;
    }

    if (!validateIp(singleEntry.ip.trim())) {
      setSubmitStatus({
        type: "error",
        message: "Please enter a valid IP address or hostname",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const result = await apiClient.addInventoryItem({
        name: singleEntry.name.trim() || `Server for ${singleEntry.ip}`,
        ip: singleEntry.ip.trim(),
      });

      if (result.success) {
        setSubmitStatus({
          type: "success",
          message: `Successfully added ${singleEntry.ip} to inventory!`,
        });
        setSingleEntry({ name: "", ip: "" });
      } else {
        setSubmitStatus({
          type: "error",
          message: result.error || "Failed to add IP to inventory",
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message:
          "Network error. Please check if the backend server is running.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkTextSubmit = () => {
    const textValue = (
      document.getElementById("bulk-text") as HTMLTextAreaElement
    )?.value;
    if (!textValue.trim()) {
      setSubmitStatus({
        type: "error",
        message: "Please enter some IP addresses",
      });
      return;
    }

    // Parse the text input as CSV
    const csvData = parseCSV(textValue.trim());
    if (csvData.entries.length === 0) {
      setSubmitStatus({
        type: "error",
        message: "No valid IP addresses found in the text",
      });
      return;
    }

    const newEntries = csvData.entries.map((entry) => ({
      name: entry.name,
      ip: entry.ip,
    }));

    setBulkEntries((prev) => [...prev, ...newEntries]);
    (document.getElementById("bulk-text") as HTMLTextAreaElement).value = "";

    if (csvData.errors.length > 0) {
      setSubmitStatus({
        type: "error",
        message: `Added ${newEntries.length} entries, but encountered ${csvData.errors.length} errors`,
        details: csvData.errors,
      });
    } else {
      setSubmitStatus({
        type: "success",
        message: `Added ${newEntries.length} entries to the bulk list`,
      });
    }
  };

  const handleFileUploaded = (data: ParsedData) => {
    const newEntries = data.entries.map((entry) => ({
      name: entry.name,
      ip: entry.ip,
    }));

    setBulkEntries((prev) => [...prev, ...newEntries]);

    if (data.errors.length > 0) {
      setSubmitStatus({
        type: "error",
        message: `Added ${newEntries.length} entries, but encountered ${data.errors.length} errors`,
        details: data.errors,
      });
    } else {
      setSubmitStatus({
        type: "success",
        message: `Successfully loaded ${newEntries.length} entries from file`,
      });
    }
  };

  const removeBulkEntry = (index: number) => {
    setBulkEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBulkSubmit = async () => {
    if (bulkEntries.length === 0) {
      setSubmitStatus({ type: "error", message: "No entries to submit" });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const result = await apiClient.bulkAddInventory(bulkEntries);

      if (result.success && result.data) {
        const { totalAdded, duplicates } = result.data;
        let message = `Successfully added ${totalAdded} items to inventory!`;

        if (duplicates.length > 0) {
          message += ` (${duplicates.length} duplicates skipped)`;
        }

        setSubmitStatus({
          type: "success",
          message,
          details:
            duplicates.length > 0
              ? `Duplicates: ${duplicates.join(", ")}`
              : undefined,
        });
        setBulkEntries([]);
      } else {
        setSubmitStatus({
          type: "error",
          message: result.error || "Failed to add entries to inventory",
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message:
          "Network error. Please check if the backend server is running.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Add to Inventory
              </h1>
              <p className="text-sm text-muted-foreground">
                Add IP addresses to your monitoring inventory
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Status Messages */}
        {submitStatus.type && (
          <Card
            className={cn(
              "border-2",
              submitStatus.type === "success"
                ? "border-green-500 bg-green-50 dark:bg-green-950"
                : "border-red-500 bg-red-50 dark:bg-red-950",
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {submitStatus.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <p
                    className={cn(
                      "font-medium",
                      submitStatus.type === "success"
                        ? "text-green-800"
                        : "text-red-800",
                    )}
                  >
                    {submitStatus.message}
                  </p>
                  {submitStatus.details && (
                    <p
                      className={cn(
                        "text-sm mt-1",
                        submitStatus.type === "success"
                          ? "text-green-600"
                          : "text-red-600",
                      )}
                    >
                      {Array.isArray(submitStatus.details)
                        ? submitStatus.details.join(", ")
                        : submitStatus.details}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Single Entry Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Single IP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSingleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Server Name (Optional)</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Web Server, Database"
                    value={singleEntry.name}
                    onChange={(e) =>
                      setSingleEntry((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ip">IP Address or Hostname *</Label>
                  <Input
                    id="ip"
                    placeholder="e.g., 192.168.1.100 or example.com"
                    value={singleEntry.ip}
                    onChange={(e) =>
                      setSingleEntry((prev) => ({
                        ...prev,
                        ip: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add to Inventory"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Bulk Entry Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Bulk Add IPs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Text Input Method */}
              <div className="space-y-3">
                <Label htmlFor="bulk-text">Paste IP Addresses</Label>
                <Textarea
                  id="bulk-text"
                  placeholder="Enter one IP per line or CSV format:&#10;192.168.1.100&#10;Web Server,192.168.1.101&#10;10.0.0.50"
                  rows={6}
                />
                <Button
                  onClick={handleBulkTextSubmit}
                  variant="outline"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  Add from Text
                </Button>
              </div>

              <Separator />

              {/* File Upload Method */}
              <div className="space-y-3">
                <Label>Upload CSV/Excel File</Label>
                <FileUpload onFileUploaded={handleFileUploaded} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Entries List */}
        {bulkEntries.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  Pending Bulk Entries
                  <Badge variant="secondary">{bulkEntries.length}</Badge>
                </CardTitle>
                <Button onClick={handleBulkSubmit} disabled={isSubmitting}>
                  {isSubmitting
                    ? "Adding..."
                    : `Add ${bulkEntries.length} Entries`}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {bulkEntries.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{entry.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {entry.ip}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBulkEntry(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default AddInventory;
