import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

const HeroSection = () => {
  return (
    <section className="bg-gradient-hero text-white py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-600/20"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <Badge
              variant="secondary"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              🚀 Premium PR Distribution Service
            </Badge>

            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Get Featured on
                <span className="block text-accent"> Top News Sites</span>
                with Our PR Service
              </h1>

              <p className="text-xl lg:text-2xl text-white/90 leading-relaxed">
                Boost your <strong>brand credibility</strong>,{" "}
                <strong>media coverage</strong>, and{" "}
                <strong>online authority</strong> with professional press
                release distribution to major news outlets, reaching millions of
                readers.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button variant="hero" size="xl">
                  GET STARTED
                </Button>
                <Button
                  variant="outline"
                  size="xl"
                  className="border-white/30 text-white bg-transparent hover:bg-white/10"
                >
                  View PR Packages
                </Button>
              </div>
            </div>
          </div>

          <div className="relative">
            <Image
              src="/logos/pr-service-hero.png"
              alt="Professional PR Service Illustration"
              width={600}
              height={400}
              className="w-full h-auto rounded-lg shadow-elegant"
            />
          </div>
        </div>
      </div>

      {/* Decorative wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-20 text-white"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V120L1200,120V0C1200,0 800,80 400,40C200,20 0,60 0,0Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
