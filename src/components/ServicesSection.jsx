import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Newspaper,
  Megaphone,
  TrendingUp,
  Award,
  Zap,
  Globe,
} from "lucide-react";

const ServicesSection = () => {
  const services = [
    {
      icon: <Newspaper className="h-12 w-12 text-pr-green" />,
      title: "Complete PR Distribution Package",
      description:
        "Professional press release writing and distribution to 300+ major news outlets worldwide",
      features: [
        "Professional press release writing by expert journalists",
        "Distribution to 300+ premium media outlets",
        "Guaranteed publication on major news sites",
        "Detailed reporting with published URLs",
        "SEO-optimized content for maximum reach",
        "Real-time delivery confirmation",
        "Geographic and industry targeting",
        "24-hour turnaround available",
      ],
      price: "$299",
      originalPrice: "$599",
      badge: "Most Popular",
      cta: "Get Started Now",
    },
    {
      icon: <Globe className="h-12 w-12 text-primary" />,
      title: "Premium Newswire Distribution",
      description:
        "Access to major newswire networks and premium financial media outlets",
      features: [
        "AP News network distribution",
        "Yahoo Finance guaranteed placement",
        "Google News optimization",
        "Bloomberg terminal inclusion",
        "Reuters network access",
        "MarketWatch feature placement",
        "Business Insider consideration",
        "Premium financial media targeting",
      ],
      price: "$499",
      originalPrice: "$999",
      badge: "Enterprise",
      cta: "Upgrade to Premium",
    },
    {
      icon: <Zap className="h-12 w-12 text-accent" />,
      title: "Rush Distribution Service",
      description:
        "Get your press release distributed within 24 hours for time-sensitive announcements",
      features: [
        "24-hour guaranteed distribution",
        "Priority outlet placement",
        "Emergency PR support",
        "Weekend and holiday service",
        "Real-time progress updates",
        "Dedicated rush coordinator",
        "Same-day reporting delivery",
        "Crisis communication support",
      ],
      price: "$199",
      originalPrice: "$399",
      badge: "Fast Track",
      cta: "Rush My PR",
    },
  ];

  return (
    <section id="services" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Our <span className="text-primary">Press Release Services</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive PR solutions to amplify your brand's voice and reach
            your target audience through strategic media coverage
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card
              key={index}
              className="relative border-2 hover:border-primary/20 transition-colors duration-300 hover:shadow-elegant"
            >
              {service.badge && (
                <Badge
                  className={`absolute -top-3 left-6 ${
                    service.badge === "Most Popular"
                      ? "bg-pr-green"
                      : service.badge === "Enterprise"
                      ? "bg-primary"
                      : "bg-accent"
                  } text-white`}
                >
                  {service.badge}
                </Badge>
              )}

              <CardHeader className="pb-6 text-center">
                <div className="flex flex-col items-center gap-4 mb-4">
                  {service.icon}
                  <div>
                    <CardTitle className="text-2xl mb-2">
                      {service.title}
                    </CardTitle>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg text-muted-foreground line-through">
                        {service.originalPrice}
                      </span>
                      <span className="text-3xl font-bold text-pr-green">
                        {service.price}
                      </span>
                    </div>
                  </div>
                </div>
                <CardDescription className="text-base text-muted-foreground">
                  {service.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-pr-green rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <Button className="w-full" variant="pr-green" size="lg">
                  {service.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary/10 to-pr-green/10 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Need a Custom Solution?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              We offer tailored PR packages for enterprise clients and special
              requirements. Contact us to discuss your specific needs and get a
              custom quote.
            </p>
            <Button variant="outline" size="lg">
              Contact Sales Team
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
