import { CheckCircle, Clock, Globe, Shield, Users, Zap, Award, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const WhyChooseUs = () => {
  const benefits = [
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: "Genuine Manual Distribution",
      description:
        "We do not use any automated service or robot for PR distribution. 100% talented and skilled human work for manual placement on high-authority news sites with personal quality control.",
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "High Authority & Quality Sites",
      description:
        "We only distribute to sites with high authority and quality metrics (DA 50+). Guaranteed placement on major news outlets like Yahoo Finance, Google News, AP News, and 300+ premium media platforms.",
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: "Fast Turnaround Time",
      description:
        "We deliver your PR distribution campaigns within 2-7 business days with complete reports and live links. Rush 24-hour service available for time-sensitive announcements.",
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Experienced PR Team",
      description:
        "Our team has 10+ years of experience delivering high-quality press release services for Fortune 500 companies, agencies, startups, and marketers in 50+ industries worldwide.",
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "100% Scalable Solutions",
      description:
        "Whether you need one press release or hundreds for your clients, we can deliver on time with consistent quality. Special agency packages and bulk pricing available for high-volume needs.",
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
      title: "White Label Reporting",
      description:
        "We offer reseller-friendly white-label reports and PR distribution solutions at competitive prices so agencies can resell with high profit margins and branded deliverables.",
    },
    {
      icon: <Award className="h-8 w-8 text-primary" />,
      title: "Guaranteed Results",
      description:
        "We guarantee placement on our network of premium outlets or your money back. 95% client satisfaction rate with proven track record of successful campaigns across all industries.",
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: "SEO & Digital Marketing Benefits",
      description:
        "Our press releases are optimized for search engines with strategic keyword placement, anchor text optimization, and high-quality backlinks to boost your online authority and rankings.",
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Why Choose GUESTPOSTLINKS for <span className="text-primary">Press Release Distribution?</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
            We help brands amplify their message with high-quality <strong>press release distribution services</strong>.
            Our expert team crafts compelling, newsworthy content and distributes it across major media outlets to
            maximize your brand's visibility, credibility, and search engine rankings.
          </p>
          <div className="mt-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-6 py-3 rounded-full">
              <Award className="h-5 w-5 text-primary" />
              <span className="text-primary font-semibold">Trusted by 1000+ businesses worldwide</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="mb-4">{benefit.icon}</div>
              <h3 className="text-lg font-semibold text-foreground mb-3">{benefit.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gradient-hero text-white rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold mb-4">Ready to Get Featured in Major News?</h3>
            <p className="text-xl mb-6 opacity-90">
              Join thousands of successful businesses who've amplified their brand reach with our professional PR
              distribution services
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button variant="hero" size="xl">
                  Start Your Campaign Today
                </Button>
              </Link>
              <Link href="#testimonials">
                <Button
                  variant="outline"
                  size="xl"
                  className="border-white/30 text-white bg-transparent hover:bg-white/10"
                >
                  View Success Stories
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
