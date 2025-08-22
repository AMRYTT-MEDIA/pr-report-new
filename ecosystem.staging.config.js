// ecosystem.staging.config.js
module.exports = {
  apps: [
    {
      name: "guestpostlinks-pr-report-staging",
      script: "server.js",
      env: {
        NODE_ENV: "staging",
        ENV: "staging",
        PORT: 5001,
      },
    },
  ],
};
