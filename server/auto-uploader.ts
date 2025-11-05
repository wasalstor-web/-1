/**
 * SmartOps Auto-Uploader
 * Automatically uploads and deploys project files to server via Intelligent Assistant
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

const SERVER_IP = '46.202.159.100';
const SERVER_USER = 'root';
const APP_DIR = '/var/www/mubsat-ai';
const DB_NAME = 'mubsat_ai';
const DB_USER = 'mubsat_user';

interface DeploymentReport {
  status: 'success' | 'failed' | 'partial';
  steps: {
    name: string;
    status: 'success' | 'failed' | 'skipped';
    message: string;
    duration?: number;
  }[];
  errors: string[];
  warnings: string[];
  totalDuration: number;
  finalUrl?: string;
}

export class SmartOpsDeployer {
  private report: DeploymentReport = {
    status: 'success',
    steps: [],
    errors: [],
    warnings: [],
    totalDuration: 0
  };
  
  private startTime = Date.now();

  private async executeRemoteCommand(command: string, description: string): Promise<void> {
    const stepStart = Date.now();
    
    console.log(`\n🔧 ${description}...`);
    
    try {
      const sshCommand = `ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} "${command}"`;
      const { stdout, stderr } = await execAsync(sshCommand, { timeout: 120000 });
      
      const duration = Date.now() - stepStart;
      
      this.report.steps.push({
        name: description,
        status: 'success',
        message: stdout.trim() || 'Command executed successfully',
        duration
      });
      
      console.log(`   ✅ تم (${duration}ms)`);
      if (stderr && !stderr.includes('warning')) {
        console.log(`   ⚠️  ${stderr}`);
        this.report.warnings.push(stderr);
      }
    } catch (error: any) {
      const duration = Date.now() - stepStart;
      const errorMsg = error.message || 'Unknown error';
      
      this.report.steps.push({
        name: description,
        status: 'failed',
        message: errorMsg,
        duration
      });
      
      this.report.errors.push(`${description}: ${errorMsg}`);
      this.report.status = 'partial';
      
      console.error(`   ❌ فشل (${duration}ms): ${errorMsg}`);
    }
  }

  async deploy(): Promise<DeploymentReport> {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║       🚀 SmartOps Auto-Deployment System                  ║');
    console.log('║          منصة مبسط AI - Automatic Upload                  ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    console.log(`📍 Target: ${SERVER_IP}`);
    console.log(`📁 Directory: ${APP_DIR}\n`);
    
    try {
      // Generate secure DB password
      const dbPass = await this.generateSecurePassword();
      console.log(`\n🔐 Generated DB Password: ${dbPass}`);
      console.log(`   ⚠️  Save this password!\n`);
      
      // Step 1: Setup infrastructure
      await this.setupInfrastructure(dbPass);
      
      // Step 2: Upload files
      await this.uploadFiles();
      
      // Step 3: Build and deploy
      await this.buildAndDeploy();
      
      // Calculate total duration
      this.report.totalDuration = Date.now() - this.startTime;
      this.report.finalUrl = `http://${SERVER_IP}`;
      
      // Print final report
      this.printReport();
      
      return this.report;
      
    } catch (error: any) {
      this.report.status = 'failed';
      this.report.errors.push(error.message);
      this.report.totalDuration = Date.now() - this.startTime;
      
      console.error('\n❌ Deployment failed:', error.message);
      this.printReport();
      
      return this.report;
    }
  }

  private async generateSecurePassword(): Promise<string> {
    const { stdout } = await execAsync('openssl rand -base64 32 | tr -d "=+/" | cut -c1-25');
    return stdout.trim();
  }

  private async setupInfrastructure(dbPass: string): Promise<void> {
    console.log('\n═══ Step 1: Setting up infrastructure ═══\n');
    
    // Install PM2
    await this.executeRemoteCommand(
      'export PATH=/root/.nvm/versions/node/v24.11.0/bin:$PATH && npm install -g pm2',
      'Installing PM2'
    );
    
    // Start PostgreSQL
    await this.executeRemoteCommand(
      'sudo systemctl start postgresql && sudo systemctl enable postgresql',
      'Starting PostgreSQL'
    );
    
    // Create database
    await this.executeRemoteCommand(
      `sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME};" 2>/dev/null || true`,
      'Creating database'
    );
    
    await this.executeRemoteCommand(
      `sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${dbPass}';" 2>/dev/null || true`,
      'Creating database user'
    );
    
    await this.executeRemoteCommand(
      `sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"`,
      'Granting database privileges'
    );
    
    // Create app directory
    await this.executeRemoteCommand(
      `mkdir -p ${APP_DIR}`,
      'Creating app directory'
    );
    
    // Create .env file
    const sessionSecret = await this.generateSecurePassword();
    await this.executeRemoteCommand(
      `cat > ${APP_DIR}/.env << EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://${DB_USER}:${dbPass}@localhost:5432/${DB_NAME}
SESSION_SECRET=${sessionSecret}
TELEGRAM_BOT_TOKEN=your_bot_token_here
EOF`,
      'Creating .env file'
    );
    
    // Create PM2 ecosystem config
    await this.executeRemoteCommand(
      `cat > ${APP_DIR}/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'mubsat-ai',
    script: './dist/server/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env: { NODE_ENV: 'production', PORT: 5000 }
  }]
};
EOF`,
      'Creating PM2 config'
    );
  }

  private async uploadFiles(): Promise<void> {
    console.log('\n═══ Step 2: Uploading application files ═══\n');
    
    try {
      // Create tarball
      console.log('📦 Creating deployment package...');
      const projectRoot = path.join(process.cwd());
      
      await execAsync(
        `cd ${projectRoot} && tar czf /tmp/mubsat-deploy.tar.gz ` +
        `--exclude=node_modules --exclude=.git --exclude=dist --exclude=.env .`,
        { timeout: 60000 }
      );
      
      console.log('   ✅ Package created\n');
      
      // Upload tarball
      console.log('📤 Uploading to server...');
      await execAsync(
        `scp -o StrictHostKeyChecking=no /tmp/mubsat-deploy.tar.gz ${SERVER_USER}@${SERVER_IP}:/tmp/`,
        { timeout: 120000 }
      );
      
      console.log('   ✅ Uploaded\n');
      
      // Extract on server
      await this.executeRemoteCommand(
        `cd ${APP_DIR} && tar xzf /tmp/mubsat-deploy.tar.gz && rm /tmp/mubsat-deploy.tar.gz`,
        'Extracting files on server'
      );
      
      this.report.steps.push({
        name: 'Upload files',
        status: 'success',
        message: 'All files uploaded and extracted'
      });
      
    } catch (error: any) {
      this.report.steps.push({
        name: 'Upload files',
        status: 'failed',
        message: error.message
      });
      throw error;
    }
  }

  private async buildAndDeploy(): Promise<void> {
    console.log('\n═══ Step 3: Building and deploying ═══\n');
    
    // Install dependencies
    await this.executeRemoteCommand(
      `cd ${APP_DIR} && export PATH=/root/.nvm/versions/node/v24.11.0/bin:$PATH && npm install`,
      'Installing dependencies'
    );
    
    // Build application
    await this.executeRemoteCommand(
      `cd ${APP_DIR} && export PATH=/root/.nvm/versions/node/v24.11.0/bin:$PATH && npm run build`,
      'Building application'
    );
    
    // Run migrations
    await this.executeRemoteCommand(
      `cd ${APP_DIR} && export PATH=/root/.nvm/versions/node/v24.11.0/bin:$PATH && npm run db:push --force`,
      'Running database migrations'
    );
    
    // Start with PM2
    await this.executeRemoteCommand(
      `cd ${APP_DIR} && export PATH=/root/.nvm/versions/node/v24.11.0/bin:$PATH && pm2 delete mubsat-ai || true && pm2 start ecosystem.config.js && pm2 save`,
      'Starting application with PM2'
    );
    
    // Configure Nginx
    await this.executeRemoteCommand(
      `sudo tee /etc/nginx/conf.d/mubsat-ai.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name ${SERVER_IP};
    client_max_body_size 50M;
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\$host;
    }
}
EOF
sudo nginx -t && sudo systemctl reload nginx`,
      'Configuring Nginx'
    );
  }

  private printReport(): void {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║               📊 Deployment Report                         ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    console.log(`⏱️  Total Duration: ${(this.report.totalDuration / 1000).toFixed(2)}s`);
    console.log(`📊 Status: ${this.report.status.toUpperCase()}\n`);
    
    if (this.report.finalUrl) {
      console.log(`🌐 Application URL: ${this.report.finalUrl}\n`);
    }
    
    console.log('📋 Steps:');
    this.report.steps.forEach((step, i) => {
      const icon = step.status === 'success' ? '✅' : step.status === 'failed' ? '❌' : '⏭️';
      console.log(`   ${i + 1}. ${icon} ${step.name} ${step.duration ? `(${step.duration}ms)` : ''}`);
    });
    
    if (this.report.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.report.warnings.forEach(w => console.log(`   - ${w}`));
    }
    
    if (this.report.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.report.errors.forEach(e => console.log(`   - ${e}`));
    }
    
    console.log('\n' + '═'.repeat(60) + '\n');
  }
}

// Export function for CLI usage
export async function autoDeployNow() {
  const deployer = new SmartOpsDeployer();
  const report = await deployer.deploy();
  
  process.exit(report.status === 'success' ? 0 : 1);
}
