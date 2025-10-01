const StatsSection = () => {
  const stats = [
    {
      number: "1000+",
      label: "Press Releases Distributed",
      description: "Successfully distributed across major news outlets",
    },
    {
      number: "500+",
      label: "Media Partners",
      description: "Established relationships with top-tier publications",
    },
    {
      number: "10M+",
      label: "Readers Reached",
      description: "Combined monthly readership of our media network",
    },
    {
      number: "95%",
      label: "Pickup Success Rate",
      description: "Average media pickup rate for our press releases",
    },
  ];

  return (
    <section className="py-20 bg-gradient-hero">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">
            Proven Results in <span className="text-accent">PR Distribution</span>
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Our track record speaks for itself - delivering exceptional press release distribution results for
            businesses worldwide
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-8 hover:bg-white/20 transition-colors duration-300"
            >
              <div className="text-4xl lg:text-5xl font-bold text-accent mb-4">{stat.number}</div>
              <h3 className="text-xl font-semibold text-white mb-2">{stat.label}</h3>
              <p className="text-white/80">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
