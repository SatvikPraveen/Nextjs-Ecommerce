# GitHub Checks - Remaining Issues & Action Plan

## Summary of Completed Fixes ✅

1. **Prisma Schema** - Added Cart model, added missing Order fields (paidAt, cancelledAt, shippingMethod, notes)
2. **Package.json** - Added missing dependencies: nanoid, bcryptjs, jest-junit, wait-on, ts-jest, @jest/globals
3. **Authentication** - Fixed lib/auth.ts with getCurrentSession and proper getCurrentUser implementation
4. **Server Actions** - Fixed checkout.ts and cart.ts to use correct Prisma schema fields
5. **Dockerfile** - Unified npm usage throughout build process

---

## Remaining Critical Issues 🔴

### 1. Jest Configuration Issues

**File:** `tests/jest.config.js`

**Problems:**
- Line 6: `dir: '../'` is incorrect - should be `'./'`
- Line 31: Module nameMapping is overcomplicated
- Lines 35-36: `transform` uses `babel-jest` - should use `ts-jest` for TypeScript
- Lines 44-48: `globalSetup` and `globalTeardown` may cause issues
- Lines 57-63: `jest-junit` reporter configuration included but not essential for CI

**Fix Needed:**
Replace the entire file with proper ts-jest configuration.

### 2. Test Files Have Runtime Errors

**File:** `tests/unit/utils.test.ts`

**Problems:**
- Functions defined inline instead of imported
- Uses `jest.useFakeTimers()` outside of test block
- Circular dependency risk with test imports

**Fix Needed:**
- Extract utility functions to `lib/utils.ts`
- Move timer setup into test blocks
- Simplify imports

**File:** `tests/integration/api.test.ts`

**Problems:**
- Uses `testApiHandler` from `next-test-api-route-handler` which is outdated for App Router
- Tries to import route handlers directly
- Prisma mocking paths don't match actual structure

**Fix Needed:**
- Rewrite tests using Next.js testing patterns
- Use proper App Router handler signatures
- Fix mock paths

### 3. CI/CD Workflow Issues

**File:** `.github/workflows/ci.yml`

**Problems:**
- Line 47: `npm run test:unit` - Now exists ✅
- Line 49: `npm run lint` - Need to verify works
- Line 50: `npm run type-check` - Exists ✅
- Line 51: `npm run build` - Now works ✅
- Line 55: Missing `npm run db:generate` before migrations
- Line 57: Missing environment variable for Prisma
- Line 115: Cypress test depends on application starting correctly

**Specific Errors:**
```bash
# Missing in workflow:
RUN npx prisma generate before migration
# Missing:
SKIP_ENV_VALIDATION=true for prisma generation
```

### 4. Missing API Route Handlers

**Files affected:**
- `app/api/products/route.ts` - Doesn't exist
- `app/api/cart/route.ts` - Doesn't exist
- `app/api/stripe/create-checkout/route.ts` - Doesn't exist
- `app/api/stripe/webhook/route.ts` - Referenced but may not handle correctly

**Issue:** Tests import from these routes but they don't exist or have wrong structure.

### 5. Environment Variables Not Set in CI

**Missing in `.github/workflows/ci.yml`:**
```bash
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
EMAIL_SERVER_HOST
EMAIL_SERVER_PORT
EMAIL_SERVER_USER
EMAIL_SERVER_PASSWORD
EMAIL_FROM
ADMIN_EMAIL
NEXT_PUBLIC_APP_URL
RESEND_API_KEY
```

---

## Step-by-Step Fix Plan

### Step 1: Update Jest Configuration
Replace `tests/jest.config.js` with proper configuration.

### Step 2: Create Utility Test File
Extract functions from test files to `lib/utils.ts`.

### Step 3: Rewrite Test Files
Simplify and fix test implementations.

### Step 4: Create Missing API Routes
Generate stub API route handlers.

### Step 5: Update CI Workflow
Add missing environment variables and prisma setup steps.

### Step 6: Verify Type Checking
Run `npm run type-check` to catch TypeScript errors.

### Step 7: Test Locally
```bash
npm ci
npm run db:generate
npm run type-check
npm run lint
npm run test:unit
npm run build
```

---

## Manual Testing Commands

```bash
# Install dependencies
npm ci

# Generate Prisma
npx prisma generate

# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build

# Unit tests
npm run test:unit

# All tests
npm run test

# Format check
npm run format:check
```

---

## Docker Build Testing

```bash
# Build Docker image locally
docker build -t ecommerce:test .

# Run container
docker run -p 3000:3000 ecommerce:test
```

---

## Security Scan Improvements

To pass npm audit:
1. Review current audit warnings: `npm audit`
2. Update vulnerable packages: `npm audit fix`
3. Consider removing optional dependencies that cause issues

---

## Next Steps

After these fixes are implemented:
1. Run full CI/CD pipeline locally using act or similar tool
2. Verify all checks pass
3. Commit and push to trigger GitHub Actions
4. Monitor workflow execution
5. Fix any remaining environment or deployment issues

---

## Files Modified So Far

✅ `prisma/schema.prisma` - Added Cart model, missing fields  
✅ `package.json` - Added dependencies and scripts  
✅ `lib/auth.ts` - Added getCurrentSession  
✅ `server/actions/checkout.ts` - Fixed schema references  
✅ `server/actions/cart.ts` - Fixed Cart model usage  
✅ `Dockerfile` - Unified npm usage  

## Files Still Needing Updates

⏳ `tests/jest.config.js` - Full rewrite  
⏳ `tests/unit/utils.test.ts` - Rewrite  
⏳ `tests/integration/api.test.ts` - Rewrite  
⏳ `.github/workflows/ci.yml` - Add env vars and prisma  
⏳ `.github/workflows/deploy.yml` - Verify configuration  
⏳ API route handlers - Create missing ones  

---

## Common Issues & Solutions

### Issue: "Cannot find module '@/lib/xyz'"
**Solution:** Check path mapping in tsconfig.json and ensure files exist.

### Issue: "Prisma Client not generated"
**Solution:** Run `npx prisma generate` before building.

### Issue: Tests fail with "Cannot find testApiHandler"
**Solution:** Remove testApiHandler usage - it's for Pages Router, not App Router.

### Issue: "NEXTAUTH_SECRET is not set"
**Solution:** Add to CI environment or use .env.test

### Issue: Docker build fails at npm run build
**Solution:** Ensure all dependencies are installed and Prisma is generated.

---

## Success Criteria

✅ All 4 failing checks pass  
✅ 6 skipped checks run successfully  
✅ Docker image builds successfully  
✅ Tests pass locally and in CI  
✅ Type checking passes  
✅ Linting passes  
✅ No security vulnerabilities in npm audit

---

## Timeline Estimate

- Jest configuration: 15 minutes
- Test file rewrites: 30 minutes
- API route creation: 20 minutes
- CI/CD updates: 15 minutes
- Local testing & debugging: 30 minutes
- **Total: ~2 hours**

