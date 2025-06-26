import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, AlertCircle, X } from "lucide-react";
import { parseCSV, parseExcel, ParsedData } from "@/lib/csvParser";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileUploaded: (data: ParsedData) => void;
  className?: string;
}

export function FileUpload({ onFileUploaded, className }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    setUploadedFile(file);
    setIsProcessing(true);
    setErrors([]);

    try {
      let result: ParsedData;

      if (file.name.endsWith(".csv") || file.type === "text/csv") {
        const content = await file.text();
        result = parseCSV(content);
      } else if (
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls") ||
        file.type.includes("spreadsheet") ||
        file.type.includes("excel")
      ) {
        // Handle Excel files - convert to CSV first
        try {
          result = await parseExcel(file);
        } catch (excelError) {
          // If Excel parsing fails, show more helpful error
          setErrors([
            "Failed to process Excel file. Please ensure it's a valid .xlsx or .xls file, or try converting it to CSV format manually.",
            excelError instanceof Error
              ? excelError.message
              : "Unknown Excel parsing error",
          ]);
          return;
        }
      } else {
        // For unknown file types, try to parse as CSV
        try {
          const content = await file.text();
          result = parseCSV(content);
        } catch (csvError) {
          setErrors([
            "Unsupported file type. Please upload a CSV (.csv) or Excel (.xlsx, .xls) file.",
            "If this is a text file with IP addresses, please save it with a .csv extension.",
          ]);
          return;
        }
      }

      if (result.errors.length > 0) {
        setErrors(result.errors);
      }

      if (result.entries.length === 0) {
        setErrors([
          "No valid IP addresses found in the file. Please check the file format and content.",
        ]);
        return;
      }

      onFileUploaded(result);
    } catch (error) {
      setErrors([
        "Failed to process file: " +
          (error instanceof Error ? error.message : "Unknown error"),
        "Please try uploading a different file or check the file format.",
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground">
              Upload IP List
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Upload CSV or Excel files - Excel files will be automatically
              converted to CSV format
            </p>
          </div>

          {!uploadedFile ? (
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50",
              )}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Drop your file here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports CSV and Excel files
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{uploadedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFile}
                  disabled={isProcessing}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {isProcessing && (
                <div className="text-center py-4">
                  <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Processing file...
                  </div>
                </div>
              )}
            </div>
          )}

          {errors.length > 0 && (
            <div className="space-y-2">
              {errors.map((error, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive rounded-lg"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="w-full max-w-xs"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose File (.csv, .xlsx, .xls)
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      </CardContent>
    </Card>
  );
}
