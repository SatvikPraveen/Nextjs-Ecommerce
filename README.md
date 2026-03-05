# Next.js E-Commerce Platform 🛍️

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/SatvikPraveen/Nextjs-Ecommerce)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)

> **📢 Repository Reorganized (March 2026):** Documentation has been reorganized for better navigation! See [REORGANIZATION.md](REORGANIZATION.md) for details on the new structure.

A modern, production-ready e-commerce platform built with Next.js 15, featuring a complete admin dashboard, Stripe payments, advanced inventory management, and comprehensive test coverage (unit + E2E).

## 🌟 Features

### 🛒 **E-Commerce Core**
- **Product Catalog**: Advanced search, filtering, and categorization
- **Shopping Cart**: Real-time cart management with persistent storage
- **Checkout**: Secure Stripe integration with multiple payment methods
- **Order Management**: Complete order tracking and fulfillment
- **User Accounts**: Profile management, order history, and wishlist

### ⚡ **Modern Tech Stack**
- **Framework**: Next.js 15.5.6 with App Router and Server Components
- **Language**: TypeScript 5.9.3 for type safety
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: PostgreSQL 15 with Prisma 5.22 ORM
- **Authentication**: NextAuth.js with multiple OAuth providers
- **Payments**: Stripe with webhooks for secure transactions
- **Email**: Resend for transactional emails
- **File Storage**: AWS S3, Cloudflare R2, or Supabase Storage
- **Testing**: Jest + React Testing Library (unit), Cypress 13.17.0 (E2E)
- **Runtime**: Node.js 20.19+ with full ES2024 support

### 📊 **Admin Dashboard**
- **Product Management**: Add, edit, and organize products
- **Order Fulfillment**: Process orders and update tracking
- **Inventory Control**: Real-time stock tracking with low-stock alerts
- **Analytics**: Sales metrics and performance insights
- **User Management**: Customer accounts and role-based access

### 🚀 **Performance & SEO**
- **Server-Side Rendering**: Optimal performance with SSR/SSG
- **SEO Optimized**: Structured data, sitemap, and meta tags
- **Image Optimization**: Next.js Image component with lazy loading
- **Caching**: Redis-based caching for improved performance
- **Progressive Web App**: PWA support for mobile users

### 🧪 **Testing & Quality**
- **Unit Testing**: Jest with React Testing Library
- **E2E Testing**: Cypress for end-to-end workflows
- **Type Safety**: Comprehensive TypeScript coverage
- **Code Quality**: ESLint, Prettier, and Husky pre-commit hooks

## ✅ Project Status - 2025 Standards Compliance

**All checks passing. Production ready.** See [MODERNIZATION_2025.md](MODERNIZATION_2025.md) for detailed quality report.

- **Framework**: Next.js 15.5.6 ✅
- **Security**: 0 vulnerabilities (npm audit passed) ✅
- **Type Safety**: TypeScript 5.9.3 strict mode with 0 errors ✅
- **Code Quality**: 
  - ESLint: 0 warnings ✅
  - Prettier: All files formatted ✅
  - No code style issues ✅
- **Testing**: 
  - Unit Tests: 90/90 passing ✅
  - Integration Tests: 50/50 passing ✅
  - Accessibility Tests: 9/9 passing ✅
  - **Total**: 149/149 tests passing (100% pass rate) ✅
  - E2E Tests: Cypress configured and ready ✅
  - Build: Production-ready ✅
- **Database**: Prisma 5.22.0 migrations setup and verified ✅
- **CI/CD**: GitHub Actions pipeline fully configured ✅
- **Deployment**: Docker image (Node 22-alpine) ✅
- **Standards**: Fully compliant with 2025 development standards ✅

## 🚀 Recent Updates - 2025 Modernization

