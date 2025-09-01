#!/bin/bash

# Script to generate Next.js E-commerce project structure
# Usage: chmod +x generate-project-structure.sh && ./generate-project-structure.sh

set -e

PROJECT_NAME="nextjs-ecommerce"

echo "🚀 Creating Next.js E-commerce project structure..."

# Create main project directory
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

echo "📁 Creating root configuration files..."

# Root configuration files
touch .env.example
touch .gitignore
touch .prettierignore
touch .prettierrc
touch .eslintrc.js
touch next.config.mjs
touch package.json
touch postcss.config.js
touch tailwind.config.ts
touch tsconfig.json
touch Dockerfile
touch docker-compose.yml
touch README.md
touch middleware.ts

echo "📂 Creating public directory and assets..."

# Public directory
mkdir -p public/images
touch public/favicon.ico
touch public/images/placeholder.svg

echo "🗄️ Creating Prisma directory..."

# Prisma directory
mkdir -p prisma
touch prisma/schema.prisma
touch prisma/seed.ts

echo "🌐 Creating app directory structure..."

# App directory structure
mkdir -p app
touch app/layout.tsx
touch app/page.tsx
touch app/sitemap.ts
touch app/robots.ts

# Store routes (route group)
mkdir -p "app/(store)/products/[slug]"
mkdir -p "app/(store)/category/[slug]"
mkdir -p "app/(store)/search"
mkdir -p "app/(store)/cart"
touch "app/(store)/products/[slug]/page.tsx"
touch "app/(store)/category/[slug]/page.tsx"
touch "app/(store)/search/page.tsx"
touch "app/(store)/cart/page.tsx"

# Account routes (route group)
mkdir -p "app/(account)/profile"
mkdir -p "app/(account)/orders/[id]"
touch "app/(account)/profile/page.tsx"
touch "app/(account)/orders/[id]/page.tsx"

# Admin routes
mkdir -p app/admin/products
mkdir -p app/admin/orders
mkdir -p app/admin/inventory
touch app/admin/layout.tsx
touch app/admin/products/page.tsx
touch app/admin/orders/page.tsx
touch app/admin/inventory/page.tsx

# API routes
mkdir -p "app/api/auth/[...nextauth]"
mkdir -p app/api/stripe/create-checkout
mkdir -p app/api/stripe/webhook
mkdir -p app/api/upload
mkdir -p app/api/revalidate
touch "app/api/auth/[...nextauth]/route.ts"
touch app/api/stripe/create-checkout/route.ts
touch app/api/stripe/webhook/route.ts
touch app/api/upload/route.ts
touch app/api/revalidate/route.ts

echo "🧩 Creating components directory..."

# Components directory
mkdir -p components/ui
touch components/product-card.tsx
touch components/product-grid.tsx
touch components/add-to-cart.tsx
touch components/cart-drawer.tsx
touch components/data-table.tsx
touch components/jsonld.tsx

echo "📚 Creating lib directory..."

# Lib directory
mkdir -p lib
touch lib/prisma.ts
touch lib/auth.ts
touch lib/stripe.ts
touch lib/emails.ts
touch lib/cache.ts
touch lib/roles.ts
touch lib/uploader.ts
touch lib/validators.ts

echo "🔧 Creating server directory..."

# Server directory
mkdir -p server/actions
mkdir -p server/queries
touch server/actions/cart.ts
touch server/actions/checkout.ts
touch server/actions/products.ts
touch server/actions/admin.ts
touch server/queries/products.ts
touch server/queries/orders.ts
touch server/queries/inventory.ts

echo "📧 Creating emails directory..."

# Emails directory
mkdir -p emails
touch emails/OrderConfirmation.tsx
touch emails/ResetPassword.tsx

echo "🎨 Creating styles directory..."

# Styles directory
mkdir -p styles
touch styles/globals.css

echo "🧪 Creating tests directory structure..."

# Tests directory
mkdir -p tests/unit
mkdir -p tests/integration
mkdir -p tests/e2e/cypress/e2e
mkdir -p tests/e2e/cypress/fixtures
mkdir -p tests/e2e/cypress/support
touch tests/unit/price.test.ts
touch tests/e2e/cypress/e2e/checkout.cy.ts
touch tests/e2e/cypress/support/commands.ts
touch tests/e2e/cypress/support/e2e.ts
touch tests/e2e/cypress/cypress.config.ts

echo "⚙️ Creating GitHub workflows..."

# GitHub workflows
mkdir -p .github/workflows
touch .github/workflows/ci.yml
touch .github/workflows/deploy.yml

echo "✅ Project structure created successfully!"
echo ""
echo "📋 Summary:"
echo "- Root configuration files: ✅"
echo "- Public assets directory: ✅"  
echo "- Prisma schema and seed: ✅"
echo "- Next.js App Router structure: ✅"
echo "- Store routes (products, category, search, cart): ✅"
echo "- Account routes (profile, orders): ✅"
echo "- Admin dashboard routes: ✅"
echo "- API routes (auth, stripe, upload): ✅"
echo "- Components (UI, product, cart): ✅"
echo "- Lib utilities (auth, stripe, cache): ✅"
echo "- Server actions and queries: ✅"
echo "- Email templates: ✅"
echo "- Styles directory: ✅"
echo "- Test structure (unit, integration, e2e): ✅"
echo "- GitHub workflows: ✅"
echo ""
echo "🎯 Next steps:"
echo "1. Navigate to the project: cd $PROJECT_NAME"
echo "2. Initialize git: git init"
echo "3. Start building your e-commerce platform!"
echo ""
echo "🔥 Happy coding!"