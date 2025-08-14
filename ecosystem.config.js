module.exports = {
  apps: [
    {
      name: "guestpostlinks-pr-boost",
      script: "npm",
      args: "start",
      cwd: "/var/www/guestpostlinks-pr-boost",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
