import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const FAQSection = () => {
  const faqs = [
    {
      question: "What is press release distribution and why do I need it?",
      answer:
        "Press release distribution is the process of sending your company news and announcements to media outlets, journalists, and news websites. It helps increase brand visibility, establish credibility, improve SEO through backlinks, and reach a wider audience. Our distribution service ensures your news reaches major media outlets like Yahoo Finance, Google News, and hundreds of other high-authority sites.",
    },
    {
      question: "How many outlets will my press release be distributed to?",
      answer:
        "We distribute your press release to 300+ premium media outlets, including major news sites, industry publications, and regional media. Each package includes guaranteed placements on high-authority sites with detailed reporting showing exactly where your press release was published with live links.",
    },
    {
      question: "Do you write the press release or do I need to provide it?",
      answer:
        "We offer both options! Our complete package includes professional press release writing by experienced journalists who craft compelling, newsworthy content optimized for media pickup. Alternatively, if you already have a press release, we can review and optimize it before distribution to ensure maximum effectiveness.",
    },
    {
      question: "How long does the distribution process take?",
      answer:
        "Standard distribution takes 3-7 business days from approval to completion. We also offer 24-hour rush delivery for urgent announcements. You'll receive real-time updates during the process and a comprehensive report with all published links once distribution is complete.",
    },
    {
      question: "What kind of reporting do you provide?",
      answer:
        "We provide detailed white-label reports including: list of all media outlets where your PR was published, live links to each publication, potential reach numbers for each outlet, geographic and demographic data, and SEO metrics. Reports are available in PDF, CSV, and our interactive online dashboard format.",
    },
    {
      question: "Can you guarantee media pickup and coverage?",
      answer:
        "Yes! We guarantee placement on our network of 300+ media outlets. While we cannot guarantee earned media coverage (journalists writing original stories), we ensure your press release will be published on major news sites, giving you the credibility and SEO benefits of being featured in mainstream media.",
    },
    {
      question: "What makes your service different from automated PR distribution?",
      answer:
        "We use 100% manual distribution with human oversight at every step. Unlike automated services, our experienced team reviews each press release, selects the most relevant outlets, and ensures proper formatting and optimization for each platform. This results in better placement quality and higher pickup rates.",
    },
    {
      question: "Do you offer industry-specific or geographic targeting?",
      answer:
        "Absolutely! We can target specific industries (tech, healthcare, finance, etc.) and geographic regions (local, national, international). Our team selects the most relevant outlets for your announcement to ensure it reaches your target audience effectively.",
    },
    {
      question: "What if my press release doesn't get published on some outlets?",
      answer:
        "We guarantee publication on our core network of outlets. In the rare case of technical issues preventing publication, we provide alternative placements of equal or higher value. We also offer a satisfaction guarantee - if you're not happy with the results, we'll work to make it right.",
    },
    {
      question: "Can I track the performance of my press release?",
      answer:
        "Yes! Our reporting includes detailed analytics such as potential reach, engagement metrics where available, referral traffic data, and SEO impact measurements. You can monitor how your press release performs across different outlets and track the long-term benefits to your online presence.",
    },
    {
      question: "Do you offer packages for agencies and bulk orders?",
      answer:
        "We offer special pricing and white-label solutions for agencies, PR firms, and businesses needing multiple press releases. Our reseller program includes volume discounts, branded reporting, and dedicated account management. Contact us for custom pricing based on your needs.",
    },
    {
      question: "What types of businesses do you work with?",
      answer:
        "We work with startups, established businesses, agencies, non-profits, and individual professionals across all industries. Whether you're announcing a product launch, company milestone, partnership, or any other newsworthy event, our distribution service can help amplify your message.",
    },
  ];

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <HelpCircle className="h-8 w-8 text-primary" />
            <h2 className="text-4xl font-bold text-foreground">
              Frequently Asked <span className="text-primary">Questions</span>
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get answers to common questions about our press release distribution services
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border-2">
            <CardContent className="p-8">
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
                    <AccordionTrigger className="text-left py-4 hover:no-underline">
                      <span className="font-semibold text-foreground pr-4">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
