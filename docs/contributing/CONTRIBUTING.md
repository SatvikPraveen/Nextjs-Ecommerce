# Contributing to Next.js E-Commerce

Thank you for your interest in contributing! This guide will help you get started.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Submitting Changes](#submitting-changes)
- [Project Structure](#project-structure)

---

## Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/Nextjs-Ecommerce.git
cd Nextjs-Ecommerce

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/Nextjs-Ecommerce.git
```

### 2. Set Up Development Environment

Follow the complete setup guide in [DEV_SETUP.md](./DEV_SETUP.md).

Quick setup:
```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Set up database
docker-compose up -d postgres
npx prisma migrate dev
npm run db:seed

# Start development server
npm run dev
```

### 3. Create a Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

---

## Development Workflow

### 1. Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Add tests for new features
- Update documentation as needed

### 2. Test Your Changes

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:a11y
npm run test:e2e:open

# Type checking
npm run type-check

# Linting
npm run lint
```

### 3. Commit Your Changes

We follow conventional commits:

```bash
# Format: <type>(<scope>): <description>

git commit -m "feat(auth): add Google OAuth integration"
git commit -m "fix(cart): resolve quantity update bug"
git commit -m "docs(readme): update installation steps"
git commit -m "test(products): add product filtering tests"
```

**Commit Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style/formatting (no code change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### 4. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name

# Go to GitHub and create a Pull Request
```

---

## Code Standards

### TypeScript

- Use TypeScript for all new code
- Avoid `any` types - use proper typing
- Use interfaces for object shapes
- Export types that may be reused

```typescript
// ✅ Good
interface ProductProps {
  name: string;
  price: number;
  inStock: boolean;
}

// ❌ Avoid
const product: any = { ... };
```

### React Components

- Use functional components with hooks
- Prefer server components unless you need client-side features
- Use `"use client"` directive only when necessary
- Keep components small and focused

```typescript
// Server Component (default)
export default function ProductGrid({ products }: Props) {
  return <div>...</div>;
}

// Client Component (only when needed)
"use client";
import { useState } from 'react';

export function AddToCart({ productId }: Props) {
  const [loading, setLoading] = useState(false);
  // ...
}
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `ProductCard.tsx`)
- Utilities: `kebab-case.ts` (e.g., `format-currency.ts`)
- Routes: `page.tsx`, `layout.tsx`, `route.ts`
- Tests: `*.test.ts` or `*.test.tsx`

### Import Order

```typescript
// 1. External imports
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// 2. Internal imports - absolute paths
import { formatCurrency } from '@/lib/utils';
import { getProducts } from '@/server/queries/products';

// 3. Relative imports
import { ProductCard } from './product-card';

// 4. Types
import type { Product } from '@prisma/client';
```

### Code Formatting

We use Prettier for consistent formatting:

```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

**Settings (automatically applied):**
- Single quotes
- 2 space indentation
- Trailing commas
- Semicolons required
- Line width: 80 characters

### Testing

All new features should include tests:

```typescript
// Unit Test Example
describe('formatCurrency', () => {
  it('should format USD correctly', () => {
    expect(formatCurrency(29.99)).toBe('$29.99');
  });
});

// Component Test Example
describe('AddToCart', () => {
  it('should add product to cart', async () => {
    render(<AddToCart productId="123" />);
    await userEvent.click(screen.getByRole('button'));
    expect(mockAddToCart).toHaveBeenCalledWith('123');
  });
});
```

### Database Changes

When modifying the database schema:

```bash
# 1. Edit prisma/schema.prisma

# 2. Create a migration
npx prisma migrate dev --name add_user_preferences

# 3. Update seed file if needed
# Edit: prisma/seed.ts

# 4. Test migration
npm run db:seed
```

---

## Submitting Changes

### Pull Request Checklist

Before submitting, ensure:

- [ ] All tests pass (`npm test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] New features have tests
- [ ] Documentation is updated
- [ ] Commit messages follow conventions
- [ ] PR description clearly explains changes

### Pull Request Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test these changes:
1. Step 1
2. Step 2

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Tests pass
- [ ] Code is formatted
- [ ] Documentation updated
```

### Review Process

1. Submit your PR
2. A maintainer will review within 1-3 days
3. Address any feedback
4. Once approved, your PR will be merged!

---

## Project Structure

```
Nextjs-Ecommerce/
├── app/                    # Next.js App Router
│   ├── (store)/           # Store pages (marketing layout)
│   ├── (account)/         # User account pages
│   ├── admin/             # Admin dashboard
│   └── api/               # API routes
├── components/            # React components
│   └── ui/               # Reusable UI components
├── lib/                  # Utility functions
├── server/               # Server-side code
│   ├── actions/          # Server actions
│   └── queries/          # Database queries
├── prisma/               # Database schema & migrations
├── tests/                # Test files
│   ├── unit/            # Unit tests
│   ├── integration/     # Integration tests
│   ├── a11y/            # Accessibility tests
│   └── e2e/             # End-to-end tests
└── docs/                # Documentation
```

### Key Conventions

**Server Actions vs API Routes:**
- Prefer server actions for mutations (in `server/actions/`)
- Use API routes only for webhooks or third-party integrations

**Data Fetching:**
- Server queries in `server/queries/` for data fetching
- Cache with `unstable_cache` when appropriate
- Use React Server Components for automatic caching

**Styling:**
- Tailwind CSS for all styling
- Use `cn()` utility for class merging
- shadcn/ui components for UI elements

---

## Need Help?

- 📖 Read the [Development Setup Guide](./DEV_SETUP.md)
- 📋 Check existing [Issues](https://github.com/OWNER/REPO/issues)
- 💬 Start a [Discussion](https://github.com/OWNER/REPO/discussions)
- 📧 Contact maintainers

---

## Code of Conduct

Be respectful and professional. We're all here to learn and build together!

---

**Thank you for contributing! 🎉**
