# Hunify Backend - Database Setup

## ✅ Database Connection - PostgreSQL + Drizzle ORM

### 📦 Tech Stack
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Driver:** postgres (for Node.js/Bun)
- **Migration Tool:** drizzle-kit

### 🗄️ Database Schema

#### Table: `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Table: `user_credentials`
```sql
CREATE TABLE user_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Table: `sessions`
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 📁 File Structure
```
src/
├── db/
│   ├── index.ts      # Database connection & instance
│   └── schema.ts     # Drizzle schema definitions
drizzle/
└── 0000_*.sql        # Migration files (auto-generated)
drizzle.config.ts     # Drizzle Kit configuration
```

### 🔌 Database Connection

**Connection String:**
```
postgres://rezady@localhost:5432/hunify_db
```

**Environment Variable:**
```bash
DATABASE_URL=postgres://rezady@localhost:5432/hunify_db
```

### 🛠️ Available Commands

```bash
# Generate migration from schema
bun run db:generate

# Push schema directly to database (for development)
bun run db:push

# Apply migrations
bun run db:migrate

# Open Drizzle Studio (Database GUI)
bun run db:studio
```

### 🚀 Quick Start

1. **Start PostgreSQL:**
   ```bash
   # Make sure PostgreSQL is running
   pg_isready -h localhost -p 5432
   ```

2. **Setup Database:**
   ```bash
   ./setup-db.sh
   ```

3. **Push Schema:**
   ```bash
   bun run db:push
   ```

4. **Start Server:**
   ```bash
   bun run dev
   ```

### 🔍 Query Examples

**Using Drizzle ORM:**

```typescript
import { db } from './db';
import { users, userCredentials } from './db/schema';
import { eq } from 'drizzle-orm';

// Insert user
const [newUser] = await db.insert(users)
  .values({
    username: 'johndoe',
    email: 'john@example.com'
  })
  .returning();

// Find user by email
const [user] = await db.select()
  .from(users)
  .where(eq(users.email, 'john@example.com'))
  .limit(1);

// Update user
await db.update(users)
  .set({ fullName: 'John Doe' })
  .where(eq(users.id, userId));

// Delete user (cascade delete credentials & sessions)
await db.delete(users)
  .where(eq(users.id, userId));
```

### 📝 Notes

- UUID primary keys for better scalability
- ON DELETE CASCADE untuk automatic cleanup
- Timestamps untuk audit trail
- Unique constraints pada email & username
- Password disimpan di table terpisah (user_credentials)
- Sessions tracked dengan JWT token

### 🔐 Security

- Passwords are hashed with bcrypt (salt rounds: 12)
- JWT tokens stored in sessions table
- Foreign key constraints ensure data integrity
- Cascade delete prevents orphaned records
