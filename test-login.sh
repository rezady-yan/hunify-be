#!/bin/bash

echo "🧪 Testing Hunify Auth Login Endpoint"
echo "=========================================="

# First, register a test user
echo -e "\n📝 Setting up test user..."
curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123"
  }' > /dev/null

# Test 1: Login with username
echo -e "\n✅ Test 1: Login with username"
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "testuser",
    "password": "testpass123"
  }' | python3 -m json.tool

# Test 2: Login with email
echo -e "\n✅ Test 2: Login with email"
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@example.com",
    "password": "testpass123"
  }' | python3 -m json.tool

# Test 3: Wrong password
echo -e "\n❌ Test 3: Wrong password"
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "testuser",
    "password": "wrongpassword"
  }' | python3 -m json.tool

# Test 4: User not found
echo -e "\n❌ Test 4: User not found"
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "nonexistent",
    "password": "testpass123"
  }' | python3 -m json.tool

# Test 5: Missing identifier
echo -e "\n❌ Test 5: Missing identifier"
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "password": "testpass123"
  }' | python3 -m json.tool

# Test 6: Missing password
echo -e "\n❌ Test 6: Missing password"
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "testuser"
  }' | python3 -m json.tool

echo -e "\n=========================================="
echo "✨ Test completed!"
