module.exports = {
  apps: [
    {
      name: "frontend",
      cwd: "/opt/OmniFate/frontend",
      script: ".next/standalone/frontend/server.js",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
        BACKEND_URL: "http://127.0.0.1:8003",
      },
      max_memory_restart: "512M",
      autorestart: true,
      watch: false,
    },
    {
      name: "backend",
      cwd: "/opt/OmniFate",
      script: "start_backend.py",
      interpreter: "/usr/bin/python3.9",
      env: {
        PYTHONUNBUFFERED: "1",
      },
      max_memory_restart: "1G",
      autorestart: true,
      watch: false,
      kill_timeout: 10000,
    },
  ],
};
