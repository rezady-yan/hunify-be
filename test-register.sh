#!/bin/bash

echo "🧪 Testing Hunify Auth Register Endpoint"
echo "=========================================="

# Test 1: Valid registration
echo -e "\n✅ Test 1: Valid registration"
curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
  }' | python3 -m json.tool

# Test 2: Duplicate username
echo -e "\n❌ Test 2: Duplicate username"
curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "jane@example.com",
    "password": "password123"
  }' | python3 -m json.tool

# Test 3: Duplicate email
echo -e "\n❌ Test 3: Duplicate email"
curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "janedoe",
    "email": "john@example.com",
    "password": "password123"
  }' | python3 -m json.tool

# Test 4: Invalid username (too short)
echo -e "\n❌ Test 4: Invalid username (too short)"
curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ab",
    "email": "test@example.com",
    "password": "password123"
  }' | python3 -m json.tool

# Test 5: Invalid email format
echo -e "\n❌ Test 5: Invalid email format"
curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "invalidemail",
    "password": "password123"
  }' | python3 -m json.tool

# Test 6: Password too short
echo -e "\n❌ Test 6: Password too short"
curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser2",
    "email": "test2@example.com",
    "password": "pass"
  }' | python3 -m json.tool

echo -e "\n=========================================="
echo "✨ Test completed!"
