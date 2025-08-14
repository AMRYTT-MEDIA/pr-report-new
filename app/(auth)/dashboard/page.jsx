"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  ExternalLink,
  Download,
  Eye,
  BarChart3,
  Share2,
  Copy,
  Upload,
  Plus,
  Users,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import {
  getReportsFromLocal,
  saveReportToLocal,
  deleteReportFromLocal,
  parseCSVLine,
  formatNumber,
  formatDate,
  generateId,
} from "@/src/lib/utils";
import { getLogoForUrl, getOutletName } from "@/src/utils/logoMapping";
import SimpleRouteGuard from "@/components/SimpleRouteGuard";

export default function DashboardPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadReports();
    }
  }, [user]);

  const loadReports = () => {
    const localReports = getReportsFromLocal();
    setReports(localReports);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const fileContent = e.target?.result;
        let processedReport;

        if (file.name.toLowerCase().endsWith(".csv")) {
          processedReport = processCSVReport(fileContent, file.name);
        } else {
          throw new Error("Unsupported file format. Please upload a CSV file.");
        }

        // Save to local storage
        saveReportToLocal(processedReport);

        // Update state
        setReports((prev) => [...prev, processedReport]);

        toast.success("Report uploaded successfully!");
        setSelectedFile(null);
      } catch (error) {
        console.error("Error parsing file:", error);
        toast.error(`Error parsing file: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const processCSVReport = (csvContent, fileName) => {
    const lines = csvContent.trim().split("\n");
    const headers = parseCSVLine(lines[0]).map((h) => h.replace(/"/g, ""));

    // Find column indices based on CSV structure
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

        let potential_reach = 0;
        if (reachIndex >= 0 && columns[reachIndex]) {
          const reachStr = columns[reachIndex];
          const cleanedReach = reachStr.replace(/[^\d.]/g, "");
          potential_reach = parseFloat(cleanedReach) || 0;
        }

        return {
          website_name,
          published_url,
          potential_reach,
        };
      })
      .filter((outlet) => outlet.website_name && outlet.website_name !== "");

    // Calculate totals
    const totalOutlets = outlets.length;
    const totalReach = outlets.reduce(
      (sum, outlet) => sum + outlet.potential_reach,
      0
    );

    return {
      id: generateId(),
      title: fileName.replace(".csv", "") || "PR Distribution Report",
      date_created: new Date().toISOString(),
      total_outlets: totalOutlets,
      total_reach: totalReach,
      outlets: outlets,
      status: "completed",
      ownerId: user?.uid || "unknown",
      visibility: "private",
      sharedAt: null,
    };
  };

  const handleShare = (reportId) => {
    const report = reports.find((r) => r.id === reportId);
    if (report) {
      // Generate share link
      const shareUrl = `${window.location.origin}/report/${reportId}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast.success("Share link copied to clipboard!");
      });
    }
  };

  const handleDelete = (reportId) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      deleteReportFromLocal(reportId);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      toast.success("Report deleted successfully!");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
      toast.success("Logged out successfully!");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  const filteredReports = reports.filter((report) =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-8 w-32 mx-auto mb-4" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SimpleRouteGuard requireAuth={true}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">G</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Dashboard</h1>
                  <p className="text-muted-foreground">
                    Welcome back, {user.email} ({user.role || "user"})
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Reports
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reports.length}</div>
                <p className="text-xs text-muted-foreground">Reports created</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Publications
                </CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reports.reduce(
                    (sum, report) => sum + (report.total_outlets || 0),
                    0
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all reports
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Reach
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(
                    reports.reduce(
                      (sum, report) => sum + (report.total_reach || 0),
                      0
                    )
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Potential audience
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">User Role</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Badge variant="default" className="capitalize">
                  {user.role || "user"}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  Access level
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Upload Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Upload New Report</CardTitle>
              <CardDescription>
                Upload a CSV file to create a new PR distribution report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    CSV files only (MAX. 10MB)
                  </p>
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle>Your Reports ({filteredReports.length})</CardTitle>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredReports.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Reports Yet</h3>
                  <p className="text-muted-foreground">
                    Upload your first CSV report to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReports.map((report) => (
                    <Card key={report.id} className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">
                            {report.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Created {formatDate(report.date_created)} •{" "}
                            {report.total_outlets} outlets •{" "}
                            {formatNumber(report.total_reach)} reach
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge
                              variant={
                                report.visibility === "public"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {report.visibility}
                            </Badge>
                            <Badge
                              variant={
                                report.status === "completed"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {report.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/report/${report.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShare(report.id)}
                          >
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </Button>
                          {(user.role === "admin" ||
                            user.role === "manager") && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(report.id)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </SimpleRouteGuard>
  );
}
