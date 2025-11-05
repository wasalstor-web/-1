import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface VPSConfig {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  sshKey?: string;
  capabilities: string[];
}

export interface CommandResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTime: number;
}

export class VPSExecutor {
  private vpsConfigs: Map<string, VPSConfig> = new Map();

  constructor() {
    this.initializeVPSConfigs();
  }

  private initializeVPSConfigs() {
    // يمكن تحميل إعدادات VPS من ملف أو قاعدة بيانات
    // هذا مثال افتراضي
    const defaultVPS: VPSConfig = {
      id: 'main-vps',
      name: 'Main VPS Server',
      host: process.env.VPS_HOST || 'localhost',
      port: parseInt(process.env.VPS_PORT || '22'),
      username: process.env.VPS_USERNAME || 'root',
      sshKey: process.env.VPS_SSH_KEY,
      capabilities: ['general', 'web', 'bot', 'database'],
    };

    this.vpsConfigs.set('main-vps', defaultVPS);
  }

  selectVPS(task: string, requirements?: string[]): VPSConfig | null {
    // اختيار VPS المناسب بناءً على المهمة
    for (const [id, config] of Array.from(this.vpsConfigs.entries())) {
      if (requirements) {
        const hasAllCapabilities = requirements.every(req => 
          config.capabilities.includes(req)
        );
        if (hasAllCapabilities) {
          return config;
        }
      } else {
        // إرجاع أول VPS متاح
        return config;
      }
    }
    return null;
  }

  async executeCommand(
    vpsId: string,
    command: string,
    options?: { timeout?: number; cwd?: string }
  ): Promise<CommandResult> {
    const startTime = Date.now();
    
    try {
      const vps = this.vpsConfigs.get(vpsId);
      if (!vps) {
        throw new Error(`VPS غير موجود: ${vpsId}`);
      }

      // في بيئة الإنتاج، نستخدم SSH للاتصال بـ VPS
      // هنا نستخدم تنفيذ محلي للأوامر الآمنة فقط
      const safeCommand = this.validateAndSanitizeCommand(command);
      
      if (!safeCommand) {
        throw new Error('أمر غير آمن أو غير مسموح به');
      }

      const { stdout, stderr } = await execAsync(safeCommand, {
        timeout: options?.timeout || 30000,
        cwd: options?.cwd,
      });

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        output: stdout,
        error: stderr || undefined,
        executionTime,
      };
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error.message || 'فشل تنفيذ الأمر',
        executionTime,
      };
    }
  }

  private validateAndSanitizeCommand(command: string): string | null {
    // قائمة الأوامر المسموح بها (whitelist)
    const allowedCommands = [
      'ls',
      'pwd',
      'whoami',
      'date',
      'echo',
      'cat',
      'grep',
      'find',
      'ps',
      'df',
      'du',
      'uptime',
      'node',
      'npm',
      'pm2',
    ];

    // الأوامر الممنوعة بشدة
    const dangerousPatterns = [
      'rm -rf',
      'dd if=',
      'mkfs',
      'format',
      ':(){:|:&};:',  // fork bomb
      'chmod 777',
      'chown',
      'shutdown',
      'reboot',
      'halt',
    ];

    // التحقق من الأوامر الخطيرة
    for (const pattern of dangerousPatterns) {
      if (command.toLowerCase().includes(pattern)) {
        console.error(`⚠️ محاولة تنفيذ أمر خطير: ${command}`);
        return null;
      }
    }

    // استخراج الأمر الأساسي
    const baseCommand = command.trim().split(' ')[0];
    
    if (!allowedCommands.includes(baseCommand)) {
      console.warn(`⚠️ أمر غير مسموح: ${baseCommand}`);
      return null;
    }

    // تنظيف الأمر من الأحرف الخطيرة
    const sanitized = command
      .replace(/[;&|`$()<>]/g, '') // إزالة الأحرف الخاصة الخطيرة
      .trim();

    return sanitized;
  }

  async executeTask(
    vpsId: string,
    task: {
      name: string;
      commands: string[];
      requiresConfirmation?: boolean;
    }
  ): Promise<CommandResult[]> {
    const results: CommandResult[] = [];

    for (const command of task.commands) {
      console.log(`🔄 تنفيذ: ${command} على VPS: ${vpsId}`);
      const result = await this.executeCommand(vpsId, command);
      results.push(result);

      // إيقاف التنفيذ إذا فشل أمر
      if (!result.success) {
        console.error(`❌ فشل الأمر: ${command}`);
        break;
      }
    }

    return results;
  }

  async healthCheck(vpsId: string): Promise<boolean> {
    try {
      const result = await this.executeCommand(vpsId, 'echo "healthy"', { timeout: 5000 });
      return result.success && (result.output?.includes('healthy') || false);
    } catch {
      return false;
    }
  }

  listAvailableVPS(): VPSConfig[] {
    return Array.from(this.vpsConfigs.values());
  }

  addVPS(config: VPSConfig): void {
    this.vpsConfigs.set(config.id, config);
  }

  removeVPS(vpsId: string): boolean {
    return this.vpsConfigs.delete(vpsId);
  }
}
