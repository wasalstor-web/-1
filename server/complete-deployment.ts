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
        if (!text.includes('warn') && !text.includes('deprecated') && !text.includes('TERM')) {
          process.stderr.write(text);
        }
      });
    });
  });
}

async function completeDeployment() {
  console.log('\n🚀 إكمال النشر - منصة مبسط AI\n');
  
  try {
    const NODE_PATH = '/root/.nvm/versions/node/v24.11.0/bin/node';
    
    // Find npm
    console.log('🔍 1/6 - البحث عن npm...');
    const npmLocation = await execCommand('which npm || find /usr -name npm 2>/dev/null | head -1');
    const NPM = npmLocation.output.trim().split('\n')[0] || 'npm';
    console.log(`   ✅ npm موجود في: ${NPM}`);
    
    // Install dependencies
    console.log('\n📦 2/6 - تثبيت Dependencies...');
    await execCommand(`cd ${APP_DIR} && rm -rf node_modules && ${NPM} install 2>&1 | grep -E "(added|removed|changed|up to date)" || echo "Installing..."`);
    
    // Verify installation
    console.log('\n✅ 3/6 - التحقق من التثبيت...');
    const checkZod = await execCommand(`cd ${APP_DIR} && test -d node_modules/zod && echo "zod installed" || echo "zod missing"`);
    console.log(`   ${checkZod.output.trim()}`);
    
    // Kill old processes
    console.log('\n🛑 4/6 - إيقاف العمليات القديمة...');
    await execCommand('pkill -f "node.*mubsat" || true');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Start application
    console.log('\n🚀 5/6 - تشغيل التطبيق...');
    const startCmd = `cd ${APP_DIR} && NODE_ENV=production PORT=5000 nohup ${NODE_PATH} dist/index.js > logs/app.log 2>&1 & echo $!`;
    const result = await execCommand(startCmd);
    const pid = result.output.trim().split('\n').pop()?.trim();
    
    console.log(`   ✅ Process ID: ${pid}`);
    await execCommand(`echo "${pid}" > ${APP_DIR}/app.pid`);
    
    // Wait and test
    console.log('\n⏳ 6/6 - انتظار بدء التطبيق (20 ثانية)...');
    await new Promise(resolve => setTimeout(resolve, 20000));
    
    // Test multiple times
    console.log('\n🌐 اختبار التطبيق...\n');
    let success = false;
    
    for (let i = 0; i < 6; i++) {
      const test = await execCommand('curl -s http://localhost:5000 2>&1 | head -50');
      
      if (test.output.includes('<!DOCTYPE') || test.output.includes('<html') || test.output.includes('<title>')) {
        success = true;
        console.log('\n✅✅✅ التطبيق يستجيب بنجاح!');
        console.log('\n📄 معاينة الاستجابة:');
        console.log(test.output.substring(0, 200));
        break;
      }
      
      console.log(`   محاولة ${i + 1}/6...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    if (success) {
      // Test public access
      console.log('\n🌍 اختبار الوصول العام...');
      const publicTest = await execCommand(`curl -s http://${SERVER_IP} 2>&1 | head -20`);
      
      console.log('\n╔════════════════════════════════════════════════════════════╗');
      console.log('║         🎉🎉🎉 النشر اكتمل بنجاح! 🎉🎉🎉                 ║');
      console.log('╚════════════════════════════════════════════════════════════╝\n');
      console.log('🌐 المنصة متاحة الآن على:');
      console.log(`   📍 http://${SERVER_IP}`);
      console.log(`   📍 http://mbst.space\n`);
      console.log('📊 معلومات التشغيل:');
      console.log(`   🆔 Process ID: ${pid}`);
      console.log(`   📁 المجلد: ${APP_DIR}`);
      console.log(`   📋 Logs: ${APP_DIR}/logs/app.log\n`);
      console.log('🔧 أوامر الإدارة:');
      console.log(`   ssh root@${SERVER_IP} "tail -f ${APP_DIR}/logs/app.log"`);
      console.log(`   ssh root@${SERVER_IP} "ps -ef | grep mubsat"`);
      console.log(`   ssh root@${SERVER_IP} "kill ${pid}"\n`);
    } else {
      console.log('\n⚠️  التطبيق لا يستجيب. فحص logs...\n');
      await execCommand(`tail -200 ${APP_DIR}/logs/app.log 2>&1`);
      
      console.log('\n🔍 فحص العمليات...');
      await execCommand('ps -ef | grep node | grep -v grep');
      
      console.log('\n🔍 فحص node_modules...');
      await execCommand(`ls -la ${APP_DIR}/node_modules | head -20`);
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
  console.log('✅ متصل بالسيرفر\n');
  completeDeployment();
});

conn.on('error', (err) => {
  console.error('\n❌ خطأ في الاتصال:', err.message);
  process.exit(1);
});

console.log('🔗 الاتصال بالسيرفر...');
conn.connect({
  host: SERVER_IP,
  port: 22,
  username: SERVER_USER,
  password: SERVER_PASSWORD,
  readyTimeout: 30000,
});
