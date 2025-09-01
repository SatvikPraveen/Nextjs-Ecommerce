// tests/setup.ts

import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

// Global test setup and configuration

// Mock Prisma Client
export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>;

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
  useSearchParams: () => ({
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
  }),
  usePathname: () => '/test-path',
}));

// Mock React hooks
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  useEffect: jest.fn(),
  useContext: jest.fn(),
  useReducer: jest.fn(),
  useCallback: jest.fn(),
  useMemo: jest.fn(),
}));

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_mock';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock';

// Mock window object for browser-specific tests
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
  },
  writable: true,
});

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

// Mock fetch API
global.fetch = jest.fn();

// Mock FormData
global.FormData = jest.fn().mockImplementation(() => ({
  append: jest.fn(),
  delete: jest.fn(),
  get: jest.fn(),
  getAll: jest.fn(),
  has: jest.fn(),
  set: jest.fn(),
  entries: jest.fn(),
  keys: jest.fn(),
  values: jest.fn(),
}));

// Mock File API
global.File = jest.fn().mockImplementation((bits, name, options) => ({
  name,
  size: bits.length,
  type: options?.type || '',
  lastModified: Date.now(),
  slice: jest.fn(),
  stream: jest.fn(),
  text: jest.fn(),
  arrayBuffer: jest.fn(),
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-object-url');
global.URL.revokeObjectURL = jest.fn();

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

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

// Setup local storage mock helper
export const mockLocalStorage = (data: Record<string, string> = {}) => {
  const storage: Record<string, string> = { ...data };
  
  (window.localStorage.getItem as jest.Mock).mockImplementation(key => storage[key] || null);
  (window.localStorage.setItem as jest.Mock).mockImplementation((key, value) => {
    storage[key] = value;
  });
  (window.localStorage.removeItem as jest.Mock).mockImplementation(key => {
    delete storage[key];
  });
  (window.localStorage.clear as jest.Mock).mockImplementation(() => {
    Object.keys(storage).forEach(key => delete storage[key]);
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
  
  // Clear local storage mock
  (window.localStorage.clear as jest.Mock).mockClear();
  (window.localStorage.getItem as jest.Mock).mockClear();
  (window.localStorage.setItem as jest.Mock).mockClear();
  (window.localStorage.removeItem as jest.Mock).mockClear();
});

afterEach(() => {
  // Clean up any test-specific state
  jest.useRealTimers();
});

// Custom matchers
expect.extend({
  toBeValidUUID(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
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

// TypeScript type extensions
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidUUID(): R;
      toBeValidEmail(): R;
    }
  }
}

// Cleanup function for integration tests
export const cleanup = () => {
  // Reset database state if needed
  // Clear any external API mocks
  // Reset global state
};

export default {};