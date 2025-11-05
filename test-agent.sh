#!/bin/bash

# سكربت لاختبار AI Agent على سيرفرك
# الاستخدام: ./test-agent.sh

# ======== الإعدادات ========
SERVER_URL="http://localhost:3000"
API_KEY="ضع-المفتاح-هنا"

echo "================================="
echo "🧪 اختبار AI Agent"
echo "================================="
echo ""

# اختبار 1: Health Check
echo "1️⃣ اختبار Health Check..."
curl -s "${SERVER_URL}/health" | jq '.'
echo ""

# اختبار 2: تنفيذ أمر بسيط
echo "2️⃣ اختبار تنفيذ أمر (ls)..."
curl -s -X POST "${SERVER_URL}/execute" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${API_KEY}" \
  -d '{"command": "ls -la"}' | jq '.'
echo ""

# اختبار 3: معلومات النظام
echo "3️⃣ اختبار معلومات النظام..."
curl -s -X POST "${SERVER_URL}/execute" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${API_KEY}" \
  -d '{"command": "uname -a"}' | jq '.'
echo ""

echo "================================="
echo "✅ انتهى الاختبار"
echo "================================="
