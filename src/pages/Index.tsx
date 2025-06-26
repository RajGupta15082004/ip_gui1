import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Upload,
  Network,
  Zap,
  Github,
  ExternalLink,
} from "lucide-react";
import { FileUpload } from "@/components/FileUpload";
import { IpMonitor } from "@/components/IpMonitor";
import { ParsedData, IpEntry } from "@/lib/csvParser";
import { usePingMonitor } from "@/hooks/usePingMonitor";

const Index = () => {
  const [uploadedEntries, setUploadedEntries] = useState<IpEntry[]>([]);
  const [hasUploaded, setHasUploaded] = useState(false);

  const { stats, isMonitoring, lastScanTime } = usePingMonitor(uploadedEntries);

  const handleFileUploaded = (data: ParsedData) => {
    setUploadedEntries(data.entries);
    setHasUploaded(true);
  };

  const handleNewUpload = () => {
    setUploadedEntries([]);
    setHasUploaded(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
                <Network className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  NetMonitor
                </h1>
                <p className="text-sm text-muted-foreground">
                  Real-time network monitoring dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="hidden sm:inline-flex">
                <Activity className="w-3 h-3 mr-1" />
                {isMonitoring ? "Live" : "Paused"}
              </Badge>
              <Button variant="ghost" size="sm" asChild>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Github className="w-4 h-4" />
                  <span className="hidden sm:inline">Source</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {!hasUploaded ? (
          /* Welcome Section */
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-6 py-12">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20">
                    <Zap className="w-10 h-10 text-primary" />
                  </div>
                </div>
                <h2 className="text-4xl font-bold text-foreground">
                  Network Monitoring Made Simple
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Upload your IP list and monitor your entire network in
                  real-time. Get instant alerts when hosts go offline and track
                  performance metrics.
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
                <Card className="text-center">
                  <CardHeader>
                    <Upload className="w-8 h-8 mx-auto text-primary mb-2" />
                    <CardTitle className="text-lg">Easy Upload</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Support for CSV and Excel files with automatic IP
                      detection
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardHeader>
                    <Activity className="w-8 h-8 mx-auto text-primary mb-2" />
                    <CardTitle className="text-lg">
                      Real-time Monitoring
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Continuous ping monitoring with customizable intervals
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardHeader>
                    <Network className="w-8 h-8 mx-auto text-primary mb-2" />
                    <CardTitle className="text-lg">Smart Filtering</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Separate views for online/offline hosts with search
                      functionality
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Upload Section */}
            <div className="max-w-2xl mx-auto">
              <FileUpload onFileUploaded={handleFileUploaded} />
            </div>

            {/* Help Section */}
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="w-5 h-5" />
                  Getting Started
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">CSV File Format</h4>
                    <div className="bg-muted p-3 rounded-lg font-mono text-xs space-y-1">
                      <div>Server Name,IP Address</div>
                      <div>Web Server,192.168.1.100</div>
                      <div>Database,10.0.0.50</div>
                      <div>Mail Server,172.16.0.10</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">
                      Excel File Support
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Supports .xlsx and .xls formats</li>
                      <li>• IP addresses can be in any column</li>
                      <li>• Automatic header row detection</li>
                      <li>• Mixed hostnames and IPs supported</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Dashboard Section */
          <div className="space-y-8">
            {/* Stats Overview */}

            {/* IP Monitor */}
            <IpMonitor
  entries={uploadedEntries}
  onResetUpload={handleNewUpload}
/>

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Network className="w-4 h-4" />
              <span>NetMonitor Pro - Built with React & TypeScript</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Real-time network monitoring</span>
              <Badge variant="outline">v1.0.0</Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
