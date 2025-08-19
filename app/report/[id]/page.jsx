"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
  ArrowLeft,
  Mail,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { getLogoForUrl, getOutletName } from "@/utils/logoMapping";
import { publicPrReportsService } from "@/services/publicPrReports";
import PRReportViewer from "@/components/PRReportViewer";
import { AlertCircle } from "lucide-react";
import Image from "next/image";

export default function ReportPage() {
  const params = useParams();
  const reportId = params.id;
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [showFullReport, setShowFullReport] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    verifyReportAccess();
  }, [reportId]);

  const verifyReportAccess = async () => {
    try {
      setLoading(true);
      const response = await publicPrReportsService.verifyUrlAccess(reportId);

      if (response.success && response.data.verify === true) {
        if (response.data.is_private === true) {
          // Private report - show email dialog
          setShowEmailDialog(true);
          setLoading(false);
        } else {
          // Public report - load data immediately
          await loadReportData();
        }
      } else {
        toast.error("Report not found or access denied");
        setLoading(false);
      }
    } catch (error) {
      toast.error("Error accessing report");
      setLoading(false);
    }
  };

  const loadReportData = async (userEmail = null) => {
    try {
      setLoading(true);
      const response = await publicPrReportsService.getReportData(
        reportId,
        userEmail
      );

      console.log(response);
      if (response.success) {
        // Transform the API response to match the component's expected structure
        const transformedData = {
          // Map the basic fields
          id: reportId,
          title: response.data.report_title || "PR Report",
          total_outlets: response.data.total_records || 0,
          total_reach: response.data.overallPotentialReach || 0,
          status: "completed", // Default status since it's not in your JSON
          date_created: new Date().toISOString(), // Default date since it's not in your JSON
          visibility: "public", // Default visibility

          // Transform distribution_data to outlets format
          outlets: (response.data.distribution_data || []).map((item) => ({
            website_name: item.recipient || "Unknown Outlet",
            published_url: item.url || "",
            potential_reach: item.potential_reach || 0,
          })),
        };

        setReport(transformedData);
        setShowFullReport(true);
        if (userEmail) {
          setEmailSubmitted(true);
          setEmail(userEmail);
        }
      } else {
        toast.error("Failed to load report data");
      }
    } catch (error) {
      toast.error("Error loading report data");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (email.trim()) {
      try {
        setVerifying(true);

        // Verify email access first
        const verifyResponse = await publicPrReportsService.verifyUrlAccess(
          reportId,
          email.trim()
        );

        if (verifyResponse.success && verifyResponse.data.verify === true) {
          // Email is verified, now load the report data
          await loadReportData(email.trim());
          setShowEmailDialog(false);
          toast.success("Email verified successfully! Loading report...");
        } else {
          toast.error("Email not authorized for this report");
        }
      } catch (error) {
        if (error.response?.status === 401) {
          toast.error("Email not authorized for this report");
        } else if (error.response?.status === 404) {
          toast.error("Report not found");
        } else {
          toast.error("Failed to verify email. Please try again.");
        }
      } finally {
        setVerifying(false);
      }
    }
  };

  const handleShare = () => {
    if (report) {
      const shareUrl = `${window.location.origin}/report/${report.id}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast.success("Share link copied to clipboard!");
      });
    }
  };

  const filteredOutlets =
    report?.outlets?.filter(
      (outlet) =>
        outlet.website_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        outlet.published_url.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <PRReportViewer loading={true} />
        </div>
      </div>
    );
  }

  if (!report && !showEmailDialog) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Report Not Found</h3>
              <p className="text-muted-foreground">
                The report you're looking for doesn't exist or has been removed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      {report && !showEmailDialog && (
        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="container mx-auto">
            <div className="flex justify-center items-center h-16">
              <Image
                src="/guestpost-link.webp"
                alt="PR Reports"
                width={223}
                height={45}
                priority={true}
              />
            </div>
          </div>
        </nav>
      )}
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          {/* <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">PR Report</h1>
            <p className="text-muted-foreground">
              This is a shared press release distribution report
            </p>
          </div> */}

          {/* Email Dialog for Private Reports */}
          {showEmailDialog && (
            <Card className="mb-8 max-w-md mx-auto">
              <CardHeader className="text-center">
                <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <CardTitle>Private Report</CardTitle>
                <CardDescription>
                  This report requires email verification to view the full
                  content. Please enter an authorized email address.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={verifying}
                      className={verifying ? "opacity-50" : ""}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={verifying || !email.trim()}
                  >
                    {verifying ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Verifying Email...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Verify Email & View Report
                      </>
                    )}
                  </Button>
                  {verifying && (
                    <p className="text-sm text-muted-foreground text-center">
                      Verifying your email access...
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          )}

          {/* Report Content */}
          {showFullReport && report && <PRReportViewer report={report} />}
        </div>
      </div>
    </>
  );
}
