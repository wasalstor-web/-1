/**
 * PM2 Process Configuration for Mubsat AI Platform
 * This file configures how PM2 manages the application process
 */

module.exports = {
  apps: [
    {
      name: 'mubsat-ai',
      script: 'server/index.ts',
      interpreter: 'node',
      interpreter_args: '--loader tsx',
      instances: 1,
      exec_mode: 'fork',
      
      // Environment variables
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      
      // Restart behavior
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      
      // Logging
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      
      // Advanced features
      min_uptime: '10s',
      max_restarts: 10,
      
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],
  
  // Deployment configuration (optional - for PM2 deploy)
  deploy: {
    production: {
      user: 'root',
      host: '46.202.159.100',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/mubsat-ai.git',
      path: '/var/www/mubsat-ai',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
    },
  },
};
