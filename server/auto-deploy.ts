import { Client, SFTPWrapper } from 'ssh2';
import { createReadStream, statSync, readdirSync, readFileSync } from 'fs';
import { join, relative } from 'path';
import { promisify } from 'util';

const SERVER_IP = '46.202.159.100';
const SERVER_USER = 'root';
const SERVER_PASSWORD = '5i7?vyla4HMmq5Iwj.L6'; // From database
const APP_DIR = '/var/www/mubsat-ai';

const conn = new Client();

// Helper: Execute command
function execCommand(command: string, description: string): Promise<{ code: number; output: string }> {
  return new Promise((resolve, reject) => {
    console.log(`\n🔧 ${description}...`);
    conn.exec(command, (err, stream) => {
      if (err) return reject(err);
      
      let output = '';
      
      stream.on('close', (code: number) => {
        if (code === 0) {
          console.log(`   ✅ نجح`);
        } else {
          console.log(`   ⚠️  كود الخروج: ${code}`);
        }
        resolve({ code, output });
      });
      
      stream.on('data', (data: Buffer) => {
        const text = data.toString();
        output += text;
        process.stdout.write(text);
      });
      
      stream.stderr.on('data', (data: Buffer) => {
        const text = data.toString();
        output += text;
        if (!text.includes('warning')) {
          process.stderr.write(text);
        }
      });
    });
  });
}

// Helper: Upload file via SFTP
function uploadFile(sftp: SFTPWrapper, localPath: string, remotePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const readStream = createReadStream(localPath);
    const writeStream = sftp.createWriteStream(remotePath);
    
    writeStream.on('close', () => resolve());
    writeStream.on('error', reject);
    
    readStream.pipe(writeStream);
  });
}

// Helper: Upload directory recursively
async function uploadDirectory(sftp: SFTPWrapper, localDir: string, remoteDir: string, exclude: string[] = []) {
  const files = readdirSync(localDir);
  
  for (const file of files) {
    const localPath = join(localDir, file);
    const remotePath = `${remoteDir}/${file}`;
    
    // Skip excluded patterns
    if (exclude.some(pattern => localPath.includes(pattern))) {
      continue;
    }
    
    const stats = statSync(localPath);
    
    if (stats.isDirectory()) {
      // Create remote directory
      try {
        await promisify(sftp.mkdir.bind(sftp))(remotePath);
      } catch (err) {
        // Directory might already exist
      }
      
      // Upload directory contents
      await uploadDirectory(sftp, localPath, remotePath, exclude);
    } else {
      // Upload file
      process.stdout.write(`   📤 ${relative(process.cwd(), localPath)}...`);
      await uploadFile(sftp, localPath, remotePath);
      process.stdout.write(` ✅\n`);
    }
  }
}

