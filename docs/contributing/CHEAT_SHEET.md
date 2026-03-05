# Developer Cheat Sheet

Quick reference for common commands and patterns in the Next.js E-Commerce project.

## 🚀 Quick Start

```bash
# First time setup
make setup              # Install dependencies and create .env
make db-setup          # Setup database with migrations and seed data
make dev               # Start development server

# Or using npm directly
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

## 📦 Package Manager Commands

```bash
# Development
npm run dev            # Start dev server (http://localhost:3000)
npm run build          # Build for production
npm start              # Start production server

# Database
npm run db:push        # Push schema changes (no migration)
npm run db:seed        # Seed database with test data
npm run db:studio      # Open Prisma Studio
npm run db:generate    # Generate Prisma Client

# Testing
npm test               # Run all tests
npm run test:unit      # Unit tests only
npm run test:watch     # Watch mode
npm run test:e2e       # Cypress E2E tests
npm run test:e2e:open  # Cypress UI

# Code Quality
npm run lint           # Lint code
npm run format         # Format with Prettier
npm run type-check     # TypeScript checking
```

## 🛠️ Make Commands

```bash
# Quick workflows
make help              # Show all available commands
make quick-start       # Start DB + dev server
make fresh-start       # Clean setup from scratch

# Development
make dev               # Start development
make build             # Build for production

# Database
make db-setup          # Complete DB setup
make db-migrate        # Run migrations
make db-reset          # Reset database (deletes data!)
make db-seed           # Seed sample data
make db-studio         # Open Prisma Studio

# Docker
make docker-up         # Start all services
make docker-down       # Stop all services
make docker-db         # Start DB only
make docker-clean      # Remove containers + volumes

# Code Quality
make check             # Run all checks (lint, format, types)
make pre-commit        # Full pre-commit check including tests

# Cleanup
make clean             # Clean build artifacts
make clean-all         # Clean everything including node_modules
```

## 🗄️ Database Commands

```bash
# Prisma CLI
npx prisma studio              # Visual database editor
npx prisma generate            # Generate Prisma Client
npx prisma migrate dev         # Create & apply migration
npx prisma migrate deploy      # Apply migrations (production)
npx prisma migrate reset       # Reset database
npx prisma db push             # Sync schema without migration
npx prisma format              # Format schema file

# Common patterns
npx prisma migrate dev --name add_user_role
npx prisma migrate reset --force
```

## 🐳 Docker Commands

```bash
# Docker Compose
docker-compose up -d           # Start in background
docker-compose up --build      # Rebuild and start
docker-compose down            # Stop services
docker-compose down -v         # Stop and remove volumes
docker-compose logs -f         # View logs (follow)
docker-compose ps              # List running services

# Database only
docker-compose up -d postgres  # Start DB only
docker-compose exec postgres psql -U ecommerce_user -d ecommerce_db

# Clean slate
docker-compose down -v         # Remove everything
docker system prune -a         # Clean Docker system
```

## 🧪 Testing Patterns

```bash
# jest commands
jest                           # Run all tests
jest --watch                   # Watch mode
jest --coverage                # With coverage report
jest tests/unit/utils.test.ts  # Run specific file
jest -t "formatCurrency"       # Run specific test

# Cypress
npx cypress open               # Interactive mode
npx cypress run                # Headless mode
npx cypress run --spec "cypress/e2e/checkout.cy.ts"
```

## 📝 Code Patterns

### Server Actions

```typescript
// server/actions/example.ts
'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

export async function createProduct(data: ProductInput) {
  const product = await prisma.product.create({ data });
  revalidatePath('/products');
  return product;
}
```

### Server Components (Default)

```typescript
// app/products/page.tsx
import { getProducts } from '@/server/queries/products';

export default async function ProductsPage() {
  const products = await getProducts();
  return <ProductGrid products={products} />;
}
```

### Client Components

```typescript
// components/add-to-cart.tsx
'use client';

import { useState } from 'react';
import { addToCart } from '@/server/actions/cart';

export function AddToCart({ productId }: Props) {
  const [loading, setLoading] = useState(false);
  
  async function handleClick() {
    setLoading(true);
    await addToCart(productId);
    setLoading(false);
  }
  
  return <button onClick={handleClick}>Add to Cart</button>;
}
```

### Database Queries

```typescript
// server/queries/products.ts
import prisma from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

export const getProducts = unstable_cache(
  async () => {
    return prisma.product.findMany({
      include: { category: true },
      where: { published: true },
    });
  },
  ['products'],
  { revalidate: 60 }
);
```

## 🎨 UI Components

```typescript
// Using shadcn/ui components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// Styling with Tailwind + cn utility
import { cn } from '@/lib/utils';

<div className={cn(
  "flex items-center",
  isActive && "bg-blue-500",
  className
)} />
```

## 🔧 Environment Variables

```bash
# Required
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Generate secret
openssl rand -base64 32
```

## 🚨 Common Issues

### Port already in use
```bash
lsof -ti:3000 | xargs kill -9
PORT=3001 npm run dev
```

### Database connection failed
```bash
# Check if Postgres is running
docker ps | grep postgres
# Or
pg_isready

# Restart database
make docker-db
```

### Prisma client not generated
```bash
npx prisma generate
```

### Node modules issues
```bash
make clean-all
make install
```

### Clear Next.js cache
```bash
rm -rf .next
npm run dev
```

## 🔍 Debugging

```typescript
// Enable debug logging
DEBUG=true npm run dev

// Console logging in Server Components
console.log('Server:', data);

// Console logging in Client Components  
'use client';
console.log('Client:', data);

// Check environment variables
console.log('ENV:', process.env.NEXT_PUBLIC_APP_URL);
```

## 📊 Git Workflow

```bash
# Daily workflow
git pull origin main
git checkout -b feature/my-feature
# ... make changes ...
make pre-commit
git add .
git commit -m "feat: add new feature"
git push origin feature/my-feature

# Commit message format
feat(scope): description      # New feature
fix(scope): description       # Bug fix
docs(scope): description      # Documentation
test(scope): description      # Tests
refactor(scope): description  # Refactoring
```

## 📚 Useful URLs

```
Local Dev:        http://localhost:3000
Admin Dashboard:  http://localhost:3000/admin
Prisma Studio:    http://localhost:5555
API Docs:         http://localhost:3000/api-docs (if configured)
```

## 🔑 Keyboard Shortcuts (VS Code)

```
Cmd/Ctrl + P       → Quick file search
Cmd/Ctrl + Shift + P → Command palette
Cmd/Ctrl + B       → Toggle sidebar
Cmd/Ctrl + `       → Toggle terminal
Cmd/Ctrl + Shift + F → Global search
```

## 📦 Adding Dependencies

```bash
# Production dependency
npm install package-name

# Dev dependency
npm install -D package-name

# Specific version
npm install package-name@1.2.3

# Update all
npm update

# Check outdated
npm outdated
```

## 🎯 Best Practices

1. **Always run checks before committing:**
   ```bash
   make check
   ```

2. **Test database changes:**
   ```bash
   make db-reset && make db-seed
   ```

3. **Keep dependencies updated:**
   ```bash
   npm outdated
   npm update
   ```

4. **Use TypeScript properly:**
   - No `any` types
   - Export reusable types
   - Use proper typing

5. **Follow file naming:**
   - Components: `PascalCase.tsx`
   - Utils: `kebab-case.ts`
   - Tests: `*.test.ts`

---

**Print this and keep it handy! 📌**
