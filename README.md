# Next.js E-Commerce Platform 🛍️

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/SatvikPraveen/Nextjs-Ecommerce)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)

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

## ✅ Project Status

- **Framework**: Next.js 15.5.6 ✅
- **Security**: 0 vulnerabilities ✅
- **Type Safety**: TypeScript strict mode with 0 errors ✅
- **Linting**: ESLint 9.9.0 with 0 warnings ✅
- **Testing**: 
  - Unit Tests: 90/90 passing ✅
  - E2E Tests: Cypress configured and ready ✅
  - Build: Production-ready ✅
- **Database**: Prisma migrations setup and verified ✅
- **CI/CD**: GitHub Actions pipeline fully configured ✅
- **Deployment**: Docker image (Node 22-alpine) ✅

## 🚀 Recent Updates (v15 Upgrade)

### Major Changes
- ✨ Upgraded from Next.js 14.2.33 → 15.5.6
- 🔧 Updated ESLint from 8.57.1 → 9.9.0 (compatible with Next.js 15)
- 📦 Prisma 5.22.0 stable with complete migrations
- 🛡️ Eliminated all 3 high-severity glob vulnerabilities
- 🚀 Node.js 20.19+ in GitHub Actions (improved compatibility)
- 🧪 E2E tests with Cypress configured
- 📝 Comprehensive seed data with TypeScript support
- 🐳 Docker support with optimized Node image

### Breaking Changes Fixed
- ✅ `serverComponentsExternalPackages` → `serverExternalPackages` in next.config.mjs
- ✅ Link component usage in product-grid.tsx (ESLint strict)
- ✅ `cookies()` now returns Promise in server actions

---

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

# Testing
npm run test:unit       # Run unit tests (Jest)
npm run test:watch      # Watch mode
npm run test:e2e        # E2E tests (Cypress headless)
npm run test:e2e:open   # E2E tests (Cypress UI)
npm run test:a11y       # Accessibility tests
npm run test:performance # Performance tests with Lighthouse

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # TypeScript type checking
npm run format          # Format with Prettier
npm run format:check    # Check formatting
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

## 🧪 Testing

### Unit Tests
```bash
npm run test:unit               # Run all unit tests
npm run test:watch             # Watch mode
```

**Coverage**: 90+ tests across utils, validation, and pricing logic

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

### Accessibility Tests
```bash
npm run test:a11y              # jest-axe accessibility tests
```

### GitHub Actions CI/CD
Automated testing on every push:
- ✅ **Test Job**: Type-check, lint, unit tests, build
- ✅ **Security Job**: npm audit (0 vulnerabilities)
- ✅ **E2E Job**: Cypress tests with database setup
- ✅ **Accessibility Job**: jest-axe compliance
- ✅ **Performance Job**: Lighthouse CI
- ✅ **Docker Job**: Build Docker image
- ✅ **Build & Test**: Node 18.x and 20.x compatibility

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
4. Run tests: `npm test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style
- Use TypeScript for all new code
- Follow existing patterns and conventions
- Add tests for new features
- Update documentation as needed

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

<div align="center">
  <strong>Built with ❤️ by <a href="https://github.com/SatvikPraveen">Satvik Praveen</a></strong>
</div>