"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, X, CircleCheckBig } from "lucide-react";
import { toast } from "sonner";
import { publicPrReportsService } from "@/services/publicPrReports";
import PRReportViewer from "@/components/PRReportViewer";
import ReportNotFound from "@/components/ReportNotFound";
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
          total_semrush_traffic: response?.data?.total_semrush_traffic || 0,
          // Transform distribution_data to outlets format
          outlets: (response.data.distribution_data || []).map((item) => ({
            website_name: item.recipient || "Unknown Outlet",
            published_url: item.url || "",
            potential_reach: item.potential_reach || 0,
            semrush_traffic: item?.semrush_traffic || 0,
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
          toast.success("Email verified successfully!");
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

  // if report is not found and not in email dialog
  // show report not found component
  if (!report && !showEmailDialog) {
    return <ReportNotFound />;
  }

  return (
    <>
      {report && !showEmailDialog && (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
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
      <div className="bg-background">
        <div
          className="container mx-auto py-8 min-h-[calc(100vh-100px)] relative"
          style={{ padding: "15px" }}
        >
          {/* <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">PR Report</h1>
            <p className="text-muted-foreground">
              This is a shared press release distribution report
            </p>
          </div> */}

          {/* Email Dialog for Private Reports */}
          {showEmailDialog && (
            <div className="mb-8 mx-auto max-w-[90vw] sm:max-w-[550px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="bg-slate-100 content-stretch flex flex-col items-start justify-start relative rounded-[14px] size-full">
                <div
                  aria-hidden="true"
                  className="absolute border border-slate-200 border-solid inset-[-1px] pointer-events-none rounded-[15px] shadow-[0px_0px_20px_0px_rgba(52,64,84,0.08)]"
                />
                <div className="bg-white box-border content-stretch flex flex-col gap-5 items-start justify-start p-[20px] relative rounded-[14px] shrink-0 w-full">
                  <div
                    aria-hidden="true"
                    className="absolute border border-slate-200 border-solid inset-[-1px] pointer-events-none rounded-[15px]"
                  />

                  {/* Header Section */}
                  <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
                    <div className="bg-white relative rounded-[10px] shrink-0 size-12">
                      <div
                        aria-hidden="true"
                        className="absolute border border-slate-200 border-solid inset-0 pointer-events-none rounded-[10px]"
                      />
                      <div className="absolute left-1/2 size-7 top-1/2 translate-x-[-50%] translate-y-[-50%]">
                        <Mail className="w-7 h-7 text-slate-600" />
                      </div>
                    </div>
                    {/* <button
                      onClick={() => setShowEmailDialog(false)}
                      className="relative shrink-0 size-6 hover:bg-gray-100 rounded"
                    >
                      <X className="w-6 h-6 text-slate-600" />
                    </button> */}
                  </div>

                  {/* Title and Description */}
                  <div className="content-stretch flex flex-col font-['Inter:Semi_Bold',_sans-serif] font-semibold gap-[5px] items-start justify-start leading-[0] not-italic relative shrink-0 text-[#263145] text-nowrap">
                    <div className="relative shrink-0 text-[18px]">
                      <p className="leading-[normal] text-nowrap whitespace-pre flex items-center">
                        🔓 Access Your PR Report
                      </p>
                    </div>
                    <div className="opacity-50 relative shrink-0 text-[14px]">
                      <p className="leading-[normal] text-nowrap whitespace-pre truncate w-full max-w-[300px] sm:max-w-[520px]">
                        Enter your business email to unlock and view your
                        personalized PR report.
                      </p>
                    </div>
                  </div>

                  {/* Form */}
                  <form
                    onSubmit={handleEmailSubmit}
                    className="content-stretch flex flex-col gap-3 items-start justify-start relative shrink-0 w-full"
                  >
                    <div className="content-stretch flex flex-col gap-6 items-start justify-start relative shrink-0 w-full">
                      <div className="content-stretch flex flex-col gap-2 items-end justify-start relative shrink-0 w-full">
                        <div className="content-stretch flex flex-col gap-2 items-end justify-start relative shrink-0 w-full">
                          <div className="bg-white h-10 relative rounded-[6px] shrink-0 w-full">
                            <div className="box-border content-stretch flex gap-2 h-10 items-center justify-start overflow-clip px-3.5 py-2.5 relative w-full">
                              <div className="basis-0 content-stretch flex gap-2 grow items-center justify-start min-h-px min-w-px relative shrink-0">
                                <div className="basis-0 content-stretch flex gap-2 grow items-end justify-start min-h-px min-w-px relative shrink-0">
                                  <div className="relative shrink-0 size-5">
                                    <Mail className="w-5 h-5 text-slate-600" />
                                  </div>
                                  <input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email address (e.g. name@company.com)"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={verifying}
                                    className={`basis-0 font-['Inter:Regular',_sans-serif] font-normal grow leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[16px] text-slate-600 focus:outline-none ${
                                      verifying ? "opacity-50" : ""
                                    }`}
                                  />
                                </div>
                              </div>
                            </div>
                            <div
                              aria-hidden="true"
                              className="absolute border border-slate-200 border-solid inset-0 pointer-events-none rounded-[6px]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Action Button */}
                <div className="box-border content-stretch flex flex-col gap-5 items-start justify-start p-[20px] relative rounded-bl-[14px] rounded-br-[14px] shrink-0 w-full">
                  <div className="content-stretch flex gap-2.5 items-center justify-end relative shrink-0 w-full">
                    <button
                      onClick={handleEmailSubmit}
                      disabled={verifying || !email.trim()}
                      className="bg-indigo-500 box-border content-stretch flex gap-[5px] items-center justify-center overflow-clip px-[15px] py-2.5 relative rounded-[40px] shrink-0 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                    >
                      <div className="relative shrink-0 size-5">
                        {verifying ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                          <CircleCheckBig className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="css-u7wei flex flex-col font-['Inter:Semi_Bold',_sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-nowrap text-white">
                        <p className="leading-[20px] whitespace-pre">
                          {verifying ? "Verifying..." : "Unlock Report"}
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Report Content */}
          {showFullReport && report && <PRReportViewer report={report} />}
        </div>
      </div>
    </>
  );
}
