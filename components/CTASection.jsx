import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

const CTASection = () => {
  const features = [
    "Guaranteed placement on major news outlets",
    "Professional press release writing included",
    "Complete reporting with live links",
    "3-7 business day turnaround time",
    "24/7 customer support",
    "100% satisfaction guarantee",
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-primary/20 shadow-elegant">
            <CardContent className="p-12 text-center">
              <div className="mb-8">
                <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
                  Ready to Get <span className="text-primary">Featured</span> in Major News?
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Join 1000+ businesses who've amplified their brand reach with our professional press release
                  distribution service
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-10">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 text-left">
                    <CheckCircle className="h-5 w-5 text-pr-green flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/login">
                  <Button variant="cta" size="xl" className="text-lg px-8">
                    Get Started Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#packages">
                  <Button variant="outline" size="xl" className="text-lg px-8">
                    View Pricing Plans
                  </Button>
                </Link>
              </div>

              <p className="text-sm text-muted-foreground mt-6">
                🚀 <strong>Special Offer:</strong> 20% off your first press release campaign. Limited time only!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