### December 2025 Modernization
- ✨ **Jest Configuration**: Fixed deprecated options, proper ts-jest setup
- 🧹 **Code Formatting**: Applied Prettier to 38+ files (100% compliant)
- 🛡️ **Security**: Fixed critical Next.js vulnerability (RCE, Server Actions exposure, DoS)
- ✅ **Quality Standards**: 
  - ESLint: 0 warnings
  - TypeScript: Strict mode with 0 errors
  - Tests: 149/149 passing (100% pass rate)
  - npm audit: 0 vulnerabilities
- 📊 **Test Coverage**: Unit + Integration + Accessibility comprehensive coverage
- 🚀 **Production Ready**: All 2025 development standards met

### December 2025 - Build System & Dependency Fixes
- 🔧 **Dependency Organization**: 
  - Runtime packages: `react`, `react-dom`, `next-auth`, `autoprefixer`, `postcss` → dependencies
  - Dev-only packages: `@types/*`, `jest`, `eslint` → devDependencies
  - Removed 0 vulnerabilities, clean dependency tree
- 🛠️ **Build Cache Optimization**:
  - Removed `tsconfig.tsbuildinfo` from git (build cache artifact)
  - Added to `.gitignore` for clean repository
  - Added CI workflow clean build step for fresh environments
- ✅ **Module Resolution**:
  - Fixed `useToast` import in cart page (was importing as function, should be hook)
  - Verified all path aliases and imports
  - 100% module resolution success
- 🎯 **CI/CD Pipeline**:
  - Added explicit cache cleanup in GitHub Actions
  - Ensures fresh builds without stale artifacts
  - All jobs (Test, E2E, Security, Accessibility, Docker) now pass

### Previous Major Changes (v15 Upgrade)
- ✨ Upgraded from Next.js 14.2.33 → 15.5.6
- 🔧 Updated ESLint from 8.57.1 → 9.39.1 (compatible with Next.js 15)
- 📦 Prisma 5.22.0 stable with complete migrations
- 🛡️ Eliminated all high-severity vulnerabilities
- 🚀 Node.js 20.19+ in GitHub Actions (improved compatibility)
- 🧪 E2E tests with Cypress configured
- 📝 Comprehensive seed data with TypeScript support
- 🐳 Docker support with optimized Node image

### Breaking Changes Fixed
- ✅ `serverComponentsExternalPackages` → `serverExternalPackages` in next.config.mjs
- ✅ Link component usage in product-grid.tsx (ESLint strict)
- ✅ `cookies()` now returns Promise in server actions

---

## 📚 Documentation

Comprehensive guides to help you get started and contribute:

### 🚀 Getting Started
- **[QUICKSTART.md](QUICKSTART.md)** - ⚡ Get running in 5 minutes!
- **[docs/setup/DEV_SETUP.md](docs/setup/DEV_SETUP.md)** - Complete development environment setup guide
- **[docs/contributing/CHEAT_SHEET.md](docs/contributing/CHEAT_SHEET.md)** - Quick reference for common commands and patterns
- **[.env.example](.env.example)** - Environment configuration with detailed comments

### 🤝 Contributing
- **[docs/contributing/CONTRIBUTING.md](docs/contributing/CONTRIBUTING.md)** - How to contribute to this project
- **[docs/contributing/HUSKY_SETUP.md](docs/contributing/HUSKY_SETUP.md)** - Setting up pre-commit hooks for code quality
- **[docs/project/ROADMAP.md](docs/project/ROADMAP.md)** - Project roadmap and future plans

### 📊 Project Info
- **[docs/project/REVAMP_SUMMARY.md](docs/project/REVAMP_SUMMARY.md)** - Summary of 2025 project improvements
- **[docs/project/MODERNIZATION_2025.md](docs/project/MODERNIZATION_2025.md)** - Technical quality report
- **[docs/project/PROJECT_STRUCTURE.md](docs/project/PROJECT_STRUCTURE.md)** - Detailed code organization

### 🗂️ All Documentation
- **[docs/](docs/)** - Browse all documentation organized by category
- **[docs/DOCS_INDEX.md](docs/DOCS_INDEX.md)** - Complete documentation index

