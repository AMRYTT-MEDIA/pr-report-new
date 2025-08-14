import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Simple, Transparent <span className="text-primary">Pricing</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the perfect package for your press release distribution
            needs. All plans include guaranteed placements and detailed
            reporting.
          </p>
          <div className="mt-8">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              🎉 Limited Time: Save up to 50% on all packages
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative border-2 transition-all duration-300 hover:shadow-elegant ${
                plan.badge === "Best Value"
                  ? "border-primary/50 scale-105"
                  : "hover:border-primary/20"
              }`}
            >
              {plan.badge && (
                <Badge
                  className={`absolute -top-3 left-1/2 transform -translate-x-1/2 ${
                    plan.badge === "Best Value" ? "bg-primary" : "bg-accent"
                  } text-white`}
                >
                  {plan.badge}
                </Badge>
              )}

              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    {plan.icon}
                  </div>
                </div>
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  {plan.description}
                </CardDescription>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <span className="text-lg text-muted-foreground line-through">
                    {plan.originalPrice}
                  </span>
                  <span className="text-4xl font-bold text-primary">
                    {plan.price}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-pr-green mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full"
                  variant={plan.badge === "Best Value" ? "default" : "outline"}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary/10 to-pr-green/10 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Need a Custom Solution?
            </h3>
            <p className="text-muted-foreground mb-6">
              We offer tailored packages for enterprise clients, PR agencies,
              and special requirements. Contact us to discuss your specific
              needs and get a custom quote.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="default" size="lg">
                Contact Sales Team
              </Button>
              <Button variant="outline" size="lg">
                Schedule a Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
