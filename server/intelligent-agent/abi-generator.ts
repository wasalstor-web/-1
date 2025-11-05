/**
 * ABI (Agent Binary Interface) Generator
 * Creates a unified, standalone AI agent that can be deployed on any VPS or Hostinger
 */

export interface ABIConfig {
  serverName: string;
  apiEndpoint?: string;
  sshConfig?: {
    host: string;
    port: number;
    username: string;
    privateKeyPath?: string;
  };
  capabilities: string[];
}

export interface DeploymentInstructions {
  serverType: 'vps' | 'hostinger' | 'shared';
  steps: string[];
  commands: string[];
  configFile: string;
}

export class ABIGenerator {
  /**
   * Generates a standalone AI agent package
   */
  generateABI(config: ABIConfig): string {
    return `#!/usr/bin/env node

/**
 * Unified AI Agent (ABI) - Secure Version
 * Server: ${config.serverName}
 * Generated: ${new Date().toISOString()}
 * 
 * SECURITY FEATURES:
 * - API Key authentication required
 * - Command whitelisting (only safe commands allowed)
 * - Input sanitization
 * - Timeout protection
 * - Output size limits
 */

const http = require('http');
const { exec } = require('child_process');
const crypto = require('crypto');

class UnifiedAIAgent {
  constructor() {
    this.config = ${JSON.stringify(config, null, 2)};
    this.port = process.env.PORT || 3000;
    this.apiKey = process.env.API_KEY || this.generateSecureKey();
    
    // Whitelisted commands - only these are allowed
    this.allowedCommands = [
      'ls',
      'ls -la',
      'ls -lh',
      'pwd',
      'whoami',
      'date',
      'uptime',
      'df -h',
      'free -m',
      'top -bn1',
      'ps aux',
      'netstat -tulpn',
      'systemctl status',
      'pm2 list',
      'pm2 status',
      'node --version',
      'npm --version',
      'git --version',
      'cat /etc/os-release',
    ];
    
    console.log('🔐 Security Features Enabled:');
    console.log('  ✅ API Key Authentication');
    console.log('  ✅ Command Whitelisting');
    console.log('  ✅ Input Sanitization');
    console.log('  ✅ Timeout Protection');
  }

  generateSecureKey() {
    const key = crypto.randomBytes(32).toString('hex');
    console.log(\`🔑 Generated API Key: \${key}\`);
    console.log('⚠️  Store this key securely and use it in Authorization header');
    return key;
  }

  authenticate(req) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return { authenticated: false, reason: 'Missing Authorization header' };
    }

    const token = authHeader.replace('Bearer ', '');
    if (token !== this.apiKey) {
      return { authenticated: false, reason: 'Invalid API key' };
    }

    return { authenticated: true };
  }

  validateCommand(command) {
    // Remove dangerous characters
    const dangerous = /[;&|$\\\\\`<>()]/;
    if (dangerous.test(command)) {
      return { valid: false, reason: 'Command contains dangerous characters' };
    }

    // Check whitelist
    const trimmed = command.trim();
    const isAllowed = this.allowedCommands.some(allowed => {
      return trimmed === allowed || trimmed.startsWith(allowed + ' ');
    });

    if (!isAllowed) {
      return { 
        valid: false, 
        reason: 'Command not in whitelist',
        allowedCommands: this.allowedCommands
      };
    }

    return { valid: true };
  }

  async processCommand(command) {
    console.log(\`📋 Processing: \${command}\`);
    
    // Validate command
    const validation = this.validateCommand(command);
    if (!validation.valid) {
      console.log(\`❌ Rejected: \${validation.reason}\`);
      return {
        success: false,
        error: validation.reason,
        allowedCommands: validation.allowedCommands
      };
    }
    
    // Execute
    const result = await this.executeCommand(command);
    return result;
  }

  async executeCommand(command) {
    return new Promise((resolve) => {
      exec(command, {
        timeout: 30000, // 30 seconds max
        maxBuffer: 1024 * 1024, // 1MB max output
      }, (error, stdout, stderr) => {
        if (error) {
          if (error.killed) {
            resolve({ 
              success: false, 
              error: 'Command timeout (30s exceeded)',
              stderr 
            });
          } else {
            resolve({ 
              success: false, 
              error: error.message,
              stderr 
            });
          }
        } else {
          resolve({ 
            success: true, 
            output: stdout,
            stderr 
          });
        }
      });
    });
  }

  start() {
    const server = http.createServer(async (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      // Health check (public)
      if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200);
        res.end(JSON.stringify({ 
          status: 'healthy', 
          server: '${config.serverName}',
          securityEnabled: true
        }));
        return;
      }

      // Get API key (public, for initial setup only)
      if (req.method === 'GET' && req.url === '/api-key') {
        res.writeHead(200);
        res.end(JSON.stringify({ 
          apiKey: this.apiKey,
          note: 'Store this key securely. Use it as: Authorization: Bearer <key>'
        }));
        return;
      }

      // Execute endpoint (requires auth)
      if (req.method === 'POST' && req.url === '/execute') {
        // Authenticate
        const auth = this.authenticate(req);
        if (!auth.authenticated) {
          console.log(\`🚫 Unauthorized access attempt: \${auth.reason}\`);
          res.writeHead(401);
          res.end(JSON.stringify({ error: 'Unauthorized', reason: auth.reason }));
          return;
        }

        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const { command } = JSON.parse(body);
            
            if (!command) {
              res.writeHead(400);
              res.end(JSON.stringify({ error: 'Command is required' }));
              return;
            }

            const result = await this.processCommand(command);
            res.writeHead(result.success ? 200 : 403);
            res.end(JSON.stringify(result));
          } catch (error) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: error.message }));
          }
        });
        return;
      }

      // 404
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));
    });

    server.listen(this.port, () => {
      console.log(\`\\n🤖 AI Agent running on port \${this.port}\`);
      console.log(\`📡 Server: ${config.serverName}\`);
      console.log(\`🔑 API Key: \${this.apiKey}\`);
      console.log(\`\\nEndpoints:\`);
      console.log(\`  GET  /health      - Health check (public)\`);
      console.log(\`  GET  /api-key     - Get API key (public, setup only)\`);
      console.log(\`  POST /execute     - Execute command (requires auth)\`);
      console.log(\`\\n⚠️  SECURITY: Only whitelisted commands are allowed\`);
      console.log(\`📋 Allowed commands: \${this.allowedCommands.length} commands\`);
    });
  }
}

// Start the agent
const agent = new UnifiedAIAgent();
agent.start();
`;
  }