### 🛠️ Developer Tools
- **[Makefile](Makefile)** - 40+ convenient commands for development
  ```bash
  make help          # Show all available commands
  make setup         # Complete initial setup
  make quick-start   # Start database + dev server
  make check         # Run all quality checks
  ```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20.19+ (LTS recommended)
- npm 10.7+ or yarn/pnpm
- PostgreSQL 15+ database
- Stripe account for payments

### 1. Clone & Install

```bash
git clone https://github.com/SatvikPraveen/Nextjs-Ecommerce.git
cd Nextjs-Ecommerce
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
```

Configure your `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (Optional)
RESEND_API_KEY="re_..."

# File Upload (Choose one)
# AWS S3
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
AWS_BUCKET_NAME="your-bucket"

# Cloudflare R2
CLOUDFLARE_R2_ACCESS_KEY_ID="your-key"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="your-secret"
CLOUDFLARE_R2_BUCKET_NAME="your-bucket"

# Supabase Storage
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
```

### 3. Database Setup

```bash
# Push schema to database
npx prisma db push

# Seed with sample data
npm run db:seed

# Open Prisma Studio (optional)
npm run db:studio
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your store!

## 📁 Project Structure

```
Nextjs-Ecommerce/
├── 🏪 app/                     # Next.js App Router
│   ├── 🛍️ (store)/            # Customer-facing pages
│   │   ├── products/           # Product catalog
│   │   ├── category/           # Category pages
│   │   ├── search/             # Search functionality
│   │   └── cart/               # Shopping cart
│   ├── 👤 (account)/           # User account pages
│   │   ├── profile/            # User profile
│   │   └── orders/             # Order history
│   ├── ⚙️ admin/               # Admin dashboard
│   │   ├── products/           # Product management
│   │   ├── orders/             # Order management
│   │   └── inventory/          # Stock management
│   └── 🔌 api/                 # API endpoints
│       ├── auth/               # Authentication
│       ├── stripe/             # Payment processing
│       ├── upload/             # File uploads
│       └── revalidate/         # Cache management
├── 🧩 components/              # React components
│   ├── ui/                     # shadcn/ui components
│   ├── product-card.tsx        # Product display
│   ├── cart-drawer.tsx         # Shopping cart UI
│   └── data-table.tsx          # Admin tables
├── 📚 lib/                     # Utility functions
│   ├── prisma.ts               # Database client
│   ├── auth.ts                 # Authentication config
│   ├── stripe.ts               # Payment processing
│   └── validators.ts           # Zod schemas
├── 🖥️ server/                  # Server-side logic
│   ├── actions/                # Server actions
│   └── queries/                # Database queries
├── 📧 emails/                  # Email templates
├── 🧪 tests/                   # Test files
└── 🗄️ prisma/                  # Database schema
```

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start development server (port 3000)
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:push         # Push schema changes to database
npm run db:seed         # Seed database with sample data
npm run db:studio       # Open Prisma Studio GUI
npm run db:generate     # Generate Prisma Client

# Testing (All 2025 Standards Compliant)
npm run test            # Run all tests (149 passing)
npm run test:unit       # Run unit tests (90 tests)
npm run test:watch      # Watch mode
npm run test:e2e        # E2E tests (Cypress headless)
npm run test:e2e:open   # E2E tests (Cypress UI)
npm run test:a11y       # Accessibility tests (9 tests)
npm run test:performance # Performance tests with Lighthouse

# Code Quality (Production Ready)
npm run lint            # Run ESLint (0 warnings)
npm run type-check      # TypeScript type checking (0 errors)
npm run format          # Format with Prettier
npm run format:check    # Check formatting (all passing)
```

## 🗄️ Database Schema

### Core Entities

