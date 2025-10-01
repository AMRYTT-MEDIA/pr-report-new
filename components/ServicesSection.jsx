import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, Zap, Globe } from "lucide-react";

const ServicesSection = () => {
  const services = [
    {
      icon: <Newspaper className="h-12 w-12 text-pr-green" />,
      title: "Complete PR Distribution Package",
      description: "Professional press release writing and distribution to 300+ major news outlets worldwide",
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
      description: "Access to major newswire networks and premium financial media outlets",
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
      description: "Get your press release distributed within 24 hours for time-sensitive announcements",
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-20 max-w-7xl 2xl:max-w-8xl 3xl:max-w-9xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-foreground mb-6">
            Our <span className="text-primary">Press Release Services</span>
          </h2>
          <p className="text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl text-muted-foreground max-w-4xl mx-auto">
            Comprehensive PR solutions to amplify your brand's voice and reach your target audience through strategic
            media coverage
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 xl:gap-10 2xl:gap-12">
          {services.map((service, index) => (
            <Card
              key={index}
              className="relative border-2 hover:border-primary/20 transition-colors duration-300 hover:shadow-elegant"
            >
              {service.badge && (
                <Badge
                  className={`absolute -top-3 left-4 px-3 py-1 text-xs font-semibold ${
                    service.badge === "Most Popular"
                      ? "bg-pr-green text-white"
                      : service.badge === "Enterprise"
                        ? "bg-primary text-white"
                        : "bg-accent text-white"
                  }`}
                >
                  {service.badge}
                </Badge>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">{service.icon}</div>
                <CardTitle className="text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-foreground">
                  {service.title}
                </CardTitle>
                <CardDescription className="text-base lg:text-lg xl:text-xl 2xl:text-2xl text-muted-foreground">
                  {service.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-pr-green rounded-full mt-2"></div>
                      <span className="text-sm lg:text-base xl:text-lg 2xl:text-xl text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-border">
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center space-x-3 mb-2">
                      <span className="text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-primary">
                        {service.price}
                      </span>
                      {service.originalPrice && (
                        <span className="text-lg lg:text-xl xl:text-2xl 2xl:text-3xl text-muted-foreground line-through">
                          {service.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    className="w-full text-base lg:text-lg xl:text-xl 2xl:text-2xl py-3 lg:py-4 xl:py-5 2xl:py-6"
                    variant={service.badge === "Most Popular" ? "default" : "outline"}
                  >
                    {service.cta}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
