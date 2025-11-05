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
 * Unified AI Agent (ABI)
 * Server: ${config.serverName}
 * Generated: ${new Date().toISOString()}
 */

const http = require('http');
const { exec } = require('child_process');

class UnifiedAIAgent {
  constructor() {
    this.config = ${JSON.stringify(config, null, 2)};
    this.port = process.env.PORT || 3000;
  }

  async processCommand(command) {
    console.log(\`Processing: \${command}\`);
    
    // تحليل النية
    const intent = await this.analyzeIntent(command);
    
    // تنفيذ الأمر
    const result = await this.executeCommand(intent);
    
    return result;
  }

  async analyzeIntent(command) {
    // تحليل بسيط للنية
    return {
      type: 'command',
      action: command,
      confidence: 0.9,
    };
  }

  async executeCommand(intent) {
    return new Promise((resolve, reject) => {
      exec(intent.action, (error, stdout, stderr) => {
        if (error) {
          resolve({ 
            success: false, 
            error: error.message,
            stderr 
          });
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
      if (req.method === 'POST' && req.url === '/execute') {
        let body = '';
        
        req.on('data', chunk => {
          body += chunk.toString();
        });
        
        req.on('end', async () => {
          try {
            const { command } = JSON.parse(body);
            const result = await this.processCommand(command);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
          } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
          }
        });
      } else if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'healthy', server: '${config.serverName}' }));
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    server.listen(this.port, () => {
      console.log(\`🤖 AI Agent running on port \${this.port}\`);
      console.log(\`Server: ${config.serverName}\`);
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
