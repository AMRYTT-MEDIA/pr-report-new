import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PenTool, Target, Send, BarChart3 } from "lucide-react";

const ProcessSection = () => {
  const steps = [
    {
      step: "01",
      title: "Content Creation",
      icon: <PenTool className="h-8 w-8 text-primary" />,
      description:
        "Our expert journalists craft your press release or optimize your existing content for maximum media appeal and SEO impact.",
      details: [
        "Professional writing by experienced journalists",
        "SEO optimization for better search visibility",
        "Newsworthy angle development",
        "Industry-specific formatting",
      ],
    },
    {
      step: "02",
      title: "Strategic Targeting",
      icon: <Target className="h-8 w-8 text-primary" />,
      description:
        "We identify and target the most relevant media outlets based on your industry, audience, and geographic preferences.",
      details: [
        "300+ premium media outlets",
        "Industry-specific targeting",
        "Geographic market selection",
        "Audience demographic matching",
      ],
    },
    {
      step: "03",
      title: "Manual Distribution",
      icon: <Send className="h-8 w-8 text-primary" />,
      description:
        "Unlike automated services, our team manually distributes your press release to ensure proper formatting and maximum pickup rates.",
      details: [
        "100% manual human distribution",
        "Quality control at every step",
        "Personalized outlet selection",
        "Real-time delivery confirmation",
      ],
    },
    {
      step: "04",
      title: "Comprehensive Reporting",
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      description:
        "Receive detailed analytics showing exactly where your press release was published with live links and performance metrics.",
      details: [
        "Live links to all publications",
        "Potential reach calculations",
        "SEO impact measurements",
        "White-label reporting options",
      ],
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Our Proven Process
          </Badge>
          <h2 className="text-4xl font-bold text-foreground mb-6">
            How Our <span className="text-primary">PR Distribution</span> Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From content creation to comprehensive reporting, our streamlined 4-step process ensures maximum impact for
            your press releases
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <Card
              key={index}
              className="relative border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-lg"
            >
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      {step.icon}
                    </div>
                    <Badge variant="outline" className="text-sm font-bold">
                      Step {step.step}
                    </Badge>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-foreground mb-4">{step.title}</h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">{step.description}</p>

                    <ul className="space-y-3">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                          <span className="text-sm text-muted-foreground">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary/10 to-pr-green/10 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">Ready to Get Started?</h3>
            <p className="text-muted-foreground mb-6">
              Our streamlined process ensures your press release gets maximum exposure and impact. Get started today and
              see the difference professional PR distribution makes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Badge variant="default" className="text-lg px-6 py-3">
                🚀 3-7 Day Turnaround
              </Badge>
              <Badge variant="secondary" className="text-lg px-6 py-3">
                ✅ 95% Success Rate
              </Badge>
              <Badge variant="outline" className="text-lg px-6 py-3">
                📊 Detailed Reporting
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