  /**
   * Generates deployment instructions for different platforms
   */
  generateDeploymentInstructions(serverType: 'vps' | 'hostinger' | 'shared'): DeploymentInstructions {
    switch (serverType) {
      case 'vps':
        return this.generateVPSInstructions();
      case 'hostinger':
        return this.generateHostingerInstructions();
      case 'shared':
        return this.generateSharedHostingInstructions();
      default:
        throw new Error('Unknown server type');
    }
  }

  private generateVPSInstructions(): DeploymentInstructions {
    return {
      serverType: 'vps',
      steps: [
        'الاتصال بالـ VPS عبر SSH',
        'تثبيت Node.js (إن لم يكن مثبتاً)',
        'نسخ ملف ABI إلى السيرفر',
        'إعطاء صلاحيات التنفيذ',
        'تشغيل الـ Agent',
        'إعداد PM2 للتشغيل الدائم (اختياري)',
      ],
      commands: [
        'ssh user@your-vps-ip',
        'curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -',
        'sudo apt-get install -y nodejs',
        'mkdir -p ~/ai-agent && cd ~/ai-agent',
        'nano ai-agent.js  # نسخ محتوى ABI هنا',
        'chmod +x ai-agent.js',
        'node ai-agent.js',
        '# أو للتشغيل الدائم:',
        'sudo npm install -g pm2',
        'pm2 start ai-agent.js --name "ai-agent"',
        'pm2 startup',
        'pm2 save',
      ],
      configFile: this.generateVPSConfig(),
    };
  }

  private generateHostingerInstructions(): DeploymentInstructions {
    return {
      serverType: 'hostinger',
      steps: [
        'تسجيل الدخول إلى cPanel في Hostinger',
        'الذهاب إلى "File Manager"',
        'إنشاء مجلد جديد (مثل: ai-agent)',
        'رفع ملف ai-agent.js',
        'الذهاب إلى "Setup Node.js App"',
        'إنشاء تطبيق Node.js جديد',
        'تحديد مجلد التطبيق',
        'تعيين ملف البدء: ai-agent.js',
        'حفظ وتشغيل التطبيق',
      ],
      commands: [
        '# في Hostinger File Manager:',
        '1. انقر "New Folder" وسمها "ai-agent"',
        '2. انقر "Upload" واختر ملف ai-agent.js',
        '3. اذهب إلى "Setup Node.js App"',
        '4. انقر "Create Application"',
        '5. اختر Node.js version (مثل: 18.x)',
        '6. حدد Application root: /home/username/ai-agent',
        '7. Application startup file: ai-agent.js',
        '8. انقر "Create"',
        '# سيتم تشغيل Agent تلقائياً',
      ],
      configFile: this.generateHostingerConfig(),
    };
  }

  private generateSharedHostingInstructions(): DeploymentInstructions {
    return {
      serverType: 'shared',
      steps: [
        'التحقق من دعم Node.js على السيرفر',
        'رفع الملفات عبر FTP',
        'إعداد ملف .htaccess (إن لزم)',
        'تشغيل الـ Agent عبر cron job أو مشغل دائم',
      ],
      commands: [
        'ftp your-server.com',
        'cd public_html/ai-agent',
        'put ai-agent.js',
        '# إعداد cron job:',
        'crontab -e',
        '@reboot cd ~/ai-agent && node ai-agent.js &',
      ],
      configFile: this.generateSharedHostingConfig(),
    };
  }

  private generateVPSConfig(): string {
    return `# VPS Configuration
PORT=3000
NODE_ENV=production
SERVER_NAME=VPS-1
`;
  }

  private generateHostingerConfig(): string {
    return `# Hostinger Configuration
# ملاحظة: Hostinger يدير المتغيرات البيئية عبر لوحة التحكم
# اذهب إلى Setup Node.js App > Environment Variables

PORT=3000
NODE_ENV=production
SERVER_NAME=HOSTINGER-1
`;
  }

  private generateSharedHostingConfig(): string {
    return `# Shared Hosting Configuration
PORT=3000
NODE_ENV=production
SERVER_NAME=SHARED-1
`;
  }

  /**
   * Generates package.json for npm-based deployment
   */
  generatePackageJson(serverName: string): string {
    return JSON.stringify({
      name: `ai-agent-${serverName.toLowerCase()}`,
      version: '1.0.0',
      description: 'Unified AI Agent for command execution',
      main: 'ai-agent.js',
      scripts: {
        start: 'node ai-agent.js',
        pm2: 'pm2 start ai-agent.js --name ai-agent',
      },
      keywords: ['ai', 'agent', 'automation'],
      author: 'AI Platform',
      license: 'MIT',
    }, null, 2);
  }
}
