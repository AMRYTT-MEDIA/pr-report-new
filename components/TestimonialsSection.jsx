import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Quote } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Director",
      company: "TechStart Inc.",
      image: "/assets/avatars/sarah-johnson.jpg",
      quote:
        "GUESTPOSTLINKS delivered exceptional results for our product launch. We got featured in Yahoo Finance, Google News, and 15+ other major outlets. The ROI was incredible!",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "CEO",
      company: "GrowthCorp",
      image: "/assets/avatars/michael-chen.jpg",
      quote:
        "Professional service from start to finish. Their team helped us craft a compelling story and got us coverage we never thought possible. Highly recommend for any serious PR campaign.",
      rating: 5,
    },
    {
      name: "Emma Davis",
      role: "Founder",
      company: "InnovateLab",
      image: "/assets/avatars/emma-davis.jpg",
      quote:
        "The media coverage we received boosted our credibility instantly. Customers started mentioning they saw us in the news. The quality of outlets was exactly what we needed.",
      rating: 5,
    },
    {
      name: "David Rodriguez",
      role: "Marketing Manager",
      company: "ScaleUp Solutions",
      image: "/assets/avatars/david-rodriguez.jpg",
      quote:
        "Fast turnaround, professional writing, and guaranteed placements. GUESTPOSTLINKS made our announcement reach millions of readers across top news sites. Excellent value!",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            What Our <span className="text-primary">Clients Say</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it - hear from businesses who've
            achieved amazing results with our PR services
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="border-2 hover:border-primary/20 transition-colors duration-300 hover:shadow-lg"
            >
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <Quote className="h-8 w-8 text-primary mt-1 flex-shrink-0" />
                  <p className="text-lg text-muted-foreground italic leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={testimonial.image}
                      alt={testimonial.name}
                    />
                    <AvatarFallback>
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <div className="font-semibold text-foreground">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </div>
                    <div className="flex gap-1 mt-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-sm">
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
