import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Eye, Download, BarChart3 } from "lucide-react";
import Link from "next/link";

const ReportingSection = () => {
  const features = [
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: "Detailed Distribution Report",
      description:
        "Get a comprehensive report showing exactly where your PR was published",
    },
    {
      icon: <Eye className="h-8 w-8 text-accent" />,
      title: "Real-time Tracking",
      description:
        "Monitor your press release performance as it gets picked up by media outlets",
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-pr-green" />,
      title: "Reach Analytics",
      description:
        "See the potential reach and engagement metrics for each publication",
    },
    {
      icon: <Download className="h-8 w-8 text-primary" />,
      title: "Export Options",
      description:
        "Download your reports in multiple formats for easy sharing and analysis",
    },
  ];

  return (
    <section id="tools" className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Comprehensive{" "}
            <span className="text-primary">Reporting & Analytics</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Track your press release performance with detailed reports showing
            every publication, reach metrics, and engagement data from 300+
            media outlets
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="text-center hover:shadow-lg transition-shadow duration-300"
            >
              <CardHeader>
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link href="/pr-report">
            <Button variant="outline" size="lg">
              View Sample Report
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ReportingSection;
