import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Zap, Crown } from "lucide-react";

const PricingSection = () => {
  const plans = [
    {
      name: "Starter Package",
      icon: <Zap className="h-6 w-6" />,
      price: "$149",
      originalPrice: "$299",
      description: "Perfect for small businesses and startups",
      badge: "Most Popular",
      features: [
        "Distribution to 150+ media outlets",
        "Professional press release writing",
        "Google News inclusion",
        "Yahoo Finance placement",
        "Basic reporting with live links",
        "3-5 day turnaround",
        "Email support",
        "SEO-optimized content",
      ],
      cta: "Get Started",
    },
    {
      name: "Professional Package",
      icon: <Star className="h-6 w-6" />,
      price: "$299",
      originalPrice: "$599",
      description: "Ideal for growing businesses and agencies",
      badge: "Best Value",
      features: [
        "Distribution to 300+ media outlets",
        "Expert press release writing & editing",
        "Premium media placements",
        "AP News network inclusion",
        "Enhanced reporting & analytics",
        "Industry-specific targeting",
        "2-3 day turnaround",
        "Priority phone & email support",
        "Social media optimization",
        "White-label reporting available",
      ],
      cta: "Choose Professional",
    },
    {
      name: "Enterprise Package",
      icon: <Crown className="h-6 w-6" />,
      price: "$499",
      originalPrice: "$999",
      description: "For large companies and PR agencies",
      badge: "Premium",
      features: [
        "Distribution to 500+ premium outlets",
        "Dedicated PR specialist",
        "Custom press release strategy",
        "Major newswire network access",
        "Comprehensive analytics dashboard",
        "Geographic & demographic targeting",
        "24-hour rush delivery available",
        "Dedicated account manager",
        "Custom reporting & branding",
        "API access for agencies",
        "Bulk pricing available",
        "Media contact follow-up",
      ],
      cta: "Contact Sales",
    },
  ];

  return (
    <section id="packages" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-20 max-w-7xl 2xl:max-w-8xl 3xl:max-w-9xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-foreground mb-6">
            Simple, Transparent <span className="text-primary">Pricing</span>
          </h2>
          <p className="text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl text-muted-foreground max-w-4xl mx-auto">
            Choose the perfect package for your press release distribution needs. All plans include guaranteed
            placements and detailed reporting.
          </p>
          <div className="mt-8">
            <Badge
              variant="secondary"
              className="text-lg lg:text-xl xl:text-2xl 2xl:text-3xl px-4 lg:px-6 xl:px-8 2xl:px-10 py-2 lg:py-3 xl:py-4 2xl:py-5"
            >
              🎉 Limited Time: Save up to 50% on all packages
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 xl:gap-10 2xl:gap-12 max-w-7xl 2xl:max-w-8xl 3xl:max-w-9xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative border-2 transition-all duration-300 hover:shadow-elegant ${
                plan.badge === "Most Popular"
                  ? "border-primary/30 hover:border-primary/50 scale-105"
                  : "border-border hover:border-primary/20"
              }`}
            >
              {plan.badge && (
                <Badge
                  className={`absolute -top-3 left-4 px-3 py-1 text-xs font-semibold ${
                    plan.badge === "Most Popular"
                      ? "bg-primary text-white"
                      : plan.badge === "Best Value"
                        ? "bg-pr-green text-white"
                        : "bg-accent text-white"
                  }`}
                >
                  {plan.badge}
                </Badge>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">{plan.icon}</div>
                </div>
                <CardTitle className="text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-foreground">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-base lg:text-lg xl:text-xl 2xl:text-2xl text-muted-foreground">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center space-x-3 mb-2">
                    <span className="text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-primary">
                      {plan.price}
                    </span>
                    {plan.originalPrice && (
                      <span className="text-lg lg:text-xl xl:text-2xl 2xl:text-3xl text-muted-foreground line-through">
                        {plan.originalPrice}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-pr-green flex-shrink-0 mt-0.5" />
                      <span className="text-sm lg:text-base xl:text-lg 2xl:text-xl text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className={`w-full text-base lg:text-lg xl:text-xl 2xl:text-2xl py-3 lg:py-4 xl:py-5 2xl:py-6 ${
                    plan.badge === "Most Popular"
                      ? "bg-primary hover:bg-primary/90"
                      : "bg-foreground hover:bg-foreground/90"
                  }`}
                  variant={plan.badge === "Most Popular" ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
