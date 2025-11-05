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
        if (!text.includes('warn') && !text.includes('deprecated')) {
          process.stderr.write(text);
        }
      });
    });
  });
}

async function finalFix() {
  console.log('\n🔧 الإصلاح النهائي وتشغيل التطبيق...\n');
  
  try {
    const NODE_PATH = '/root/.nvm/versions/node/v24.11.0/bin/node';
    const NPM_CLI = '/usr/local/lib/node_modules/npm/bin/npm-cli.js';
    
    // Install dependencies using newly installed npm
    console.log('📦 1/4 - تثبيت Dependencies بـ npm الجديد...');
    await execCommand(`cd ${APP_DIR} && rm -rf node_modules && ${NODE_PATH} ${NPM_CLI} install 2>&1 | tail -20`);
    
    // Kill old processes
    console.log('\n🛑 2/4 - إيقاف العمليات القديمة...');
    await execCommand('pkill -f "node.*dist/index.js" || true');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Start application
    console.log('\n🚀 3/4 - تشغيل التطبيق...');
    const startCmd = `cd ${APP_DIR} && NODE_ENV=production PORT=5000 nohup ${NODE_PATH} dist/index.js > logs/app.log 2>&1 & echo $!`;
    const result = await execCommand(startCmd);
    const pidMatch = result.output.match(/(\d+)/);
    const pid = pidMatch ? pidMatch[0] : 'unknown';
    
    console.log(`   ✅ PID: ${pid}`);
    
    // Wait for startup
    console.log('\n⏳ 4/4 - انتظار بدء التطبيق (15 ثانية)...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    // Test application
    console.log('\n🌐 اختبار التطبيق...\n');
    
    let success = false;
    for (let i = 0; i < 5; i++) {
      const curlResult = await execCommand('curl -s http://localhost:5000 2>&1');
      
      if (curlResult.output.includes('html') || curlResult.output.includes('<!DOCTYPE')) {
        success = true;
        console.log('\n   ✅ التطبيق يستجيب!');
        console.log('\nأول 50 حرف من الاستجابة:');
        console.log(curlResult.output.substring(0, 50) + '...');
        break;
      }
      
      if (i < 4) {
        console.log(`   ⏳ محاولة ${i + 2}/5...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    if (success) {
      console.log('\n╔════════════════════════════════════════════════════════════╗');
      console.log('║            🎉🎉🎉 النشر اكتمل بنجاح! 🎉🎉🎉               ║');
      console.log('╚════════════════════════════════════════════════════════════╝\n');
      console.log(`🌐 التطبيق متاح الآن على:`);
      console.log(`   - http://${SERVER_IP}`);
      console.log(`   - http://mbst.space\n`);
      console.log(`📝 PID: ${pid}`);
      console.log(`📋 Logs: ${APP_DIR}/logs/app.log\n`);
      console.log('🔧 أوامر مفيدة:');
      console.log(`   ssh root@${SERVER_IP} "tail -f ${APP_DIR}/logs/app.log"  - متابعة logs`);
      console.log(`   ssh root@${SERVER_IP} "ps -p ${pid}"  - فحص العملية`);
      console.log(`   ssh root@${SERVER_IP} "kill ${pid}"  - إيقاف التطبيق\n`);
    } else {
      console.log('\n⚠️  التطبيق لا يستجيب. فحص logs الكاملة...\n');
      await execCommand(`tail -150 ${APP_DIR}/logs/app.log || cat ${APP_DIR}/logs/app.log`);
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
  finalFix();
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
