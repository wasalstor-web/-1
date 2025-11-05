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

async function startApp() {
  console.log('\n🚀 تشغيل التطبيق مع PM2...\n');
  
  try {
    // Stop old processes
    console.log('🛑 1/4 - إيقاف العمليات القديمة...');
    await execCommand('pm2 delete mubsat-ai || true');
    await execCommand('pkill -f "node.*dist/index.js" || true');
    
    // Start with PM2
    console.log('\n🚀 2/4 - تشغيل التطبيق...');
    await execCommand(`cd ${APP_DIR} && pm2 start dist/index.js --name mubsat-ai -i 2 --env production`);
    
    // Save PM2 state
    console.log('\n💾 3/4 - حفظ التكوين...');
    await execCommand('pm2 save');
    await execCommand('pm2 startup systemd -u root --hp /root');
    
    // Check status
    console.log('\n📊 4/4 - التحقق من الحالة...');
    await execCommand('pm2 status');
    
    // Wait and test
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('\n🌐 اختبار التطبيق...\n');
    await execCommand('curl -s http://localhost:5000 | head -10');
    
    console.log('\n\n╔════════════════════════════════════════════════════════════╗');
    console.log('║            🎉 التطبيق يعمل بنجاح! 🎉                     ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log(`🌐 متاح على: http://${SERVER_IP}`);
    console.log(`🌐 أو: http://mbst.space\n`);
    console.log('🔧 أوامر مفيدة:');
    console.log('   pm2 status');
    console.log('   pm2 logs mubsat-ai');
    console.log('   pm2 restart mubsat-ai\n');
    
    conn.end();
    process.exit(0);
    
  } catch (error: any) {
    console.error('\n❌ خطأ:', error.message);
    
    // Show logs on error
    console.log('\n📋 فحص logs...\n');
    try {
      await execCommand('pm2 logs mubsat-ai --lines 20 --nostream');
    } catch (e) {
      // Ignore
    }
    
    conn.end();
    process.exit(1);
  }
}

conn.on('ready', () => {
  console.log('✅ اتصال SSH ناجح!\n');
  startApp();
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
