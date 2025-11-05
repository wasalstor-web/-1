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

async function setupAndStart() {
  console.log('\n🚀 تثبيت PM2 وتشغيل التطبيق...\n');
  
  try {
    // Install PM2
    console.log('📦 1/4 - تثبيت PM2...');
    await execCommand('npm install -g pm2');
    
    // Stop old process
    console.log('\n🛑 2/4 - إيقاف Process القديم...');
    await execCommand('pm2 delete mubsat-ai || true');
    
    // Start application
    console.log('\n🚀 3/4 - تشغيل التطبيق...');
    await execCommand(`cd ${APP_DIR} && pm2 start ecosystem.config.js`);
    
    // Save PM2 state
    console.log('\n💾 4/4 - حفظ تكوين PM2...');
    await execCommand('pm2 save');
    await execCommand('pm2 startup systemd -u root --hp /root');
    
    // Show status
    console.log('\n📊 حالة التطبيقات:\n');
    await execCommand('pm2 status');
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║            🎉 التطبيق يعمل الآن! 🎉                       ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log(`🌐 التطبيق متاح على: http://${SERVER_IP}`);
    console.log(`🌐 أو: http://mbst.space\n`);
    
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
  setupAndStart();
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
