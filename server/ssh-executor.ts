// @ts-ignore - ssh2 doesn't have types
import { Client } from 'ssh2';
import type { Server } from '@shared/schema';

export interface SSHExecutionResult {
  success: boolean;
  output: string;
  exitCode: number;
  error?: string;
}

export class SSHExecutor {
  async executeCommand(server: Server, command: string): Promise<SSHExecutionResult> {
    if (!server.sshEnabled) {
      return {
        success: false,
        output: '',
        exitCode: -1,
        error: 'SSH غير مفعل لهذا السيرفر'
      };
    }

    if (!server.sshHost || !server.sshUsername) {
      return {
        success: false,
        output: '',
        exitCode: -1,
        error: 'معلومات SSH غير مكتملة'
      };
    }

    return new Promise((resolve) => {
      const conn = new Client();
      let output = '';
      let errorOutput = '';

      const timeout = setTimeout(() => {
        conn.end();
        resolve({
          success: false,
          output: errorOutput || output,
          exitCode: -1,
          error: 'انتهت مهلة الاتصال (30 ثانية)'
        });
      }, 30000);

      conn.on('ready', () => {
        conn.exec(command, (err: any, stream: any) => {
          if (err) {
            clearTimeout(timeout);
            conn.end();
            resolve({
              success: false,
              output: '',
              exitCode: -1,
              error: `خطأ في تنفيذ الأمر: ${err.message}`
            });
            return;
          }

          stream.on('close', (code: number) => {
            clearTimeout(timeout);
            conn.end();
            resolve({
              success: code === 0,
              output: output || errorOutput,
              exitCode: code,
              error: code !== 0 ? errorOutput : undefined
            });
          });

          stream.on('data', (data: Buffer) => {
            output += data.toString();
          });

          stream.stderr.on('data', (data: Buffer) => {
            errorOutput += data.toString();
          });
        });
      });

      conn.on('error', (err: any) => {
        clearTimeout(timeout);
        resolve({
          success: false,
          output: '',
          exitCode: -1,
          error: `خطأ في الاتصال: ${err.message}`
        });
      });

      const connectionConfig: any = {
        host: server.sshHost,
        port: server.sshPort || 22,
        username: server.sshUsername,
        readyTimeout: 10000,
      };

      if (server.sshPrivateKey) {
        connectionConfig.privateKey = server.sshPrivateKey;
      } else if (server.sshPassword) {
        connectionConfig.password = server.sshPassword;
      } else {
        clearTimeout(timeout);
        resolve({
          success: false,
          output: '',
          exitCode: -1,
          error: 'يجب توفير كلمة مرور أو مفتاح خاص'
        });
        return;
      }

      try {
        conn.connect(connectionConfig);
      } catch (err: any) {
        clearTimeout(timeout);
        resolve({
          success: false,
          output: '',
          exitCode: -1,
          error: `خطأ في الاتصال: ${err.message}`
        });
      }
    });
  }

  async testConnection(server: Server): Promise<boolean> {
    const result = await this.executeCommand(server, 'echo "SSH_TEST_OK"');
    return result.success && result.output.includes('SSH_TEST_OK');
  }
}

export const sshExecutor = new SSHExecutor();
