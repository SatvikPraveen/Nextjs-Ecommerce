# Contributing to Next.js E-Commerce Platform 🤝

Thank you for your interest in contributing! This is a **demo/learning project** built with modern Next.js best practices. We welcome contributions that help improve the codebase as an educational resource.

> 📚 **Detailed Guide**: For comprehensive contributing guidelines, see [docs/contributing/CONTRIBUTING.md](docs/contributing/CONTRIBUTING.md)

## 🚀 Quick Start

### 1. Fork and Clone

```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/Nextjs-Ecommerce.git
cd Nextjs-Ecommerce

# Add upstream remote
git remote add upstream https://github.com/SatvikPraveen/Nextjs-Ecommerce.git
```

### 2. Setup Development Environment

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Setup database
make db-setup
# Or manually:
npx prisma migrate dev
npm run db:seed

# Start development
npm run dev
```

Visit http://localhost:3000 to see your local instance.

### 3. Create a Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

## 📝 Development Workflow

### Making Changes

1. **Write clean, readable code** following the existing patterns
2. **Add tests** for new features (unit, integration, or e2e)
3. **Update documentation** if you change functionality
4. **Follow TypeScript best practices** - avoid `any`, use proper types

### Testing Your Changes

```bash
# Run all tests
npm test

# Specific test suites
npm run test:unit       # Unit tests
npm run test:a11y       # Accessibility tests
npm run test:e2e        # End-to-end tests

# Quality checks
npm run type-check      # TypeScript validation
npm run lint            # ESLint
npm run format          # Prettier formatting
```

### Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format: <type>(<scope>): <description>

git commit -m "feat(cart): add quantity selector"
git commit -m "fix(auth): resolve session timeout issue"
git commit -m "docs(readme): update setup instructions"
git commit -m "test(products): add filter tests"
```

**Commit Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Code style (formatting, no logic change)
- `refactor` - Code refactoring
- `test` - Adding/updating tests
- `chore` - Maintenance tasks
- `perf` - Performance improvements

## 🎯 Code Standards

### TypeScript

```typescript
// ✅ Good - Proper typing
interface ProductProps {
  name: string;
  price: number;
  inStock: boolean;
}

// ❌ Avoid - Using 'any'
const product: any = { ... };
```

### React Components

```typescript
// ✅ Server Component (default - no "use client")
export default async function ProductList() {
  const products = await getProducts();
  return <div>...</div>;
}

// ✅ Client Component (only when needed)
"use client";
import { useState } from 'react';

export function AddToCart({ productId }: Props) {
  const [loading, setLoading] = useState(false);
  // Interactive features here
}
```

**Key Principles:**
- Prefer **Server Components** unless you need client-side features
- Use `"use client"` only when necessary (useState, useEffect, event handlers)
- Keep components small and focused
- Extract reusable logic into custom hooks or utilities

### File Naming

- **Components**: `PascalCase.tsx` → `ProductCard.tsx`
- **Utilities**: `kebab-case.ts` → `format-currency.ts`
- **Routes**: `page.tsx`, `layout.tsx`, `route.ts`
- **Tests**: `*.test.ts` or `*.test.tsx`

### Import Order

```typescript
// 1. External packages
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// 2. Internal absolute imports
import { formatCurrency } from '@/lib/utils';
import { getProducts } from '@/server/queries/products';

// 3. Relative imports
import { ProductCard } from './product-card';

// 4. Types
import type { Product } from '@prisma/client';
```

### Styling

- Use **Tailwind CSS** for all styling
- Use shadcn/ui components from `components/ui/`
- Use `cn()` utility for conditional class names
- Follow mobile-first responsive design

## 🗄️ Database Changes

When modifying the database schema:

```bash
# 1. Edit schema
vim prisma/schema.prisma

# 2. Create migration
npx prisma migrate dev --name add_your_feature

# 3. Update seed data (if needed)
vim prisma/seed.ts

# 4. Test migration
npm run db:seed
```

## ✅ Pull Request Checklist

Before submitting your PR, ensure:

- [ ] All tests pass (`npm test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] New features have tests
- [ ] Documentation is updated
- [ ] Commit messages follow conventional format
- [ ] PR description clearly explains changes

### Pull Request Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update

## How to Test
1. Step-by-step instructions
2. Expected behavior
3. Screenshots (if UI changes)

## Checklist
- [ ] Tests pass
- [ ] Code formatted
- [ ] Documentation updated
- [ ] No console errors
```

## 📁 Project Structure

```
Nextjs-Ecommerce/
├── app/                   # Next.js App Router
│   ├── (store)/          # Store pages (products, cart, checkout)
│   ├── (account)/        # User account (profile, orders)
│   ├── admin/            # Admin dashboard
│   └── api/              # API routes (webhooks, external integrations)
├── components/           # React components
│   └── ui/              # Reusable UI components (shadcn/ui)
├── lib/                 # Utility functions, configurations
├── server/              # Server-side code
│   ├── actions/         # Server Actions (mutations)
│   └── queries/         # Database queries (reads)
├── prisma/              # Database schema & migrations
├── tests/               # Test suites
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   ├── a11y/           # Accessibility tests
│   └── e2e/            # Cypress end-to-end tests
├── public/             # Static assets
├── docker/             # Docker configuration
└── docs/               # Documentation
```

### Key Conventions

- **Server Actions** (`server/actions/`) for mutations (create, update, delete)
- **Server Queries** (`server/queries/`) for data fetching
- **API Routes** only for webhooks or third-party integrations
- **Server Components** by default, Client Components only when needed

## 🎨 Tech Stack

- **Framework**: Next.js 15.5 (App Router)
- **Language**: TypeScript 5.9
- **Database**: PostgreSQL 15 + Prisma ORM
- **UI**: React 18 + Tailwind CSS + shadcn/ui
- **Auth**: NextAuth.js
- **Payments**: Stripe
- **Testing**: Jest + React Testing Library + Cypress

## 💡 Areas to Contribute

### Good First Issues
- Improve error messages
- Add missing tests
- Fix typos in documentation
- Improve accessibility
- Add code comments

### Feature Ideas
- Product reviews and ratings
- Wishlist functionality
- Order tracking
- Product recommendations
- Advanced filtering
- Dark mode toggle

### Documentation
- Tutorial videos
- Architecture diagrams
- API documentation
- Deployment guides

## 🆘 Getting Help

- 📖 [Development Setup Guide](docs/setup/DEV_SETUP.md)
- 💡 [Cheat Sheet](docs/contributing/CHEAT_SHEET.md) - Quick command reference
- 🗂️ [Project Structure](docs/project/PROJECT_STRUCTURE.md)
- ❓ [Open an Issue](https://github.com/SatvikPraveen/Nextjs-Ecommerce/issues)

## 📜 Code of Conduct

- Be respectful and professional
- Provide constructive feedback
- Help others learn and grow
- Celebrate contributions of all sizes

This is a learning project - questions and beginner contributions are welcome! 🎓

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing! 🎉**

Every contribution helps make this a better learning resource for the Next.js community.
