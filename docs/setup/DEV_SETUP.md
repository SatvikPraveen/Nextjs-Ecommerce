# Development Setup Guide

Complete guide to setting up the Next.js E-Commerce platform for local development.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Common Issues](#common-issues)
- [Development Workflow](#development-workflow)

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required

- **Node.js** (v20.19 or higher)
  ```bash
  node --version  # Should show v20.19 or higher
  ```
  Download from: https://nodejs.org/

- **npm** (comes with Node.js)
  ```bash
  npm --version  # Should show v9 or higher
  ```

- **PostgreSQL** (v15 or higher)
  ```bash
  psql --version  # Should show 15 or higher
  ```
  Download from: https://www.postgresql.org/download/

- **Git**
  ```bash
  git --version
  ```
  Download from: https://git-scm.com/

### Optional but Recommended

- **Docker Desktop** - For containerized database
  - Download from: https://www.docker.com/products/docker-desktop/

- **Stripe CLI** - For testing webhooks locally
  ```bash
  brew install stripe/stripe-cli/stripe  # macOS
  ```
  Or download from: https://stripe.com/docs/stripe-cli

- **Python 3** - For utility scripts
  ```bash
  python3 --version
  ```

---

## Initial Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Nextjs-Ecommerce
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages listed in `package.json`.

### 3. Python Virtual Environment (Optional)

If you need Python for utility scripts:

```bash
python3 -m venv venv
source venv/bin/activate  # On macOS/Linux
# or
venv\Scripts\activate  # On Windows
```

---

## Database Setup

### Option 1: Using Docker (Recommended)

The easiest way to get started is using Docker Compose:

```bash
# Start PostgreSQL in a container
docker-compose up -d postgres

# Verify it's running
docker ps
```

The database will be available at `postgresql://postgres:postgres@localhost:5432/ecommerce_db`

### Option 2: Local PostgreSQL Installation

If you prefer to use a local PostgreSQL installation:

```bash
# Create a new database
createdb ecommerce_db

# Or using psql
psql postgres
CREATE DATABASE ecommerce_db;
\q
```

### 3. Run Database Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations to create tables
npx prisma migrate deploy

# Or for development (creates migration files)
npx prisma migrate dev

# Seed the database with sample data
npm run db:seed
```

### 4. View Database (Optional)

Open Prisma Studio to view/edit data:

```bash
npm run db:studio
```

This opens a web UI at http://localhost:5555

---

## Environment Configuration

### 1. Create Environment File

```bash
cp .env.example .env
```

### 2. Configure Required Variables

Edit `.env` and set the following **required** variables:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce_db"

# Authentication
NEXTAUTH_SECRET="your-generated-secret"  # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# Stripe (get from https://dashboard.stripe.com/test/apikeys)
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."  # See webhook setup below

# Email (get from https://resend.com/api-keys)
RESEND_API_KEY="re_..."
FROM_EMAIL="noreply@yourdomain.com"

# App
NEXT_PUBLIC_APP_NAME="My Store"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ADMIN_EMAIL="admin@example.com"
```

### 3. Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Copy the output and paste it as the `NEXTAUTH_SECRET` value.

### 4. Set Up Stripe Webhooks (for local testing)

```bash
# Install Stripe CLI if you haven't
brew install stripe/stripe-cli/stripe  # macOS

# Login to your Stripe account
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy the webhook signing secret (starts with whsec_) to .env
```

### 5. Optional: OAuth Providers

If you want to enable Google/GitHub login:

**Google OAuth:**
1. Go to https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID
3. Add to `.env`:
   ```bash
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

**GitHub OAuth:**
1. Go to https://github.com/settings/developers
2. Create New OAuth App
3. Add to `.env`:
   ```bash
   GITHUB_ID="your-github-client-id"
   GITHUB_SECRET="your-github-client-secret"
   ```

---

## Running the Application

### Development Mode

```bash
# Start the development server
npm run dev
```

The app will be available at http://localhost:3000

Features in dev mode:
- Hot reload on file changes
- Detailed error messages
- Source maps for debugging

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Using Docker

```bash
# Build and run everything with Docker
docker-compose up --build

# Run in background
docker-compose up -d

# Stop containers
docker-compose down
```

---

## Testing

### Run All Tests

```bash
npm test
```

### Unit Tests

```bash
# Run once
npm run test:unit

# Watch mode (re-runs on file changes)
npm run test:watch
```

### Accessibility Tests

```bash
npm run test:a11y
```

### End-to-End Tests

```bash
# Run Cypress in headless mode
npm run test:e2e

# Open Cypress UI
npm run test:e2e:open
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
# Check for issues
npm run lint

# Format code
npm run format

# Check formatting without fixing
npm run format:check
```

---

## Common Issues

### Issue: "npm: command not found"

**Solution:** Install Node.js from https://nodejs.org/

### Issue: "Error connecting to database"

**Solutions:**
1. Verify PostgreSQL is running:
   ```bash
   # If using Docker
   docker ps | grep postgres
   
   # If using local PostgreSQL
   pg_isready
   ```
2. Check your `DATABASE_URL` in `.env`
3. Verify credentials are correct

### Issue: "Prisma Client is not generated"

**Solution:**
```bash
npx prisma generate
```

### Issue: "Port 3000 is already in use"

**Solution:**
```bash
# Find and kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Issue: Stripe webhook errors

**Solution:**
1. Make sure Stripe CLI is running:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
2. Copy the webhook secret to `.env`
3. Restart the dev server

### Issue: "Module not found" errors

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

---

## Development Workflow

### 1. Daily Workflow

```bash
# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### 2. Before Committing

```bash
# Run tests
npm test

# Type check
npm run type-check

# Lint
npm run lint

# Format code
npm run format
```

### 3. Database Changes

When modifying the database schema:

```bash
# 1. Edit prisma/schema.prisma

# 2. Create migration
npx prisma migrate dev --name describe_your_change

# 3. Generate Prisma Client
npx prisma generate
```

### 4. Adding New Dependencies

```bash
# Production dependency
npm install package-name

# Development dependency
npm install -D package-name

# Commit package.json and package-lock.json
git add package.json package-lock.json
git commit -m "Add package-name dependency"
```

---

## Useful Commands

### Database

```bash
npm run db:push          # Push schema changes without migration
npm run db:seed          # Seed database with test data
npm run db:studio        # Open Prisma Studio
npm run db:generate      # Generate Prisma Client
```

### Development

```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server
npm run type-check       # TypeScript type checking
npm run lint             # Lint code
npm run format           # Format code with Prettier
```

### Testing

```bash
npm test                 # Run all tests
npm run test:unit        # Unit tests only
npm run test:watch       # Watch mode
npm run test:a11y        # Accessibility tests
npm run test:e2e         # Cypress E2E tests
npm run test:e2e:open    # Cypress UI
```

---

## Next Steps

After setup is complete:

1. **Explore the Admin Dashboard**: http://localhost:3000/admin
   - Create products
   - Manage inventory
   - View orders

2. **Review Documentation**:
   - [README.md](./README.md) - Project overview
   - [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Code organization
   - [MODERNIZATION_2025.md](./MODERNIZATION_2025.md) - Recent updates

3. **Check Test Coverage**:
   ```bash
   npm test -- --coverage
   ```

4. **Start Building**! 🚀

---

## Need Help?

- 📖 Check the [documentation](./README.md)
- 🐛 Found a bug? Open an issue
- 💬 Questions? Start a discussion
- 📧 Contact: admin@yourdomain.com

---

**Happy Coding! 🎉**
