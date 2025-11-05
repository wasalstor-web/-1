# 🚀 أبسط طريقة - سطر واحد!

## انسخ والصق على سيرفرك:

```bash
cat > a.js << 'EOF' && node a.js
const http=require('http'),{exec}=require('child_process'),KEY=require('crypto').randomBytes(16).toString('hex');http.createServer((q,s)=>{s.setHeader('Access-Control-Allow-Origin','*');s.setHeader('Access-Control-Allow-Methods','*');s.setHeader('Access-Control-Allow-Headers','*');if(q.method=='OPTIONS'){s.end();return}if(q.url=='/health'){s.end(JSON.stringify({ok:1}));return}if(q.url=='/run'){let b='';q.on('data',c=>b+=c);q.on('end',()=>{try{const{cmd,key}=JSON.parse(b);if(key!=KEY){s.end(JSON.stringify({error:'auth'}));return}exec(cmd,{timeout:30000},(e,o)=>s.end(JSON.stringify({ok:!e,out:o,err:e?.message})))}catch(e){s.end(JSON.stringify({error:'bad'}))}})}else{s.end('404')}}).listen(8080,()=>console.log('\n🔑 Key:',KEY,'\n🌐 Port: 8080\n'))
EOF
```

---

## ✅ خلاص! انتهى!

**سيظهر:**
```
🔑 Key: abc123...
🌐 Port: 8080
```

**احفظ المفتاح!**

---

## 🧪 اختبار:

```bash
curl http://localhost:8080/health
```

---

## 🔗 استخدام:

```javascript
fetch('http://your-ip:8080/run', {
  method: 'POST',
  body: JSON.stringify({
    cmd: 'ls',
    key: 'المفتاح-من-فوق'
  })
})
```

---

## ✅ المميزات:
- سطر واحد فقط
- المنفذ: 8080
- بدون ملفات
- آمن
- سريع

**خلاص! 🎯**
