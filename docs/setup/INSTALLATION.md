# 🚀 Complete Environment Setup Guide

This guide will help you install everything needed to run the Next.js E-Commerce project on macOS.

## 🎯 Quick Automated Setup (Recommended)

Run this one command to install everything automatically:

```bash
bash scripts/setup-dev-environment.sh
```

This script will install:
- ✅ Homebrew (package manager)
- ✅ Node.js v20+ and npm
- ✅ PostgreSQL 15
- ✅ Git
- ✅ Project dependencies
- ✅ Database setup (optional)

---

## 📋 Manual Installation (Step-by-Step)

If you prefer to install manually or the script fails, follow these steps:

### 1. Install Homebrew (Package Manager)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**For Apple Silicon Macs (M1/M2/M3), add to PATH:**
```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

**Verify:**
```bash
brew --version
```

### 2. Install Node.js v20+ (Required)

```bash
# Install Node.js 20 LTS
brew install node@20

# Link it
brew link node@20

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show v10.x.x
```

**Alternative: Download installer from https://nodejs.org/**

### 3. Install PostgreSQL 15 (Database)

**Option A: Using Homebrew**
```bash
# Install PostgreSQL 15
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Add to PATH
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zprofile
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"

# Verify
psql --version
```

**Option B: Using Docker (Easier)**
```bash
# Install Docker Desktop from https://www.docker.com/products/docker-desktop
# Or using Homebrew:
brew install --cask docker

# Start PostgreSQL in Docker (included in docker-compose.yml)
# See step 6 below
```

### 4. Install Git (Version Control)

```bash
brew install git

# Verify
git --version
```

### 5. Install Project Dependencies

```bash
# Navigate to project folder
cd /Users/satvikpraveen/Desktop/Nextjs-Ecommerce

# Install npm packages
npm install
```

This will install all dependencies from `package.json` including:
- Next.js 15
- React 18
- Prisma (database ORM)
- Stripe SDK
- Testing libraries
- And more...

### 6. Set Up Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit the file with your configuration
nano .env
# Or use any text editor: code .env, vim .env, etc.
```

**Required variables to configure:**

```bash
# Database (if using Docker, use this)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce_db"

# Generate this secret
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# Get from https://dashboard.stripe.com/test/apikeys
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Get from https://resend.com/api-keys
RESEND_API_KEY="re_..."
FROM_EMAIL="noreply@yourdomain.com"

# App settings
NEXT_PUBLIC_APP_NAME="My Store"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ADMIN_EMAIL="admin@example.com"
```

### 7. Initialize Database

**Option A: Using Docker (Recommended)**
```bash
# Start PostgreSQL
docker-compose up -d postgres

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database with sample data
npm run db:seed
```

**Option B: Using Local PostgreSQL**
```bash
# Create database
createdb ecommerce_db

# Or using psql
psql postgres
CREATE DATABASE ecommerce_db;
\q

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npm run db:seed
```

### 8. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser! 🎉

---

## 🛠️ Optional Tools

### Stripe CLI (for webhook testing)
```bash
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### VS Code (Recommended Editor)
```bash
brew install --cask visual-studio-code
```

### Python 3 (for utility scripts)
```bash
brew install python3

# Create virtual environment
python3 -m venv venv
source venv/bin/activate
```

---

## 🔍 Verify Installation

Run this to check everything is installed:

```bash
# Check Node.js
node --version    # Should be v20.x.x or higher
npm --version     # Should be v10.x.x or higher

# Check PostgreSQL
psql --version    # Should be 15.x

# Check Docker (optional)
docker --version

# Check Git
git --version

# Check Python (optional)
python3 --version

# Check project dependencies
npm list --depth=0
```

---

## 🚀 Quick Start Commands

```bash
# Using Make (recommended)
make setup         # Complete setup
make db-setup      # Database setup
make dev           # Start development

# Using npm
npm install        # Install dependencies
npm run dev        # Start dev server
npm test           # Run tests
npm run build      # Build for production
```

---

## 🆘 Troubleshooting

### "npm: command not found"
- Node.js is not installed or not in PATH
- **Fix:** Install Node.js using steps above
- **Fix:** Restart terminal after installation

### "psql: command not found"
- PostgreSQL is not installed or not in PATH
- **Fix:** Install PostgreSQL or use Docker
- **Fix:** Add PostgreSQL to PATH (see step 3)

### "Port 3000 already in use"
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### "Database connection failed"
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Or check Docker
docker ps | grep postgres

# Restart PostgreSQL
brew services restart postgresql@15
# Or
docker-compose restart postgres
```

### "Prisma Client is not generated"
```bash
npx prisma generate
```

### Dependencies installation fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Next Steps

1. **Read the documentation:**
   - [QUICKSTART.md](../QUICKSTART.md) - 5-minute quick start
   - [docs/setup/DEV_SETUP.md](docs/setup/DEV_SETUP.md) - Detailed setup guide
   - [docs/contributing/CHEAT_SHEET.md](docs/contributing/CHEAT_SHEET.md) - Command reference

2. **Configure your environment:**
   - Edit `.env` with your API keys
   - Set up Stripe test account
   - Configure email service (Resend)

3. **Start developing:**
   - Run `npm run dev`
   - Visit http://localhost:3000
   - Check out http://localhost:3000/admin

---

## 🎓 Learning Resources

### Node.js & npm
- Official docs: https://nodejs.org/docs/
- npm documentation: https://docs.npmjs.com/

### PostgreSQL
- Official docs: https://www.postgresql.org/docs/
- PostgreSQL tutorial: https://www.postgresqltutorial.com/

### Next.js
- Official docs: https://nextjs.org/docs
- Learn Next.js: https://nextjs.org/learn

### Prisma
- Official docs: https://www.prisma.io/docs
- Prisma guides: https://www.prisma.io/docs/guides

---

## ✅ Installation Checklist

Use this to verify your setup:

- [ ] Homebrew installed (`brew --version`)
- [ ] Node.js v20+ installed (`node --version`)
- [ ] npm v10+ installed (`npm --version`)
- [ ] PostgreSQL 15 installed (`psql --version`)
- [ ] Git installed (`git --version`)
- [ ] Project dependencies installed (`npm list`)
- [ ] `.env` file created and configured
- [ ] Database initialized (`npx prisma studio` opens)
- [ ] Development server starts (`npm run dev`)
- [ ] Can access http://localhost:3000

---

**Need help? Check our [docs](docs/) or open an issue on GitHub!**
