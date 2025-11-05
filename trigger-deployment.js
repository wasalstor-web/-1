#!/usr/bin/env node
/**
 * Trigger Intelligent Assistant Deployment
 * This script sends a deployment command to the Intelligent Assistant API
 */

import http from 'http';

const deploymentCommand = `
ارفع مشروع Mubsat AI كاملاً للسيرفر 46.202.159.100

المهمة:
1. اتصل بالسيرفر root@46.202.159.100
2. جهّز البنية التحتية:
   - PostgreSQL: CREATE DATABASE mubsat_ai; CREATE USER mubsat_user WITH PASSWORD '<generate>';
   - PM2: npm install -g pm2
   - Nginx: اضبط reverse proxy للـ port 5000
3. أنشئ المجلد /var/www/mubsat-ai
4. ارفع ملفات المشروع من هذا الـ Replit workspace
5. أنشئ ملفات الإعدادات:
   - .env (DATABASE_URL, SESSION_SECRET, etc)
   - ecosystem.config.js (PM2 config: 2 instances, cluster mode)
6. نفّذ:
   export PATH=/root/.nvm/versions/node/v24.11.0/bin:$PATH
   npm install
   npm run build
   npm run db:push --force
7. شغّل التطبيق:
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
8. تحقق من http://46.202.159.100

أعطني تقرير تفصيلي كامل بالخطوات والنتائج.
`;

const data = JSON.stringify({
  message: deploymentCommand,
  model: 'gpt-4',
  conversationId: 'deployment-' + Date.now(),
  useVPS: true,
  executeCommands: true
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/intelligent-assistant/execute',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║    🤖 Triggering Intelligent Assistant Deployment         ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log('📤 Sending deployment command to Intelligent Assistant...\n');

const req = http.request(options, (res) => {
  console.log(`✓ Response Status: ${res.statusCode}\n`);
  
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
    // Stream the response as it comes
    process.stdout.write(chunk.toString());
  });
  
  res.on('end', () => {
    console.log('\n\n╔════════════════════════════════════════════════════════════╗');
    console.log('║              Deployment Command Sent                       ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    try {
      const response = JSON.parse(responseData);
      if (response.success) {
        console.log('✅ Success! Check the Intelligent Assistant interface for progress.\n');
      } else {
        console.log('⚠️  Response:', response.message || 'Unknown status\n');
      }
    } catch (e) {
      // If response is streaming or not JSON
      console.log('📋 Response received. Check Intelligent Assistant UI for details.\n');
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ Error connecting to Intelligent Assistant API:', error.message);
  console.log('\n💡 Alternative: Send this command manually to the Intelligent Assistant:\n');
  console.log('─────────────────────────────────────────────────────────────');
  console.log(deploymentCommand);
  console.log('─────────────────────────────────────────────────────────────\n');
  console.log('📍 Steps:');
  console.log('   1. Open http://localhost:5000');
  console.log('   2. Go to Intelligent Assistant (المساعد الذكي)');
  console.log('   3. Paste the command above');
  console.log('   4. Wait for deployment report\n');
});

req.write(data);
req.end();
