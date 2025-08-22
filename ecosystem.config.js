// module.exports = {
//   apps: [
//     {
//       name: "guestpostlinks-pr-boost",
//       script: "npm",
//       args: "start",
//       cwd: "/var/www/guestpostlinks-pr-boost",
//       instances: 1,
//       autorestart: true,
//       watch: false,
//       max_memory_restart: "1G",
//       env: {
//         NODE_ENV: "production",
//         PORT: 3000,
//       },
//       env_production: {
//         NODE_ENV: "production",
//         PORT: 3000,
//       },
//     },
//   ],
// };

module.exports = {
  apps: [
    {
      name: "guestpostlinks-pr-report",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 5000",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
      },
      wait_ready: true,
      listen_timeout: 8000,
    },
  ],
};
