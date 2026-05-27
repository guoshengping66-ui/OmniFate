module.exports = {
  apps: [
    {
      name: "frontend",
      cwd: "/opt/OmniFate/frontend",
      script: "node",
      args: "server.js",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      max_memory_restart: "512M",
      autorestart: true,
      watch: false,
    },
    {
      name: "backend",
      cwd: "/opt/OmniFate",
      script: "backend/main.py",
      interpreter: "/usr/bin/python3.9",
      args: "-m uvicorn backend.main:app --host 0.0.0.0 --port 8002",
      env: {
        PYTHONUNBUFFERED: "1",
      },
      max_memory_restart: "1G",
      autorestart: true,
      watch: false,
    },
  ],
};
