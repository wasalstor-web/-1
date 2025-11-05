import http from 'http';

const confirmMessage = 'نعم ابدأ الآن! نفذ كل الخطوات وأعطني تقرير كامل.';

const data = JSON.stringify({
  userId: 'replit-auto-deploy',
  message: confirmMessage
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

console.log('\n✅ إرسال تأكيد للبدء...\n');

const req = http.request(options, (res) => {
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
    process.stdout.write(chunk.toString());
  });
  
  res.on('end', () => {
    console.log('\n\n═══════════════════════════════════════════════');
    console.log('📍 افتح المساعد الذكي لمتابعة التقدم:');
    console.log('   http://localhost:5000/admin/intelligent-assistant');
    console.log('═══════════════════════════════════════════════\n');
  });
});

req.on('error', (error) => {
  console.error('❌ خطأ:', error.message);
});

req.write(data);
req.end();