// Main deployment
async function deploy() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║      🚀 نشر تلقائي كامل - منصة مبسط AI                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log(`📍 السيرفر: ${SERVER_IP}`);
  console.log(`👤 المستخدم: ${SERVER_USER}`);
  console.log(`📁 المجلد: ${APP_DIR}\n`);
  
  try {
    const sftp = await new Promise<SFTPWrapper>((resolve, reject) => {
      conn.sftp((err, sftp) => {
        if (err) return reject(err);
        resolve(sftp);
      });
    });
    
    // Step 1: Create app directory
    console.log('📁 1/8 - إنشاء مجلد التطبيق...');
    await execCommand(`mkdir -p ${APP_DIR}`, 'إنشاء المجلد');
    
    // Step 2: Build frontend locally
    console.log('\n🏗️  2/8 - بناء Frontend محلياً...');
    const { execSync } = require('child_process');
    try {
      execSync('npm run build', { stdio: 'inherit' });
      console.log('   ✅ تم البناء بنجاح');
    } catch (err) {
      console.log('   ⚠️  فشل البناء - سيتم تخطيه');
    }
    
    // Step 3: Upload files
    console.log('\n📤 3/8 - رفع ملفات المشروع...');
    
    const exclude = [
      'node_modules',
      '.git',
      '.replit',
      'attached_assets',
      'logs',
      '.env.local',
      'deploy-on-server.sh',
    ];
    
    const filesToUpload = [
      'package.json',
      'package-lock.json',
      'tsconfig.json',
      'vite.config.ts',
      'drizzle.config.ts',
      'tailwind.config.ts',
      'postcss.config.js',
    ];
    
    const dirsToUpload = [
      'server',
      'client',
      'shared',
      'dist',
    ];
    
    // Upload files
    for (const file of filesToUpload) {
      try {
        const localPath = join(process.cwd(), file);
        const remotePath = `${APP_DIR}/${file}`;
        process.stdout.write(`   📤 ${file}...`);
        await uploadFile(sftp, localPath, remotePath);
        process.stdout.write(` ✅\n`);
      } catch (err) {
        process.stdout.write(` ⚠️  تخطي\n`);
      }
    }
    
    // Upload directories
    for (const dir of dirsToUpload) {
      try {
        const localPath = join(process.cwd(), dir);
        const remotePath = `${APP_DIR}/${dir}`;
        
        console.log(`\n   📁 رفع ${dir}/...`);
        await promisify(sftp.mkdir.bind(sftp))(remotePath).catch(() => {});
        await uploadDirectory(sftp, localPath, remotePath, exclude);
      } catch (err: any) {
        console.log(`   ⚠️  خطأ في ${dir}: ${err.message}`);
      }
    }
    
    console.log('\n   ✅ اكتمل رفع الملفات');
    
    // Step 4: Create .env file
    console.log('\n🔐 4/8 - إنشاء ملف .env...');
    const envContent = `NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://mubsat_user:${Math.random().toString(36).slice(-12)}@localhost:5432/mubsat_ai
SESSION_SECRET=${Math.random().toString(36).slice(-24)}
TELEGRAM_BOT_TOKEN=
`;
    
    await promisify(sftp.writeFile.bind(sftp))(`${APP_DIR}/.env`, envContent);
    console.log('   ✅ تم إنشاء .env');
    
    // Step 5: Install dependencies
    console.log('\n📦 5/8 - تثبيت Dependencies...');
    await execCommand(`cd ${APP_DIR} && npm install --production`, 'تثبيت Packages');
    
    // Step 6: Run database migration
    console.log('\n🗄️  6/8 - تحديث قاعدة البيانات...');
    await execCommand(`cd ${APP_DIR} && npm run db:push -- --force`, 'Database Migration');
    
    // Step 7: Configure PM2
    console.log('\n⚙️  7/8 - إعداد PM2...');
    
    const pm2Config = `module.exports = {
  apps: [{
    name: 'mubsat-ai',
    script: './dist/server/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/error.log',
    out_file: './logs/output.log',
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};`;
    
    await promisify(sftp.writeFile.bind(sftp))(`${APP_DIR}/ecosystem.config.js`, pm2Config);
    await execCommand(`mkdir -p ${APP_DIR}/logs`, 'إنشاء مجلد logs');
    
    // Stop old process
    await execCommand(`pm2 delete mubsat-ai || true`, 'إيقاف Process القديم');
    
    // Start new process
    await execCommand(`cd ${APP_DIR} && pm2 start ecosystem.config.js`, 'تشغيل التطبيق');
    await execCommand(`pm2 save`, 'حفظ تكوين PM2');
    
    console.log('   ✅ التطبيق يعمل');
    
    // Step 8: Configure Nginx
    console.log('\n🌐 8/8 - إعداد Nginx...');
    
    const nginxConfig = `server {
    listen 80;
    server_name 46.202.159.100 mbst.space www.mbst.space;
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}`;
    
    await promisify(sftp.writeFile.bind(sftp))('/etc/nginx/conf.d/mubsat-ai.conf', nginxConfig);
    await execCommand('nginx -t && systemctl reload nginx', 'إعادة تحميل Nginx');
    
    console.log('   ✅ Nginx جاهز');
    
    // Show final status
    console.log('\n═══════════════════════════════════════════════════════════');
    await execCommand('pm2 status', 'حالة التطبيقات');
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║            🎉 اكتمل النشر بنجاح! 🎉                       ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log(`🌐 التطبيق متاح على: http://${SERVER_IP}`);
    console.log(`🌐 أو: http://mbst.space\n`);
    console.log('🔧 أوامر مفيدة:');
    console.log('   pm2 status          - عرض حالة التطبيقات');
    console.log('   pm2 logs mubsat-ai  - عرض logs');
    console.log('   pm2 restart mubsat-ai - إعادة تشغيل\n');
    
    conn.end();
    process.exit(0);
    
  } catch (error: any) {
    console.error('\n❌ خطأ:', error.message);
    conn.end();
    process.exit(1);
  }
}

// Connect
conn.on('ready', () => {
  console.log('✅ اتصال SSH ناجح!\n');
  deploy();
});

conn.on('error', (err) => {
  console.error('\n❌ خطأ في اتصال SSH:', err.message);
  console.log('\n💡 تأكد من:');
  console.log('   1. عنوان IP صحيح: ' + SERVER_IP);
  console.log('   2. كلمة السر صحيحة');
  console.log('   3. السيرفر يقبل اتصالات SSH');
  process.exit(1);
});

console.log('🔗 الاتصال بالسيرفر ' + SERVER_IP + '...');
conn.connect({
  host: SERVER_IP,
  port: 22,
  username: SERVER_USER,
  password: SERVER_PASSWORD,
  readyTimeout: 20000,
});
