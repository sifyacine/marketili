module.exports = {
  apps: [
    {
      name:      "marketili-api",
      script:    "server.js",
      instances: "max",        // one process per CPU core
      exec_mode: "cluster",
      watch:     false,
      env_production: {
        NODE_ENV: "production",
        PORT:     5000,
      },
      // Restart on crash, back off up to 5 s between retries
      restart_delay:   2000,
      max_restarts:    10,
      // Rotate logs daily, keep 7 days
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file:      "./logs/err.log",
      out_file:        "./logs/out.log",
      merge_logs:      true,
    },
  ],
};
