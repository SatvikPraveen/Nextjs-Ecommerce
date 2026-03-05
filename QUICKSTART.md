# ⚡ Quick Start Guide

Get up and running in 5 minutes!

## 🎯 Fastest Path to Development

### Option 1: Using Make (Recommended)

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd Nextjs-Ecommerce

# 2. One command setup!
make setup

# 3. Configure .env (edit with your values)
# Required: DATABASE_URL, NEXTAUTH_SECRET, STRIPE keys

# 4. Setup database
make db-setup

# 5. Start development
make dev
```

**Done! Open http://localhost:3000** 🎉

---

### Option 2: Using npm

```bash
# 1. Clone and install
git clone <your-repo-url>
cd Nextjs-Ecommerce
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your configuration

# 3. Setup database
docker-compose up -d postgres  # or use local PostgreSQL
npx prisma generate
npx prisma migrate dev
npm run db:seed

# 4. Start development
npm run dev
```

**Done! Open http://localhost:3000** 🎉

---

## 🔑 Minimum Required Configuration

Edit your `.env` file with these essentials:

```bash
# Database (local Docker)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce_db"

# Auth (generate secret)
NEXTAUTH_SECRET="your-secret-here"  # openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# Stripe Test Keys (get from https://dashboard.stripe.com/test/apikeys)
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."  # From Stripe CLI: stripe listen

# Email (optional for now)
RESEND_API_KEY="re_..."
FROM_EMAIL="noreply@example.com"

# App
NEXT_PUBLIC_APP_NAME="My Store"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ADMIN_EMAIL="admin@example.com"
```

---

## 📦 What You Get

Once running, you'll have:

- ✅ Full e-commerce store at http://localhost:3000
- ✅ Admin dashboard at http://localhost:3000/admin
- ✅ Sample products and categories
- ✅ Test user accounts
- ✅ Database with seed data

---

## 🎮 Try These Features

### As a Customer
1. Browse products at http://localhost:3000
2. Add items to cart
3. Go through checkout (use Stripe test card: 4242 4242 4242 4242)
4. View order confirmation

### As an Admin
1. Go to http://localhost:3000/admin
2. Create new products
3. Manage inventory
4. View orders
5. Update order status

---

## 🆘 Most Common Issues

### Issue: "npm: command not found"
**Fix:** Install Node.js from https://nodejs.org/ (v20.19+)

### Issue: "Database connection failed"
**Fix:** Make sure PostgreSQL is running:
```bash
# Using Docker
docker-compose up -d postgres

# Check if it's running
docker ps | grep postgres
```

### Issue: "Port 3000 already in use"
**Fix:**
```bash
# Kill the process
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Issue: "Prisma Client not generated"
**Fix:**
```bash
npx prisma generate
```

---

## 🎓 Next Steps

Once you're up and running:

1. **Read the docs:**
   - [docs/setup/DEV_SETUP.md](docs/setup/DEV_SETUP.md) - Detailed setup guide
   - [docs/contributing/CHEAT_SHEET.md](docs/contributing/CHEAT_SHEET.md) - Common commands
   - [docs/contributing/CONTRIBUTING.md](docs/contributing/CONTRIBUTING.md) - How to contribute

2. **Explore the code:**
   - Check out [docs/project/PROJECT_STRUCTURE.md](docs/project/PROJECT_STRUCTURE.md)
   - Browse the components in `components/`
   - Look at server actions in `server/actions/`

3. **Make it yours:**
   - Customize the branding
   - Add your products
   - Configure payment methods
   - Deploy to production

---

## 🚀 Deployment

### Deploy to Vercel (Fastest)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/SatvikPraveen/Nextjs-Ecommerce)

1. Click the button above
2. Connect your GitHub repo
3. Add environment variables
4. Deploy!

### Deploy with Docker

```bash
# Build and run
docker-compose up --build

# Access at http://localhost:3000
```

---

## 💡 Tips

- **Use `make help`** to see all available commands
- **Check `make info`** to verify your environment
- **Run `make check`** before committing code
- **Use `make fresh-start`** if things get messy

---

## 📞 Need Help?

- 📖 Check [docs/setup/DEV_SETUP.md](docs/setup/DEV_SETUP.md) for detailed instructions
- 🐛 Look at [docs/contributing/CHEAT_SHEET.md](docs/contributing/CHEAT_SHEET.md) for quick solutions
- 💬 Open an issue on GitHub
- 📧 Contact the maintainers

---

**Happy Building! 🎉**
