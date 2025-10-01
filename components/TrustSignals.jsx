import React from "react";

const trustSignals = [
  { name: "Yahoo Finance", logo: "/website-logos/yahoo.png" },
  { name: "Google News", logo: "/website-logos/google-news.png" },
  { name: "MSN", logo: "/website-logos/msn.png" },
  { name: "Business Insider", logo: "/website-logos/business-insider.png" },
  { name: "Benzinga", logo: "/website-logos/benzinga.png" },
  { name: "AP News", logo: "/website-logos/ap-logo.png" },
];

const TrustSignals = () => (
  <section className="py-16 bg-white">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-20 max-w-7xl 2xl:max-w-8xl 3xl:max-w-9xl">
      <div className="text-center mb-12">
        <h2 className="text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-foreground mb-4">
          Distribute your press release through <span className="text-primary">major news outlets</span>
        </h2>
        <p className="text-lg lg:text-xl xl:text-2xl 2xl:text-3xl text-muted-foreground max-w-4xl mx-auto">
          Reach millions of readers across top-tier media platforms and news sites
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6 lg:gap-8 xl:gap-10 2xl:gap-12 items-center opacity-70 hover:opacity-100 transition-opacity duration-300">
        {trustSignals.map((media, index) => (
          <div
            key={index}
            className="flex items-center justify-center p-3 sm:p-4 lg:p-6 xl:p-8 bg-slate-500 rounded-lg hover:bg-slate-900 transition-colors duration-300"
          >
            <div className="text-center">
              <div className="w-16 h-6 sm:w-20 sm:h-8 lg:w-24 lg:h-10 xl:w-28 xl:h-12 2xl:w-32 2xl:h-14 bg-gradient-to-r from-primary/20 to-accent/20 rounded flex items-center justify-center mb-2">
                <span className="text-xs sm:text-sm lg:text-base xl:text-lg 2xl:text-xl font-semibold text-slate-600">
                  {media.name.split(" ")[0]}
                </span>
              </div>
              <span className="text-xs sm:text-sm lg:text-base xl:text-lg 2xl:text-xl text-slate-500 font-medium">
                {media.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustSignals;
