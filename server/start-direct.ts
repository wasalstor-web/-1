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
  console.log('\n🚀 تشغيل التطبيق مباشرة...\n');
  
  try {
    const NODE_PATH = '/root/.nvm/versions/node/v24.11.0/bin/node';
    
    // Kill old processes
    console.log('🛑 1/5 - إيقاف العمليات القديمة...');
    await execCommand('pkill -f "node.*dist/index.js" || true');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create log directory
    console.log('\n📁 2/5 - إنشاء logs...');
    await execCommand(`mkdir -p ${APP_DIR}/logs`);
    
    // Start application in background
    console.log('\n🚀 3/5 - تشغيل التطبيق...');
    const startCmd = `cd ${APP_DIR} && NODE_ENV=production PORT=5000 nohup ${NODE_PATH} dist/index.js > logs/app.log 2>&1 & echo $!`;
    const result = await execCommand(startCmd);
    const pid = result.output.trim();
    
    console.log(`   PID: ${pid}`);
    
    // Save PID
    await execCommand(`echo "${pid}" > ${APP_DIR}/app.pid`);
    
    // Wait for startup
    console.log('\n⏳ 4/5 - انتظار بدء التطبيق...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check if running
    console.log('\n✅ 5/5 - التحقق من التطبيق...\n');
    await execCommand(`ps -p ${pid} -o pid,cmd || echo "Process not found"`);
    
    // Test with curl
    console.log('\n🌐 اختبار HTTP...\n');
    const curlResult = await execCommand('curl -s http://localhost:5000 | head -20');
    
    if (curlResult.output.includes('html') || curlResult.output.includes('<!DOCTYPE')) {
      console.log('\n╔════════════════════════════════════════════════════════════╗');
      console.log('║            🎉 التطبيق يعمل بنجاح! 🎉                     ║');
      console.log('╚════════════════════════════════════════════════════════════╝\n');
      console.log(`🌐 متاح على: http://${SERVER_IP}`);
      console.log(`🌐 أو: http://mbst.space`);
      console.log(`📝 PID: ${pid}`);
      console.log(`📋 Logs: ${APP_DIR}/logs/app.log\n`);
      console.log('🔧 أوامر مفيدة:');
      console.log(`   ps -p ${pid}          - فحص العملية`);
      console.log(`   tail -f ${APP_DIR}/logs/app.log  - متابعة logs`);
      console.log(`   kill ${pid}           - إيقاف التطبيق\n`);
    } else {
      console.log('\n⚠️  التطبيق لا يستجيب. فحص logs...\n');
      await execCommand(`tail -50 ${APP_DIR}/logs/app.log`);
    }
    
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
