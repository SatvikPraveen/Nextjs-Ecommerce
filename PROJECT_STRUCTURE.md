.
├── .env.example
├── .eslintrc.js
├── .github
│   └── workflows
│   ├── ci.yml
│   └── deploy.yml
├── .gitignore
├── .prettierignore
├── .prettierrc
├── app
│   ├── (account)
│   │   ├── orders
│   │   │   └── [id]
│   │   │   └── page.tsx
│   │   └── profile
│   │   └── page.tsx
│   ├── (store)
│   │   ├── cart
│   │   │   └── page.tsx
│   │   ├── category
│   │   │   └── [slug]
│   │   │   └── page.tsx
│   │   ├── products
│   │   │   └── [slug]
│   │   │   └── page.tsx
│   │   └── search
│   │   └── page.tsx
│   ├── admin
│   │   ├── inventory
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   ├── orders
│   │   │   └── page.tsx
│   │   └── products
│   │   └── page.tsx
│   ├── api
│   │   ├── auth
│   │   │   └── [...nextauth]
│   │   │   └── route.ts
│   │   ├── revalidate
│   │   │   └── route.ts
│   │   ├── stripe
│   │   │   ├── create-checkout
│   │   │   │   └── route.ts
│   │   │   └── webhook
│   │   │   └── route.ts
│   │   └── upload
│   │   └── route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   ├── robots.ts
│   └── sitemap.ts
├── components
│   ├── add-to-cart.tsx
│   ├── cart-drawer.tsx
│   ├── data-table.tsx
│   ├── jsonld.tsx
│   ├── product-card.tsx
│   ├── product-grid.tsx
│   └── ui
│   ├── badge.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── sheet.tsx
│   └── table.tsx
├── docker-compose.yml
├── Dockerfile
├── emails
│   ├── OrderConfirmation.tsx
│   └── ResetPassword.tsx
├── generate-project-structure.sh
├── lib
│   ├── auth.ts
│   ├── cache.ts
│   ├── emails.ts
│   ├── prisma.ts
│   ├── roles.ts
│   ├── stripe.ts
│   ├── uploader.ts
│   ├── utils.ts
│   └── validators.ts
├── middleware.ts
├── next.config.mjs
├── package.json
├── postcss.config.js
├── prisma
│   ├── schema.prisma
│   └── seed.ts
├── PROJECT_STRUCTURE.md
├── public
│   ├── favicon.ico
│   └── images
│   └── placeholder.svg
├── README.md
├── server
│   ├── actions
│   │   ├── admin.ts
│   │   ├── cart.ts
│   │   ├── checkout.ts
│   │   └── products.ts
│   └── queries
│   ├── inventory.ts
│   ├── orders.ts
│   └── products.ts
├── styles
│   └── globals.css
├── tailwind.config.ts
├── tests
│   ├── e2e
│   │   └── cypress
│   │   ├── cypress.config.ts
│   │   ├── e2e
│   │   │   └── checkout.cy.ts
│   │   ├── fixtures
│   │   │   ├── orders.json
│   │   │   ├── products.json
│   │   │   └── users.json
│   │   └── support
│   │   ├── commands.ts
│   │   └── e2e.ts
│   ├── globalSetup.js
│   ├── globalTeardown.js
│   ├── integration
│   │   ├── api.test.ts
│   │   ├── auth.test.ts
│   │   └── database.test.ts
│   ├── jest.config.js
│   ├── setup.ts
│   └── unit
│   ├── price.test.ts
│   ├── utils.test.ts
│   └── validation.test.ts
└── tsconfig.json

46 directories, 90 files
