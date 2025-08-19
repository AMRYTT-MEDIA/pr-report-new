import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Upload, FileText } from "lucide-react";
import PRReportViewer from "@/components/PRReportViewer";
import { useToast } from "@/hooks/use-toast";

const PRReport = () => {
  const { reportId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Sample report data for demonstration
  const sampleReport = {
    id: "sample-123",
    title: "Tech Company Product Launch - Q1 2024",
    date_created: "2024-01-15T10:30:00Z",
    total_outlets: 156,
    total_reach: 2500000,
    status: "completed",
    outlets: [
      {
        website_name: "Business Insider",
        published_url: "https://businessinsider.com/sample-article",
        potential_reach: 200000,
      },
      {
        website_name: "Bloomberg",
        published_url: "https://bloomberg.com/sample-article",
        potential_reach: 180000,
      },
      {
        website_name: "Wall Street Journal",
        published_url: "https://wsj.com/sample-article",
        potential_reach: 250000,
      },
      {
        website_name: "Yahoo Finance",
        published_url: "https://finance.yahoo.com/sample-article",
        potential_reach: 300000,
      },
      {
        website_name: "MarketWatch",
        published_url: "https://marketwatch.com/sample-article",
        potential_reach: 120000,
      },
      {
        website_name: "Reuters",
        published_url: "https://reuters.com/sample-article",
        potential_reach: 220000,
      },
      {
        website_name: "Associated Press",
        published_url: "https://apnews.com/sample-article",
        potential_reach: 190000,
      },
      {
        website_name: "The Globe and Mail",
        published_url: "https://theglobeandmail.com/sample-article",
        potential_reach: 85000,
      },
      {
        website_name: "Financial Post",
        published_url: "https://financialpost.com/sample-article",
        potential_reach: 95000,
      },
      {
        website_name: "CEO.ca",
        published_url: "https://ceo.ca/sample-article",
        potential_reach: 45000,
      },
      {
        website_name: "Stockhouse",
        published_url: "https://stockhouse.com/sample-article",
        potential_reach: 65000,
      },
      {
        website_name: "StreetInsider",
        published_url: "https://streetinsider.com/sample-article",
        potential_reach: 75000,
      },
    ],
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const fileContent = e.target?.result;

        let processedReport;

        if (file.name.toLowerCase().endsWith(".csv")) {
          processedReport = processCSVReport(fileContent, file.name);
        } else if (file.name.toLowerCase().endsWith(".json")) {
          const jsonData = JSON.parse(fileContent);
          processedReport = processJSONReport(jsonData, file.name);
        } else {
          throw new Error(
            "Unsupported file format. Please upload a CSV or JSON file."
          );
        }

        setReport(processedReport);
      } catch (error) {
        console.error("Error parsing file:", error);
        alert(
          `Error parsing file: ${
            error instanceof Error
              ? error.message
              : "Please check the file format."
          }`
        );
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  // Function to process CSV data
  const processCSVReport = (csvContent, fileName) => {
    // Better CSV parsing that handles quoted fields and commas within values
    const parseCSVLine = (line) => {
      const result = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const lines = csvContent.trim().split("\n");
    const headers = parseCSVLine(lines[0]).map((h) => h.replace(/"/g, ""));

    // Find column indices based on common header names
    const recipientIndex = headers.findIndex(
      (h) =>
        h.toLowerCase().includes("recipient") ||
        h.toLowerCase().includes("outlet") ||
        h.toLowerCase().includes("publication")
    );

    const urlIndex = headers.findIndex(
      (h) => h.toLowerCase().includes("url") || h.toLowerCase().includes("link")
    );

    const reachIndex = headers.findIndex(
      (h) =>
        h.toLowerCase().includes("reach") ||
        h.toLowerCase().includes("audience") ||
        h.toLowerCase().includes("circulation")
    );

    // Process data rows
    const outlets = lines
      .slice(1)
      .map((line, index) => {
        const columns = parseCSVLine(line).map((col) => col.replace(/"/g, ""));

        const website_name =
          recipientIndex >= 0
            ? columns[recipientIndex] || `Outlet ${index + 1}`
            : `Outlet ${index + 1}`;
        const published_url = urlIndex >= 0 ? columns[urlIndex] || "#" : "#";

        // Better number parsing for comma-separated values like "8,80,00,000"
        let potential_reach = 0;
        if (reachIndex >= 0 && columns[reachIndex]) {
          const reachStr = columns[reachIndex];

          // Clean the string: remove all non-digits except decimal points
          const cleanedReach = reachStr.replace(/[^\d.]/g, "");

          potential_reach = parseFloat(cleanedReach) || 0;
        }

        return {
          website_name,
          published_url,
          potential_reach,
        };
      })
      .filter((outlet) => outlet.website_name && outlet.website_name !== ""); // Filter out empty rows

    // Calculate totals
    const totalOutlets = outlets.length;
    const totalReach = outlets.reduce(
      (sum, outlet) => sum + outlet.potential_reach,
      0
    );

    return {
      id: `uploaded-csv-${Date.now()}`,
      title: fileName.replace(".csv", "") || "PR Distribution Report",
      date_created: new Date().toISOString(),
      total_outlets: totalOutlets,
      total_reach: totalReach,
      outlets: outlets,
      status: "completed",
    };
  };

  // Function to process and normalize JSON data
  const processJSONReport = (rawData, fileName) => {
    // Extract title from filename or data
    const title =
      rawData.title ||
      fileName.replace(".json", "") ||
      "PR Distribution Report";

    // Handle different possible JSON structures
    let outlets = [];

    // Try different possible outlet array locations
    if (Array.isArray(rawData.outlets)) {
      outlets = rawData.outlets;
    } else if (Array.isArray(rawData.data)) {
      outlets = rawData.data;
    } else if (Array.isArray(rawData.results)) {
      outlets = rawData.results;
    } else if (Array.isArray(rawData.publications)) {
      outlets = rawData.publications;
    } else if (Array.isArray(rawData.media_outlets)) {
      outlets = rawData.media_outlets;
    } else if (Array.isArray(rawData.outlets_data)) {
      outlets = rawData.outlets_data;
    } else if (Array.isArray(rawData.report_data)) {
      outlets = rawData.report_data;
    } else if (Array.isArray(rawData)) {
      outlets = rawData;
    } else {
      // Try to find any array properties
      const arrayProperties = Object.keys(rawData).filter((key) =>
        Array.isArray(rawData[key])
      );

      if (arrayProperties.length > 0) {
        outlets = rawData[arrayProperties[0]];
      }
    }

    // Process each outlet
    const processedOutlets = outlets.map((outlet) => ({
      website_name:
        outlet.website_name ||
        outlet.name ||
        outlet.outlet ||
        outlet.publication ||
        "Unknown Outlet",
      published_url:
        outlet.published_url ||
        outlet.url ||
        outlet.link ||
        outlet.article_url ||
        "#",
      potential_reach:
        outlet.potential_reach ||
        outlet.reach ||
        outlet.audience ||
        outlet.views ||
        0,
    }));

    // Calculate totals
    const totalOutlets = processedOutlets.length;
    const totalReach = processedOutlets.reduce((sum, outlet) => {
      const reach = Number(outlet.potential_reach) || 0;
      return sum + reach;
    }, 0);

    return {
      id: `uploaded-${Date.now()}`,
      title: title,
      date_created:
        rawData.date_created || rawData.created_at || new Date().toISOString(),
      total_outlets: rawData.total_outlets || totalOutlets,
      total_reach: rawData.total_reach || totalReach,
      outlets: processedOutlets,
      status: "completed",
    };
  };

  const loadSampleReport = () => {
    setLoading(true);
    setTimeout(() => {
      const sampleWithId = { ...sampleReport, id: crypto.randomUUID() };
      setReport(sampleWithId);
      setLoading(false);
    }, 1000);
  };

  const handleShare = (reportId) => {
    if (report) {
      // Store the report in localStorage for sharing
      const storedReports = JSON.parse(
        localStorage.getItem("sharedReports") || "{}"
      );
      storedReports[reportId] = report;
      localStorage.setItem("sharedReports", JSON.stringify(storedReports));

      toast({
        title: "Share link copied!",
        description: "The report link has been copied to your clipboard.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">PR Distribution Report</h1>
              {reportId && (
                <p className="text-muted-foreground">Report ID: {reportId}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!report && !loading && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Upload Your PR Report</CardTitle>
                <CardDescription>
                  Upload the CSV or JSON report file you received after your PR
                  distribution to view detailed analytics and publication data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      CSV or JSON files only (MAX. 10MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Or try our sample report to see how it works
                  </p>
                  <Button variant="outline" onClick={loadSampleReport}>
                    Load Sample Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <PRReportViewer
          report={report || undefined}
          loading={loading}
          onShare={handleShare}
        />
      </main>
    </div>
  );
};

export default PRReport;
