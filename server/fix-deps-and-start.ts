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
        if (!text.includes('warn')) {
          process.stderr.write(text);
        }
      });
    });
  });
}

async function fixAndStart() {
  console.log('\n🔧 إصلاح Dependencies وتشغيل التطبيق...\n');
  
  try {
    const NODE_PATH = '/root/.nvm/versions/node/v24.11.0/bin/node';
    
    // Re-install dependencies
    console.log('📦 1/4 - إعادة تثبيت Dependencies...');
    await execCommand(`cd ${APP_DIR} && rm -rf node_modules && npm install`);
    
    // Kill old processes
    console.log('\n🛑 2/4 - إيقاف العمليات القديمة...');
    await execCommand('pkill -f "node.*dist/index.js" || true');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Start application
    console.log('\n🚀 3/4 - تشغيل التطبيق...');
    const startCmd = `cd ${APP_DIR} && NODE_ENV=production PORT=5000 nohup ${NODE_PATH} dist/index.js > logs/app.log 2>&1 & echo $!`;
    const result = await execCommand(startCmd);
    const pidMatch = result.output.match(/\d+$/);
    const pid = pidMatch ? pidMatch[0].trim() : '';
    
    console.log(`   ✅ PID: ${pid}`);
    
    // Wait for startup
    console.log('\n⏳ 4/4 - انتظار بدء التطبيق...');
    await new Promise(resolve => setTimeout(resolve, 8000));
    
    // Test with curl (multiple attempts)
    console.log('\n🌐 اختبار HTTP...\n');
    
    let success = false;
    for (let i = 0; i < 3; i++) {
      const curlResult = await execCommand('curl -s http://localhost:5000 2>&1 | head -30');
      
      if (curlResult.output.includes('html') || curlResult.output.includes('<!DOCTYPE') || curlResult.output.includes('<title>')) {
        success = true;
        console.log('\n   ✅ التطبيق يستجيب!');
        break;
      }
      
      if (i < 2) {
        console.log(`   ⏳ محاولة ${i + 2}/3...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    if (success) {
      console.log('\n╔════════════════════════════════════════════════════════════╗');
      console.log('║            🎉 التطبيق يعمل بنجاح! 🎉                     ║');
      console.log('╚════════════════════════════════════════════════════════════╝\n');
      console.log(`🌐 متاح على: http://${SERVER_IP}`);
      console.log(`🌐 أو: http://mbst.space`);
      console.log(`📝 PID: ${pid}`);
      console.log(`📋 Logs: ${APP_DIR}/logs/app.log\n`);
    } else {
      console.log('\n⚠️  التطبيق لا يستجيب بعد. فحص logs...\n');
      await execCommand(`tail -100 ${APP_DIR}/logs/app.log`);
    }
    
    conn.end();
    process.exit(success ? 0 : 1);
    
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
