// tests/integration/api.test.ts

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';
import { testApiHandler } from 'next-test-api-route-handler';
import handler from '../../app/api/products/route';
import cartHandler from '../../app/api/cart/route';
import checkoutHandler from '../../app/api/stripe/create-checkout/route';

// Mock Prisma client
jest.mock('../../lib/prisma', () => ({
  product: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  order: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

// Mock Stripe
jest.mock('../../lib/stripe', () => ({
  checkout: {
    sessions: {
      create: jest.fn(),
    },
  },
}));

describe('Products API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/products', () => {
    it('should return products list', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Test Product',
          price: 29.99,
          description: 'Test description',
          slug: 'test-product',
          categoryId: '1',
          inStock: true,
          images: ['test.jpg'],
        },
      ];

      const { prisma } = require('../../lib/prisma');
      prisma.product.findMany.mockResolvedValue(mockProducts);

      await testApiHandler({
        handler: handler.GET,
        test: async ({ fetch }) => {
          const res = await fetch({ method: 'GET' });
          const data = await res.json();

          expect(res.status).toBe(200);
          expect(data.products).toEqual(mockProducts);
        },
      });
    });

    it('should handle search query', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Searchable Product',
          price: 29.99,
          description: 'Test description',
          slug: 'searchable-product',
          categoryId: '1',
          inStock: true,
          images: ['test.jpg'],
        },
      ];

      const { prisma } = require('../../lib/prisma');
      prisma.product.findMany.mockResolvedValue(mockProducts);

      await testApiHandler({
        handler: handler.GET,
        url: '/api/products?search=searchable',
        test: async ({ fetch }) => {
          const res = await fetch({ method: 'GET' });
          const data = await res.json();

          expect(res.status).toBe(200);
          expect(data.products).toEqual(mockProducts);
          expect(prisma.product.findMany).toHaveBeenCalledWith({
            where: {
              OR: [
                { name: { contains: 'searchable', mode: 'insensitive' } },
                { description: { contains: 'searchable', mode: 'insensitive' } },
              ],
            },
            include: { category: true },
          });
        },
      });
    });

    it('should handle category filter', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Electronics Product',
          price: 29.99,
          description: 'Test description',
          slug: 'electronics-product',
          categoryId: '1',
          inStock: true,
          images: ['test.jpg'],
        },
      ];

      const { prisma } = require('../../lib/prisma');
      prisma.product.findMany.mockResolvedValue(mockProducts);

      await testApiHandler({
        handler: handler.GET,
        url: '/api/products?category=electronics',
        test: async ({ fetch }) => {
          const res = await fetch({ method: 'GET' });
          const data = await res.json();

          expect(res.status).toBe(200);
          expect(data.products).toEqual(mockProducts);
          expect(prisma.product.findMany).toHaveBeenCalledWith({
            where: {
              category: { slug: 'electronics' },
            },
            include: { category: true },
          });
        },
      });
    });

    it('should handle database error', async () => {
      const { prisma } = require('../../lib/prisma');
      prisma.product.findMany.mockRejectedValue(new Error('Database error'));

      await testApiHandler({
        handler: handler.GET,
        test: async ({ fetch }) => {
          const res = await fetch({ method: 'GET' });
          const data = await res.json();

          expect(res.status).toBe(500);
          expect(data.error).toBe('Internal server error');
        },
      });
    });
  });

  describe('POST /api/products', () => {
    it('should create new product (admin only)', async () => {
      const newProduct = {
        name: 'New Product',
        price: 49.99,
        description: 'New product description',
        categoryId: '1',
        images: ['new-product.jpg'],
      };

      const createdProduct = {
        id: '2',
        slug: 'new-product',
        inStock: true,
        ...newProduct,
      };

      const { prisma } = require('../../lib/prisma');
      prisma.product.create.mockResolvedValue(createdProduct);

      await testApiHandler({
        handler: handler.POST,
        test: async ({ fetch }) => {
          const res = await fetch({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-User-Role': 'admin',
            },
            body: JSON.stringify(newProduct),
          });
          const data = await res.json();

          expect(res.status).toBe(201);
          expect(data.product).toEqual(createdProduct);
        },
      });
    });

    it('should reject non-admin users', async () => {
      const newProduct = {
        name: 'New Product',
        price: 49.99,
        description: 'New product description',
        categoryId: '1',
        images: ['new-product.jpg'],
      };

      await testApiHandler({
        handler: handler.POST,
        test: async ({ fetch }) => {
          const res = await fetch({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-User-Role': 'user',
            },
            body: JSON.stringify(newProduct),
          });
          const data = await res.json();

          expect(res.status).toBe(403);
          expect(data.error).toBe('Admin access required');
        },
      });
    });

    it('should validate required fields', async () => {
      const invalidProduct = {
        name: '',
        price: -10,
        description: '',
      };

      await testApiHandler({
        handler: handler.POST,
        test: async ({ fetch }) => {
          const res = await fetch({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-User-Role': 'admin',
            },
            body: JSON.stringify(invalidProduct),
          });
          const data = await res.json();

          expect(res.status).toBe(400);
          expect(data.error).toContain('validation');
        },
      });
    });
  });
});

