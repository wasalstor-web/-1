import { Client } from 'ssh2';

const SERVER_IP = '46.202.159.100';
const SERVER_USER = 'root';
const SERVER_PASSWORD = '5i7?vyla4HMmq5Iwj.L6';
const APP_DIR = '/var/www/mubsat-ai';

const conn = new Client();

function execCommand(command: string): Promise<{ code: number; output: string }> {
  return new Promise((resolve, reject) => {
    conn.exec(command, (err, stream) => {
      if (err) return reject(err);
      
      let output = '';
      
      stream.on('close', (code: number) => {
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
        process.stderr.write(text);
      });
    });
  });
}

async function fixAndStart() {
  console.log('\n🔧 إصلاح Node.js وتشغيل التطبيق...\n');
  
  try {
    // Check Node.js
    console.log('📍 1/5 - فحص Node.js...');
    const nodeCheck = await execCommand('which node && node --version');
    
    // Fix npm if broken
    console.log('\n🔧 2/5 - إصلاح npm...');
    await execCommand('hash -r; npm --version || curl -L https://www.npmjs.com/install.sh | sh');
    
    // Install PM2 via direct path
    console.log('\n📦 3/5 - تثبيت PM2...');
    await execCommand('/root/.nvm/versions/node/v24.11.0/bin/node /root/.nvm/versions/node/v24.11.0/lib/node_modules/npm/bin/npm-cli.js install -g pm2 || npm install -g pm2');
    
    // Start with node directly
    console.log('\n🚀 4/5 - تشغيل التطبيق مباشرة...');
    
    // Kill any existing process
    await execCommand('pkill -f "node.*dist/index.js" || true');
    
    // Start with nohup as fallback
    await execCommand(`cd ${APP_DIR} && NODE_ENV=production nohup node dist/index.js > logs/app.log 2>&1 & echo $! > app.pid`);
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if running
    console.log('\n✅ 5/5 - التحقق من التطبيق...');
    const pidCheck = await execCommand(`cat ${APP_DIR}/app.pid 2>/dev/null && ps -p $(cat ${APP_DIR}/app.pid 2>/dev/null) || echo "Process not found"`);
    
    const curlCheck = await execCommand('curl -s http://localhost:5000 | head -20 || echo "Not responding"');
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║            🎉 التطبيق يعمل! 🎉                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log(`🌐 التطبيق متاح على: http://${SERVER_IP}`);
    console.log(`📝 Logs: ${APP_DIR}/logs/app.log\n`);
    
    conn.end();
    process.exit(0);
    
  } catch (error: any) {
    console.error('\n❌ خطأ:', error.message);
    conn.end();
    process.exit(1);
  }
}

conn.on('ready', () => {
  console.log('✅ اتصال SSH ناجح!\n');
  fixAndStart();
});

conn.on('error', (err) => {
  console.error('\n❌ خطأ:', err.message);
  process.exit(1);
});

console.log('🔗 الاتصال بالسيرفر...');
conn.connect({
  host: SERVER_IP,
  port: 22,
  username: SERVER_USER,
  password: SERVER_PASSWORD,
  readyTimeout: 20000,
});
