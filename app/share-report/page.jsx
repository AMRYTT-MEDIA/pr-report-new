import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PRReportViewer from "@/components/PRReportViewer";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const SharedReport = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSharedReport = () => {
      try {
        // Try to load from localStorage first
        const storedReports = localStorage.getItem("sharedReports");
        if (storedReports) {
          const reports = JSON.parse(storedReports);
          const foundReport = reports[id];
          if (foundReport) {
            setReport(foundReport);
          } else {
            setError("Report not found");
          }
        } else {
          setError("Report not found");
        }
      } catch (err) {
        setError("Failed to load report");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadSharedReport();
    } else {
      setError("Invalid report ID");
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <PRReportViewer loading={true} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Report Not Found</h3>
              <p className="text-muted-foreground">
                {error}. The report may have been removed or the link may be
                invalid.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Shared PR Report
          </h1>
          <p className="text-muted-foreground">
            This is a shared press release distribution report
          </p>
        </div>
        <PRReportViewer report={report} />
      </div>
    </div>
  );
};

export default SharedReport;
