// tests/integration/auth.test.ts

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { middleware } from '../../middleware';
import { testApiHandler } from 'next-test-api-route-handler';
import authHandler from '../../app/api/auth/[...nextauth]/route';

// Mock NextAuth
jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}));

jest.mock('../../lib/auth', () => ({
  authOptions: {
    providers: [],
    callbacks: {
      jwt: jest.fn(),
      session: jest.fn(),
    },
  },
}));

const mockGetToken = getToken as jest.MockedFunction<typeof getToken>;

describe('Authentication Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Middleware Authentication', () => {
    it('should allow access to public routes', async () => {
      mockGetToken.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/');
      const response = await middleware(request);

      expect(response).toBeDefined();
      expect(response.status).not.toBe(302); // Not redirected
    });

    it('should redirect unauthenticated users from protected routes', async () => {
      mockGetToken.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/profile');
      const response = await middleware(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toContain('/auth/signin');
    });

    it('should allow authenticated users to access protected routes', async () => {
      mockGetToken.mockResolvedValue({
        sub: 'user-123',
        email: 'user@example.com',
        role: 'customer',
      } as any);

      const request = new NextRequest('http://localhost:3000/profile');
      const response = await middleware(request);

      expect(response).toBeDefined();
      expect(response.status).not.toBe(302);
    });

    it('should redirect unauthenticated users from admin routes', async () => {
      mockGetToken.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/admin/products');
      const response = await middleware(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toContain('/auth/signin');
    });

    it('should block non-admin users from admin routes', async () => {
      mockGetToken.mockResolvedValue({
        sub: 'user-123',
        email: 'user@example.com',
        role: 'customer',
      } as any);

      const request = new NextRequest('http://localhost:3000/admin/products');
      const response = await middleware(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toContain('/access-denied');
    });

    it('should allow admin users to access admin routes', async () => {
      mockGetToken.mockResolvedValue({
        sub: 'admin-123',
        email: 'admin@example.com',
        role: 'admin',
      } as any);

      const request = new NextRequest('http://localhost:3000/admin/products');
      const response = await middleware(request);

      expect(response).toBeDefined();
      expect(response.status).not.toBe(302);
    });

    it('should redirect authenticated users from auth routes', async () => {
      mockGetToken.mockResolvedValue({
        sub: 'user-123',
        email: 'user@example.com',
        role: 'customer',
      } as any);

      const request = new NextRequest('http://localhost:3000/auth/signin');
      const response = await middleware(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toContain('/profile');
    });

    it('should handle callback URL redirect after login', async () => {
      mockGetToken.mockResolvedValue({
        sub: 'user-123',
        email: 'user@example.com',
        role: 'customer',
      } as any);

      const request = new NextRequest('http://localhost:3000/auth/signin?callbackUrl=/cart');
      const response = await middleware(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toContain('/cart');
    });
  });

  describe('API Route Authentication', () => {
    it('should block unauthenticated requests to protected API routes', async () => {
      mockGetToken.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/profile');
      const response = await middleware(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Authentication required');
    });

    it('should allow authenticated requests to protected API routes', async () => {
      mockGetToken.mockResolvedValue({
        sub: 'user-123',
        email: 'user@example.com',
        role: 'customer',
      } as any);

      const request = new NextRequest('http://localhost:3000/api/profile');
      const response = await middleware(request);

      expect(response).toBeDefined();
      expect(response.status).not.toBe(401);
    });

    it('should block non-admin requests to admin API routes', async () => {
      mockGetToken.mockResolvedValue({
        sub: 'user-123',
        email: 'user@example.com',
        role: 'customer',
      } as any);

      const request = new NextRequest('http://localhost:3000/api/admin/products');
      const response = await middleware(request);

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe('Admin access required');
    });

    it('should allow admin requests to admin API routes', async () => {
      mockGetToken.mockResolvedValue({
        sub: 'admin-123',
        email: 'admin@example.com',
        role: 'admin',
      } as any);

      const request = new NextRequest('http://localhost:3000/api/admin/products');
      const response = await middleware(request);

      expect(response).toBeDefined();
      expect(response.status).not.toBe(403);
    });

    it('should add user headers for authenticated API requests', async () => {
      mockGetToken.mockResolvedValue({
        sub: 'user-123',
        email: 'user@example.com',
        role: 'customer',
      } as any);

      const request = new NextRequest('http://localhost:3000/api/profile');
      const response = await middleware(request);

      expect(response.headers.get('X-User-ID')).toBe('user-123');
      expect(response.headers.get('X-User-Role')).toBe('customer');
      expect(response.headers.get('X-User-Email')).toBe('user@example.com');
    });
  });

  describe('Session Management', () => {
    it('should handle valid JWT tokens', async () => {
      const validToken = {
        sub: 'user-123',
        email: 'user@example.com',
        role: 'customer',
        name: 'Test User',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      };

      mockGetToken.mockResolvedValue(validToken as any);

      const request = new NextRequest('http://localhost:3000/profile');
      const response = await middleware(request);

      expect(response.status).not.toBe(302);
    });

    it('should handle expired JWT tokens', async () => {
      const expiredToken = {
        sub: 'user-123',
        email: 'user@example.com',
        role: 'customer',
        name: 'Test User',
        iat: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
        exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago (expired)
      };

      mockGetToken.mockResolvedValue(expiredToken as any);

      const request = new NextRequest('http://localhost:3000/profile');
      const response = await middleware(request);

      // Should redirect to signin when token is expired
      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toContain('/auth/signin');
    });

    it('should handle malformed JWT tokens', async () => {
      mockGetToken.mockRejectedValue(new Error('Invalid token'));

      const request = new NextRequest('http://localhost:3000/profile');
      const response = await middleware(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toContain('/auth/signin');
    });
  });

  describe('Role-Based Access Control', () => {
    const testCases = [
      {
        role: 'customer',
        allowedRoutes: ['/profile', '/orders'],
        blockedRoutes: ['/admin/products', '/admin/orders'],
      },
      {
        role: 'admin',
        allowedRoutes: ['/profile', '/orders', '/admin/products', '/admin/orders'],
        blockedRoutes: [],
      },
    ];

    testCases.forEach(({ role, allowedRoutes, blockedRoutes }) => {
      describe(`${role} role`, () => {
        const token = {
          sub: 'user-123',
          email: `${role}@example.com`,
          role,
        };

        allowedRoutes.forEach((route) => {
          it(`should allow access to ${route}`, async () => {
            mockGetToken.mockResolvedValue(token as any);

            const request = new NextRequest(`http://localhost:3000${route}`);
            const response = await middleware(request);

            expect(response.status).not.toBe(302);
          });
        });

        blockedRoutes.forEach((route) => {
          it(`should block access to ${route}`, async () => {
            mockGetToken.mockResolvedValue(token as any);

            const request = new NextRequest(`http://localhost:3000${route}`);
            const response = await middleware(request);

            expect(response.status).toBe(302);
          });
        });
      });
    });
  });

  describe('Security Headers', () => {
    it('should add security headers to responses', async () => {
      mockGetToken.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/');
      const response = await middleware(request);

      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('Referrer-Policy')).toBe('origin-when-cross-origin');
      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
      expect(response.headers.get('Content-Security-Policy')).toBeTruthy();
    });

    it('should add CSP headers with correct directives', async () => {
      mockGetToken.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/');
      const response = await middleware(request);

      const csp = response.headers.get('Content-Security-Policy');
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain('https://js.stripe.com');
      expect(csp).toContain('https://api.stripe.com');
    });

    it('should add rate limiting headers for sensitive routes', async () => {
      mockGetToken.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/auth/signin');
      const response = await middleware(request);

      expect(response.headers.get('X-RateLimit-Limit')).toBe('5');
      expect(response.headers.get('X-RateLimit-Remaining')).toBeDefined();
      expect(response.headers.get('X-RateLimit-Reset')).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing authorization header', async () => {
      mockGetToken.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/profile');
      const response = await middleware(request);

      expect(response.status).toBe(401);
    });

    it('should handle malformed authorization header', async () => {
      mockGetToken.mockRejectedValue(new Error('Invalid token format'));

      const request = new NextRequest('http://localhost:3000/profile');
      const response = await middleware(request);

      expect(response.status).toBe(302);
    });

    it('should handle network errors during token validation', async () => {
      mockGetToken.mockRejectedValue(new Error('Network error'));

      const request = new NextRequest('http://localhost:3000/profile');
      const response = await middleware(request);

      expect(response.status).toBe(302);
    });

    it('should handle undefined user role', async () => {
      mockGetToken.mockResolvedValue({
        sub: 'user-123',
        email: 'user@example.com',
        // role is undefined
      } as any);

      const request = new NextRequest('http://localhost:3000/admin/products');
      const response = await middleware(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toContain('/access-denied');
    });

    it('should handle null token gracefully', async () => {
      mockGetToken.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/profile');
      const response = await middleware(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toContain('/auth/signin');
    });
  });
});