import Image from "next/image";

const TrustSignals = () => {
  const mediaLogos = [
    { name: "Yahoo Finance", logo: "/assets/logos/yahoo.png" },
    { name: "Google News", logo: "/assets/logos/google-news.png" },
    { name: "MSN", logo: "/assets/logos/msn.png" },
    { name: "Business Insider", logo: "/assets/logos/business-insider.png" },
    { name: "Benzinga", logo: "/assets/logos/benzinga.png" },
    { name: "AP News", logo: "/assets/logos/ap-news.png" },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Distribute your press release through{" "}
            <span className="text-primary">major news outlets</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Reach millions of readers across top-tier media platforms and news
            sites
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center opacity-70 hover:opacity-100 transition-opacity duration-300">
          {mediaLogos.map((media, index) => (
            <div
              key={index}
              className="flex items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-300"
            >
              <div className="text-center">
                <div className="w-20 h-8 bg-gradient-to-r from-primary/20 to-accent/20 rounded flex items-center justify-center mb-2">
                  <span className="text-xs font-semibold text-gray-600">
                    {media.name.split(" ")[0]}
                  </span>
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  {media.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSignals;
