import http from 'http';

const deploymentMessage = `قم بنشر deployment كامل لمشروع Mubsat AI على السيرفر 46.202.159.100

الخطوات:
1. اتصل بالسيرفر root@46.202.159.100  
2. أنشئ قاعدة بيانات PostgreSQL اسمها mubsat_ai
3. ثبت PM2 globally
4. أنشئ مجلد var/www/mubsat-ai
5. ارفع كل ملفات المشروع
6. أنشئ ملفات الإعدادات
7. نفذ npm install و npm run build و npm run db:push --force
8. شغل التطبيق بـ PM2 على port 5000
9. اضبط Nginx reverse proxy

أعطني رابط http://46.202.159.100 عند الانتهاء`;

const data = JSON.stringify({
  userId: 'replit-auto-deploy',
  message: deploymentMessage
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/intelligent-assistant/process',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

console.log('\n🤖 إرسال أمر Deployment للمساعد الذكي...\n');

const req = http.request(options, (res) => {
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(responseData);
      console.log('✅ رد المساعد الذكي:\n');
      console.log(JSON.stringify(response, null, 2));
      console.log('\n📍 افتح المساعد الذكي على: http://localhost:5000/admin/intelligent-assistant');
    } catch (e) {
      console.log('📋 الرد:', responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ خطأ:', error.message);
  console.log('\n💡 الحل البديل:');
  console.log('1. افتح http://localhost:5000/admin/intelligent-assistant');
  console.log('2. الصق هذا الأمر:\n');
  console.log(deploymentMessage);
});

req.write(data);
req.end();
