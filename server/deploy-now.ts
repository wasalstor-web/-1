import { Client } from 'ssh2';
import { readFileSync, createReadStream, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const SERVER_IP = '46.202.159.100';
const SERVER_USER = 'root';
const APP_DIR = '/var/www/mubsat-ai';

// SSH Key or Password
const sshConfig: any = {
  host: SERVER_IP,
  port: 22,
  username: SERVER_USER,
  tryKeyboard: true,
};

// Try to use SSH key if available
try {
  const keyPath = process.env.HOME + '/.ssh/id_rsa';
  sshConfig.privateKey = readFileSync(keyPath);
  console.log('✅ استخدام SSH key');
} catch {
  console.log('⚠️  لا يوجد SSH key - سيستخدم password authentication');
}

const conn = new Client();

// Execute command helper
function execCommand(command: string, description: string): Promise<{ code: number; output: string }> {
  return new Promise((resolve, reject) => {
    console.log(`\n🔧 ${description}...`);
    conn.exec(command, (err, stream) => {
      if (err) return reject(err);
      
      let output = '';
      let hasError = false;
      
      stream.on('close', (code: number) => {
        if (code === 0 && !hasError) {
          console.log(`   ✅ نجح`);
        } else {
          console.log(`   ⚠️  انتهى بكود ${code}`);
        }
        resolve({ code, output });
      });
      
      stream.on('data', (data: Buffer) => {
        const text = data.toString();
        output += text;
        // Show important lines only
        if (text.includes('✓') || text.includes('✗') || text.includes('⚠') || text.includes('Password')) {
          process.stdout.write('   ' + text);
        }
      });
      
      stream.stderr.on('data', (data: Buffer) => {
        const text = data.toString();
        output += text;
        if (!text.includes('warning') && !text.includes('deprecated')) {
          hasError = true;
          process.stderr.write('   ⚠️  ' + text);
        }
      });
    });
  });
}

// Main deployment
async function deploy() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║         🚀 بدء النشر المباشر - Mubsat AI           ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log(`📍 السيرفر: ${SERVER_IP}`);
  console.log(`👤 المستخدم: ${SERVER_USER}`);
  console.log(`📁 المجلد: ${APP_DIR}\n`);
  
  try {
    // Upload deploy-on-server.sh
    console.log('📤 رفع deployment script...');
    await new Promise<void>((resolve, reject) => {
      conn.sftp((err, sftp) => {
        if (err) return reject(err);
        
        const localPath = join(process.cwd(), 'deploy-on-server.sh');
        const remotePath = '/tmp/deploy-mubsat.sh';
        
        sftp.fastPut(localPath, remotePath, (err) => {
          if (err) return reject(err);
          console.log('   ✅ تم رفع deploy-on-server.sh');
          resolve();
        });
      });
    });
    
    // Make executable
    await execCommand('chmod +x /tmp/deploy-mubsat.sh', 'جعل Script قابل للتنفيذ');
    
    // Execute deployment
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('   تنفيذ deployment script الكامل');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    const result = await execCommand(
      'bash /tmp/deploy-mubsat.sh 2>&1',
      'تنفيذ النشر'
    );
    
    console.log('\n═══════════════════════════════════════════════════════════');
    
    if (result.code === 0) {
      console.log('\n🎉 النشر اكتمل بنجاح!');
      console.log('\n🌐 التطبيق متاح على: http://' + SERVER_IP);
      console.log('\n🔐 ابحث عن كلمة السر في الـ output أعلاه (سطر أصفر)');
    } else {
      console.log('\n⚠️  هناك بعض المشاكل - تحقق من الـ output');
      console.log('📋 قد تحتاج لتشغيل بعض الخطوات يدوياً');
    }
    
    conn.end();
    process.exit(result.code);
    
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

conn.on('keyboard-interactive', (name, instructions, instructionsLang, prompts, finish) => {
  // Password prompt
  console.log('\n🔑 يرجى إدخال كلمة سر السيرفر...');
  process.stdin.once('data', (password) => {
    finish([password.toString().trim()]);
  });
});

conn.on('error', (err) => {
  console.error('\n❌ خطأ في اتصال SSH:', err.message);
  console.log('\n💡 تأكد من:');
  console.log('   1. عنوان IP صحيح: ' + SERVER_IP);
  console.log('   2. SSH key موجود أو password صحيح');
  console.log('   3. السيرفر يقبل اتصالات SSH');
  process.exit(1);
});

console.log('🔗 الاتصال بالسيرفر ' + SERVER_IP + '...');
conn.connect(sshConfig);