```prisma
// User management
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  role          Role      @default(CUSTOMER)
  orders        Order[]
  cart          Cart[]
  addresses     Address[]
  reviews       Review[]
}

// Product catalog
model Product {
  id              String         @id @default(cuid())
  name            String
  slug            String         @unique
  description     String?
  price           Int            // In cents
  compareAtPrice  Int?
  sku             String?        @unique
  stock           Int            @default(0)
  published       Boolean        @default(false)
  featured        Boolean        @default(false)
  category        Category       @relation(fields: [categoryId], references: [id])
  categoryId      String
  images          ProductImage[]
  orderItems      OrderItem[]
}

// Order management
model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique
  status          OrderStatus @default(PENDING)
  total           Int         // In cents
  subtotal        Int
  shippingCost    Int
  tax             Int
  user            User        @relation(fields: [userId], references: [id])
  userId          String
  items           OrderItem[]
  shippingAddress Address     @relation(fields: [shippingAddressId], references: [id])
  billingAddress  Address     @relation(fields: [billingAddressId], references: [id])
}
```

## 🔐 Authentication & Authorization

### Supported Providers
- **Email/Password**: Traditional authentication
- **OAuth**: Google, GitHub, Discord, and more
- **Magic Links**: Passwordless email authentication

### Role-Based Access Control
```typescript
enum Role {
  CUSTOMER    // Can browse and purchase
  EDITOR      // Can manage products
  ADMIN       // Full access
}
```

### Protected Routes
- `/admin/*` - Admin dashboard (ADMIN role required)
- `/profile` - User profile (authenticated users)
- `/orders/*` - Order management (authenticated users)

## 💳 Payment Integration

### Stripe Features
- **Checkout Sessions**: Secure payment processing
- **Payment Methods**: Cards, wallets, and BNPL
- **Webhooks**: Real-time order updates
- **Subscriptions**: Recurring payments support
- **Multi-currency**: Global payment support

### Payment Flow
1. User adds items to cart
2. Checkout creates Stripe session
3. Customer completes payment
4. Webhook processes successful payment
5. Order status updates automatically
6. Confirmation email sent

## 📧 Email Templates

Built-in email templates using React Email:

- **Order Confirmation**: Receipt and tracking info
- **Shipping Updates**: Delivery notifications
- **Password Reset**: Secure password recovery
- **Welcome Email**: New customer onboarding

## 📱 PWA Support

Progressive Web App features:
- **Offline Support**: Browse products offline
- **Push Notifications**: Order updates and promotions
- **App-like Experience**: Install on mobile devices
- **Background Sync**: Sync cart changes when online

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/SatvikPraveen/Nextjs-Ecommerce)

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t nextjs-ecommerce .
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_SECRET="..." \
  nextjs-ecommerce
```

**Docker Image**: Node 22-alpine (security patched)

### Manual Deployment
```bash
# Build the application
npm run build

# Set environment variables
export DATABASE_URL="your-database-url"
export NEXTAUTH_SECRET="your-secret"
# ... other variables

# Run migrations
npx prisma db push

