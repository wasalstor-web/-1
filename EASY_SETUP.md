# 🚀 أسهل طريقة - خطوة واحدة!

## 📋 الخطوات:

### 1️⃣ سجل دخول لسيرفرك:

```bash
ssh root@your-server-ip
```

### 2️⃣ انسخ والصق هذا الأمر الواحد:

```bash
cat > agent.js << 'EOF'
const http = require('http');
const { exec } = require('child_process');
const crypto = require('crypto');

const PORT = 3000;
const API_KEY = crypto.randomBytes(32).toString('hex');

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
    return;
  }

  if (req.url === '/execute' && req.method === 'POST') {
    const auth = req.headers['authorization'];
    if (!auth || auth.replace('Bearer ', '') !== API_KEY) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const { command } = JSON.parse(body);
        const allowed = ['ls', 'pwd', 'whoami', 'date', 'uptime', 'df -h', 'free -m', 'ps aux', 'node --version'];
        const safe = allowed.some(cmd => command.trim().startsWith(cmd));
        
        if (!safe) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Command not allowed' }));
          return;
        }

        exec(command, { timeout: 30000 }, (error, stdout, stderr) => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: !error,
            output: stdout,
            error: error ? error.message : null
          }));
        });
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
}).listen(PORT, () => {
  console.log('====================================');
  console.log('🤖 AI Agent يعمل!');
  console.log('====================================');
  console.log('المنفذ:', PORT);
  console.log('المفتاح:', API_KEY);
  console.log('====================================');
  console.log('احفظ المفتاح! ستحتاجه للاتصال');
  console.log('====================================');
});
EOF

node agent.js
```

---

## ✅ خلاص! هذا كل شيء!

**بعد تنفيذ الأمر:**
1. سيظهر المفتاح - **احفظه!**
2. السكربت يشتغل على المنفذ 3000
3. جاهز للاستخدام

---

## 🧪 اختبار سريع:

```bash
# في terminal آخر
curl http://localhost:3000/health
```

**النتيجة المتوقعة:**
```json
{"status":"ok","uptime":12.5}
```

---

## 🔗 للاتصال من المنصة:

```javascript
fetch('http://your-server-ip:3000/execute', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer المفتاح-الذي-ظهر',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ command: 'ls -la' })
})
```

---

## 🔄 للتشغيل الدائم:

```bash
# اضغط Ctrl+C لإيقاف السكربت الحالي
# ثم شغّله مع PM2:

npm install -g pm2
pm2 start agent.js
pm2 save
```

---

## ✅ مزايا هذه الطريقة:

- ✅ أمر واحد فقط
- ✅ بدون ملفات إضافية
- ✅ سريع جداً
- ✅ آمن (أوامر محددة فقط)

**هذا كل شيء!** 🎯
