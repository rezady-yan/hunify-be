#!/bin/bash

echo "🗄️  Setting up Hunify Database"
echo "================================"

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
  echo "❌ PostgreSQL is not running on localhost:5432"
  echo "Please start PostgreSQL first:"
  echo "  - macOS (Homebrew): brew services start postgresql@14"
  echo "  - Linux: sudo systemctl start postgresql"
  echo "  - Or use Docker: docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres"
  exit 1
fi

# Get current user
CURRENT_USER=$(whoami)

echo "📝 Current system user: $CURRENT_USER"
echo ""

# Try to create database
echo "🔨 Creating database 'hunify_db'..."

# Try with current user first
if psql -h localhost -U "$CURRENT_USER" -lqt | cut -d \| -f 1 | grep -qw hunify_db; then
  echo "✅ Database 'hunify_db' already exists"
else
  # Try to create with current user
  if createdb -h localhost -U "$CURRENT_USER" hunify_db 2>/dev/null; then
    echo "✅ Database 'hunify_db' created with user: $CURRENT_USER"
  else
    # Try with postgres user
    echo "⚠️  Failed with current user, trying with 'postgres' user..."
    if createdb -h localhost -U postgres hunify_db 2>/dev/null; then
      echo "✅ Database 'hunify_db' created with user: postgres"
    else
      echo "❌ Failed to create database"
      echo ""
      echo "Please create the database manually:"
      echo "  psql -h localhost -U $CURRENT_USER -c 'CREATE DATABASE hunify_db;'"
      echo ""
      echo "Or specify correct username in drizzle.config.ts"
      exit 1
    fi
  fi
fi

echo ""
echo "================================"
echo "✨ Setup completed!"
echo ""
echo "📝 Next steps:"
echo "  1. Update drizzle.config.ts with your PostgreSQL credentials"
echo "  2. Run: bun run db:push"
