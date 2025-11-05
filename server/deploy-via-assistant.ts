import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api/intelligent-assistant';
const SERVER_IP = '46.202.159.100';
const APP_DIR = '/var/www/mubsat-ai';

// كلمة سر قاعدة البيانات المولدة
const DB_PASS = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

async function sendCommand(message: string, description: string) {
  console.log(`\n🔧 ${description}...`);
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        userId: `deploy-${Date.now()}`
      })
    });
    
    const data = await response.json() as any;
    console.log(`   ✅ ${data.message || 'تم'}`);
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return data;
  } catch (error: any) {
    console.error(`   ❌ خطأ: ${error.message}`);
    throw error;
  }
}

async function deploy() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║       🚀 النشر التلقائي عبر Intelligent Assistant         ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log(`📍 السيرفر: ${SERVER_IP}`);
  console.log(`📁 المجلد: ${APP_DIR}`);
  console.log(`🔐 كلمة سر DB: ${DB_PASS}`);
  console.log(`\n⚠️  احفظ كلمة السر! ستحتاجها لاحقاً!\n`);
  
  try {
    // 1. Install PM2
    await sendCommand(
      `اتصل بالسيرفر ${SERVER_IP} ونفذ الأمر: export PATH=/root/.nvm/versions/node/v24.11.0/bin:$PATH && npm install -g pm2`,
      'تثبيت PM2'
    );
    
    // 2. Start PostgreSQL
    await sendCommand(
      `نفذ على السيرفر ${SERVER_IP}: sudo systemctl start postgresql && sudo systemctl enable postgresql`,
      'تشغيل PostgreSQL'
    );
    
    // 3. Create database
    await sendCommand(
      `نفذ على السيرفر ${SERVER_IP}: sudo -u postgres psql -c "CREATE DATABASE mubsat_ai;"`,
      'إنشاء قاعدة البيانات'
    );
    
    // 4. Create user
    await sendCommand(
      `نفذ على السيرفر ${SERVER_IP}: sudo -u postgres psql -c "CREATE USER mubsat_user WITH PASSWORD '${DB_PASS}';"`,
      'إنشاء مستخدم قاعدة البيانات'
    );
    
    // 5. Grant privileges
    await sendCommand(
      `نفذ على السيرفر ${SERVER_IP}: sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE mubsat_ai TO mubsat_user;"`,
      'منح الصلاحيات'
    );
    
    // 6. Create app directory
    await sendCommand(
      `نفذ على السيرفر ${SERVER_IP}: mkdir -p ${APP_DIR}`,
      'إنشاء مجلد التطبيق'
    );
    
    // 7. Create .env file
    await sendCommand(
      `نفذ على السيرفر ${SERVER_IP}: cat > ${APP_DIR}/.env <<EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://mubsat_user:${DB_PASS}@localhost:5432/mubsat_ai
SESSION_SECRET=$(openssl rand -base64 32)
TELEGRAM_BOT_TOKEN=your_bot_token_here
EOF`,
      'إنشاء ملف .env'
    );
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║          ✅ إعداد البنية التحتية اكتمل!                   ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    console.log('📋 الخطوة التالية: رفع ملفات التطبيق');
    console.log('\n💡 استخدم واجهة Intelligent Assistant لرفع الملفات:');
    console.log(`   1. افتح Admin Panel -> Intelligent Assistant`);
    console.log(`   2. اكتب: "ارفع ملفات التطبيق من Replit إلى ${APP_DIR}"`);
    console.log(`   3. ثم: "نفذ npm install && npm run build && pm2 start ecosystem.config.js"`);
    
    console.log('\n🔐 كلمة سر قاعدة البيانات (احفظها!):');
    console.log(`   ${DB_PASS}\n`);
    
  } catch (error: any) {
    console.error('\n❌ خطأ:', error.message);
    process.exit(1);
  }
}

deploy();
