import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { TelegramAIBot } from "./telegram-bot";

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize Telegram Bot first (needed for routes)
  let telegramBot: TelegramAIBot | null = null;
  const isProduction = app.get("env") !== "development";
  
  if (process.env.TELEGRAM_BOT_TOKEN) {
    if (isProduction) {
      // Production: Use Webhook
      // Replit deployments use .repl.co domain
      const webhookUrl = process.env.WEBHOOK_URL || 
        (process.env.REPL_SLUG && process.env.REPL_OWNER 
          ? `https://${process.env.REPL_SLUG}-${process.env.REPL_OWNER}.repl.co`
          : '');
      
      if (webhookUrl) {
        telegramBot = new TelegramAIBot(process.env.TELEGRAM_BOT_TOKEN, webhookUrl);
        log(`🤖 Telegram Bot started in production mode (webhook): ${webhookUrl}`);
      } else {
        log('⚠️ Webhook URL not configured. Set WEBHOOK_URL environment variable for production bot.');
        log('⚠️ Telegram bot disabled in production mode');
      }
    } else {
      // Development: Use Polling
      telegramBot = new TelegramAIBot(process.env.TELEGRAM_BOT_TOKEN);
      log('🤖 Telegram Bot started in development mode (polling)');
    }
  } else {
    log('⚠️ TELEGRAM_BOT_TOKEN not provided. Telegram bot is disabled.');
  }

  // Register routes with Telegram bot instance
  const server = await registerRoutes(app, telegramBot);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    log('Shutting down gracefully...');
    if (telegramBot) {
      telegramBot.stop();
    }
    process.exit(0);
  });
})();