describe('Cart API Integration', () => {
  describe('POST /api/cart', () => {
    it('should add item to cart', async () => {
      const cartItem = {
        productId: '1',
        quantity: 2,
      };

      const mockProduct = {
        id: '1',
        name: 'Test Product',
        price: 29.99,
        inStock: true,
      };

      const { prisma } = require('../../lib/prisma');
      prisma.product.findUnique.mockResolvedValue(mockProduct);

      await testApiHandler({
        handler: cartHandler.POST,
        test: async ({ fetch }) => {
          const res = await fetch({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(cartItem),
          });
          const data = await res.json();

          expect(res.status).toBe(200);
          expect(data.success).toBe(true);
          expect(data.item).toMatchObject({
            productId: '1',
            quantity: 2,
          });
        },
      });
    });

    it('should handle out of stock products', async () => {
      const cartItem = {
        productId: '1',
        quantity: 1,
      };

      const mockProduct = {
        id: '1',
        name: 'Test Product',
        price: 29.99,
        inStock: false,
      };

      const { prisma } = require('../../lib/prisma');
      prisma.product.findUnique.mockResolvedValue(mockProduct);

      await testApiHandler({
        handler: cartHandler.POST,
        test: async ({ fetch }) => {
          const res = await fetch({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(cartItem),
          });
          const data = await res.json();

          expect(res.status).toBe(400);
          expect(data.error).toBe('Product is out of stock');
        },
      });
    });

    it('should handle non-existent products', async () => {
      const cartItem = {
        productId: '999',
        quantity: 1,
      };

      const { prisma } = require('../../lib/prisma');
      prisma.product.findUnique.mockResolvedValue(null);

      await testApiHandler({
        handler: cartHandler.POST,
        test: async ({ fetch }) => {
          const res = await fetch({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(cartItem),
          });
          const data = await res.json();

          expect(res.status).toBe(404);
          expect(data.error).toBe('Product not found');
        },
      });
    });
  });
});

describe('Checkout API Integration', () => {
  describe('POST /api/stripe/create-checkout', () => {
    it('should create checkout session', async () => {
      const checkoutData = {
        items: [
          {
            productId: '1',
            quantity: 2,
            price: 29.99,
            name: 'Test Product',
          },
        ],
        customerEmail: 'test@example.com',
      };

      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      };

      const stripe = require('../../lib/stripe');
      stripe.checkout.sessions.create.mockResolvedValue(mockSession);

      await testApiHandler({
        handler: checkoutHandler.POST,
        test: async ({ fetch }) => {
          const res = await fetch({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(checkoutData),
          });
          const data = await res.json();

          expect(res.status).toBe(200);
          expect(data.sessionId).toBe('cs_test_123');
          expect(data.url).toBe('https://checkout.stripe.com/pay/cs_test_123');
        },
      });
    });

    it('should validate checkout data', async () => {
      const invalidCheckoutData = {
        items: [],
        customerEmail: 'invalid-email',
      };

      await testApiHandler({
        handler: checkoutHandler.POST,
        test: async ({ fetch }) => {
          const res = await fetch({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(invalidCheckoutData),
          });
          const data = await res.json();

          expect(res.status).toBe(400);
          expect(data.error).toContain('validation');
        },
      });
    });

    it('should handle Stripe errors', async () => {
      const checkoutData = {
        items: [
          {
            productId: '1',
            quantity: 1,
            price: 29.99,
            name: 'Test Product',
          },
        ],
        customerEmail: 'test@example.com',
      };

      const stripe = require('../../lib/stripe');
      stripe.checkout.sessions.create.mockRejectedValue(
        new Error('Stripe API error')
      );

      await testApiHandler({
        handler: checkoutHandler.POST,
        test: async ({ fetch }) => {
          const res = await fetch({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(checkoutData),
          });
          const data = await res.json();

          expect(res.status).toBe(500);
          expect(data.error).toBe('Payment processing error');
        },
      });
    });
  });
});