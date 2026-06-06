module.exports = {
  apps: [
    {
      name:      "marketili-api",
      script:    "server.js",
      instances: "max",        
      exec_mode: "cluster",
      watch:     false,
      env_production: {
        NODE_ENV: "production",
        PORT:     5000,
      },
      
      max_memory_restart: "512M",
      
      restart_delay:   2000,
      max_restarts:    10,
      
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file:      "./logs/err.log",
      out_file:        "./logs/out.log",
      merge_logs:      true,
    },
  ],
};
