// tests/setup-integration.ts
// Integration test setup - Node environment specific (no browser APIs)

import { beforeAll, afterAll, beforeEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

// Global test setup and configuration

// Mock Prisma Client
export const prismaMock =
  mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>;

// Mock NextAuth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}));

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn(),
        retrieve: jest.fn(),
      },
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
    paymentIntents: {
      create: jest.fn(),
      confirm: jest.fn(),
      retrieve: jest.fn(),
    },
  }));
});

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // Return mock image element
    return { type: 'img', props };
  },
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, ...props }: any) => {
    return { type: 'a', props, children };
  };
});

// Set up test environment variables
(process.env as any).NEXTAUTH_SECRET = 'test-secret';
(process.env as any).NEXTAUTH_URL = 'http://localhost:3000';
(process.env as any).STRIPE_SECRET_KEY = 'sk_test_mock';
process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_mock';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock';

// Mock fetch API (Node environment)
global.fetch = jest.fn();

// Test utilities
export const createMockUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'customer',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockProduct = (overrides = {}) => ({
  id: 'product-123',
  name: 'Test Product',
  slug: 'test-product',
  description: 'A test product',
  price: 29.99,
  categoryId: 'category-123',
  images: ['test.jpg'],
  inStock: true,
  sku: 'TEST-001',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockOrder = (overrides = {}) => ({
  id: 'order-123',
  userId: 'user-123',
  status: 'pending',
  total: 59.98,
  subtotal: 59.98,
  tax: 0,
  shipping: 0,
  currency: 'USD',
  paymentStatus: 'paid',
  paymentMethod: 'stripe',
  createdAt: new Date(),
  updatedAt: new Date(),
  shippingAddress: {
    firstName: 'John',
    lastName: 'Doe',
    address: '123 Test St',
    city: 'Test City',
    state: 'TS',
    zipCode: '12345',
    country: 'US',
  },
  items: [],
  ...overrides,
});

export const createMockCheckoutSession = (overrides = {}) => ({
  id: 'cs_test_123',
  url: 'https://checkout.stripe.com/pay/cs_test_123',
  payment_status: 'unpaid',
  status: 'open',
  ...overrides,
});

// Setup fetch mock helper
export const mockFetchResponse = (data: any, status = 200) => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Map([['content-type', 'application/json']]),
  });
};

// Global setup hooks
beforeAll(() => {
  // Set timezone to UTC for consistent date testing
  process.env.TZ = 'UTC';

  // Suppress console errors during tests unless needed
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  // Cleanup any global state
  jest.restoreAllMocks();
});

beforeEach(() => {
  // Reset all mocks before each test
  mockReset(prismaMock);
  jest.clearAllMocks();

  // Reset fetch mock
  (global.fetch as jest.Mock).mockClear();
});

// TypeScript type extensions
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidUUID(): R;
      toBeValidEmail(): R;
    }
  }
}

// Custom matchers
(expect as any).extend({
  toBeValidUUID(received: string) {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid UUID`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid UUID`,
        pass: false,
      };
    }
  },

  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid email`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid email`,
        pass: false,
      };
    }
  },
});

// Cleanup function for integration tests
export const cleanup = () => {
  // Reset database state if needed
  // Clear any external API mocks
  // Reset global state
};

export default {};
