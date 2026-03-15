#!/bin/bash

echo "🧪 Testing Complete Auth Flow (Register + Login)"
echo "=================================================="

# Step 1: Register
echo -e "\n📝 Step 1: Register new user"
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "demouser",
    "email": "demo@example.com",
    "password": "demo12345"
  }')
echo "$REGISTER_RESPONSE" | python3 -m json.tool

# Step 2: Login with username
echo -e "\n🔐 Step 2: Login with username"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "demouser",
    "password": "demo12345"
  }')
echo "$LOGIN_RESPONSE" | python3 -m json.tool

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])" 2>/dev/null)

if [ ! -z "$TOKEN" ]; then
  echo -e "\n✅ Token received:"
  echo "$TOKEN"
  echo -e "\n💡 You can use this token for authenticated requests"
fi

echo -e "\n=================================================="
echo "✨ Test completed!"
