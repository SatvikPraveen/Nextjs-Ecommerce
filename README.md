# Next.js E-Commerce Platform 🛍️

[![Next.js](https://img.shields.io/badge/Next.js_15.5-000?logo=next.js&logoColor=fff)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5.9-3178C6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma_5.22-2D3748?logo=prisma&logoColor=fff)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **🎓 Demo & Learning Project**  
> A full-stack e-commerce platform built to demonstrate modern Next.js development patterns with TypeScript, Prisma, and PostgreSQL. Not intended for production use.

## ✨ What's Inside

**Core Features**
- 🛍️ Product catalog with search, filtering & categories
- 🛒 Shopping cart with persistent storage
- 📧 Newsletter subscription with validation
- 🎨 Custom 404 page with demo messaging
- 👤 User authentication with NextAuth.js
- 💳 Stripe payment integration (configured)
- 📊 Admin dashboard for product & order management

**Tech Stack**
- **Frontend:** Next.js 15.5.6 | React 18 | TypeScript 5.9  | Tailwind CSS | shadcn/ui
- **Backend:** Server Components | Server Actions | API Routes
- **Database:** PostgreSQL 15 | Prisma 5.22 ORM
- **Testing:** Jest | React Testing Library | Cypress

**Current Status (March 2026)**
- ✅ All TypeScript checks passing
- ✅ All ESLint checks passing  
- ✅ 149/149 tests passing (100%)
- ✅ Newsletter feature fully functional
- ✅ Local SVG product images
- ✅ Database migrations applied

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- PostgreSQL 15+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/SatvikPraveen/Nextjs-Ecommerce.git
cd Nextjs-Ecommerce

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database URL and API keys

# Set up database
npx prisma db push
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Essential Environment Variables

```env
# Database (Required)
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce"

# NextAuth (Required)
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (Optional - for payments)
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
```

See [.env.example](.env.example) for complete configuration.

## 📁 Project Structure

```
app/
├── (store)/          # Customer-facing pages
│   ├── products/     # Product catalog
│   ├── cart/         # Shopping cart
│   └── search/       # Search results
├── (account)/        # User account pages
├── admin/            # Admin dashboard
├── api/              # API routes
│   ├── newsletter/   # Newsletter subscription
│   ├── stripe/       # Payment webhooks
│   └── auth/         # Authentication
└── not-found.tsx     # Custom 404 page

components/
├── ui/               # shadcn/ui components
├── newsletter-form.tsx
├── product-card.tsx
└── cart-drawer.tsx

server/
├── actions/          # Server actions
└── queries/          # Database queries

prisma/
├── schema.prisma     # Database schema
└── seed.ts           # Sample data
```

## 🛠️ Scripts

```bash
# Development
npm run dev           # Start dev server
npm run build         # Build for production
npm run start         # Start production server

# Database
npm run db:push       # Push schema changes
npm run db:seed       # Seed with sample data
npm run db:studio     # Open Prisma Studio

# Code Quality
npm run lint          # Run ESLint
npm run type-check    # TypeScript type check
npm run format        # Format with Prettier

# Testing
npm run test          # Run all tests
npm run test:e2e      # Run Cypress tests
```

## 📚 Documentation

| Guide | Description |
|-------|-------------|
| [Quick Start](QUICKSTART.md) | Get running in 5 minutes |
| [Dev Setup](docs/setup/DEV_SETUP.md) | Complete development environment setup |
| [Installation](docs/setup/INSTALLATION.md) | Automated environment setup script |
| [Contributing](docs/contributing/CONTRIBUTING.md) | How to contribute |
| [Cheat Sheet](docs/contributing/CHEAT_SHEET.md) | Quick command reference |
| [Project Structure](docs/project/PROJECT_STRUCTURE.md) | Detailed code organization |
| [Roadmap](docs/project/ROADMAP.md) | Future plans |
| [Docs Index](docs/DOCS_INDEX.md) | Complete documentation index |

## 🎯 Recent Updates

**March 2026**
- ✅ Newsletter subscription system with database persistence
- ✅ Custom 404 page for demo project
- ✅ 14 local SVG product & category images
- ✅ Fixed client component directives
- ✅ Repository documentation reorganized
- ✅ Footer updated to 2026

**December 2025**
- ✅ Next.js 15.5.6 upgrade
- ✅ TypeScript strict mode - 0 errors
- ✅ All tests passing (149/149)
- ✅ npm audit: 0 vulnerabilities
- ✅ Prettier formatting applied

## 🔐 Authentication

Supported providers:
- Email/Password
- Google OAuth
- GitHub OAuth
- Discord OAuth

Role-based access control for admin features.

## 💳 Payments

Stripe integration configured for:
- Checkout sessions
- Payment webhooks
- Order fulfillment
- Multi-currency support

## 🐳 Deployment

**Vercel** (Recommended)
```bash
# Connect your GitHub repo to Vercel
# Add environment variables in dashboard
# Deploy automatically on push
```

**Docker**
```bash
docker-compose up -d
```

Or build manually:
```bash
docker build -t nextjs-ecommerce .
docker run -p 3000:3000 -e DATABASE_URL="..." nextjs-ecommerce
```

## 🤝 Contributing

Contributions welcome! Please see [CONTRIBUTING.md](docs/contributing/CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

---

**Note:** This is a demonstration project for learning purposes. For production use, additional security hardening, comprehensive testing, and infrastructure setup would be required.