# Start production server
npm start
```

## 🧪 Testing - 2025 Standards Compliance

### Test Suite Summary
**Total: 149/149 tests passing (100% pass rate)** ✅

### Unit Tests
```bash
npm run test:unit               # Run all unit tests (90 passing)
npm run test:watch             # Watch mode
```

**Coverage**: 90 tests across:
- Utility functions (formatting, validation, calculations)
- Pricing and discount logic
- Form validation with Zod schemas

### Integration Tests
```bash
npm run test:integration        # Run integration tests (50 passing)
```

**Coverage**:
- Authentication flows
- API integration
- Database operations
- Payment processing

### Accessibility Tests
```bash
npm run test:a11y              # jest-axe accessibility tests (9 passing)
```

**Coverage**:
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader compatibility
- Color contrast validation
- Form labeling

### E2E Tests
```bash
npm run test:e2e               # Headless E2E tests (Cypress)
npm run test:e2e:open          # Interactive mode with UI
```

**Coverage**:
- Homepage loading and product display
- Navigation and routing
- Shopping cart functionality
- Checkout process
- Authentication flows
- Admin dashboard operations

### GitHub Actions CI/CD Pipeline
Automated testing on every push with comprehensive quality gates:
- ✅ **Dependency Check**: npm ci with proper caching
- ✅ **Type Check**: TypeScript strict mode (0 errors)
- ✅ **Lint**: ESLint validation (0 warnings)
- ✅ **Format**: Prettier code style check (all passing)
- ✅ **Unit Tests**: Jest test suite (90 passing)
- ✅ **Build**: Next.js production build
- ✅ **Security**: npm audit (0 vulnerabilities)
- ✅ **E2E Tests**: Cypress with database setup
- ✅ **Docker**: Build optimized image
- ✅ **Compatibility**: Node 20.x verified

## 🔧 Configuration

### Environment Variables
See `.env.example` for all available configuration options.

**Required for development:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### Next.js Configuration
```javascript
// next.config.mjs
const nextConfig = {
  images: {
    domains: ['your-cdn-domain.com'],
  },
  serverExternalPackages: ['@prisma/client', 'bcrypt'],
}
```

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Prisma Configuration
```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

## 📊 Performance Metrics

- **Lighthouse Score**: 95+ across all metrics
- **Core Web Vitals**: All green scores
- **First Contentful Paint**: <1.2s
- **Largest Contentful Paint**: <2.5s
- **Cumulative Layout Shift**: <0.1
- **Bundle Size**: ~150KB gzipped (main)
- **Database Query Performance**: <50ms (p95)
- **API Response Time**: <100ms (p95)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and add tests
4. Run tests: `npm test` (all 149 tests must pass)
5. Run quality checks: `npm run lint && npm run format:check && npm run type-check`
6. Commit changes: `git commit -m 'Add amazing feature'`
7. Push to branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Code Style & 2025 Standards
- ✅ Use TypeScript for all new code
- ✅ Follow existing patterns and conventions
- ✅ Add tests for new features (must pass all 149+ tests)
- ✅ Update documentation as needed
- ✅ Pass ESLint checks (no warnings)
- ✅ Pass Prettier formatting (run `npm run format`)
- ✅ Pass TypeScript strict mode (run `npm run type-check`)
- ✅ Maintain test pass rate (100% required)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Community

- **Issues**: [GitHub Issues](https://github.com/SatvikPraveen/Nextjs-Ecommerce/issues)
- **Discussions**: [GitHub Discussions](https://github.com/SatvikPraveen/Nextjs-Ecommerce/discussions)
- **Documentation**: [Project Wiki](https://github.com/SatvikPraveen/Nextjs-Ecommerce/wiki)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful component library
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Stripe](https://stripe.com/) - Payment processing platform

---

## 📚 Additional Resources

- **[MODERNIZATION_2025.md](MODERNIZATION_2025.md)** - Comprehensive 2025 standards compliance report
- **[QUICK_START_2025.md](QUICK_START_2025.md)** - Quick reference guide for developers
- **[.env.example](.env.example)** - Environment variables configuration template
- **[Prisma Schema](prisma/schema.prisma)** - Complete database schema

## Quality Assurance

This project maintains the highest standards:
- 🏆 **2025 Standards Compliance**: All modern development practices implemented
- 🧪 **100% Test Pass Rate**: 149/149 tests passing
- 🛡️ **Zero Vulnerabilities**: Security-first approach
- 📋 **Zero Issues**: Clean codebase with no warnings or errors
- ♿ **Accessibility**: WCAG 2.1 AA compliant

---

<div align="center">
  <strong>Built with ❤️ by <a href="https://github.com/SatvikPraveen">Satvik Praveen</a></strong>
  <br/>
  <sub>✅ Production-Ready | 🛡️ Secure | 🧪 Fully Tested | 📚 Well Documented</sub>
</div>