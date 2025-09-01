// tests/unit/validation.test.ts

import { describe, it, expect } from '@jest/globals';
import { z } from 'zod';

// Validation schemas
const ProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100, 'Product name too long'),
  price: z.number().positive('Price must be positive').max(999999, 'Price too high'),
  description: z.string().min(10, 'Description too short').max(1000, 'Description too long'),
  categoryId: z.string().uuid('Invalid category ID'),
  images: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image required'),
  inStock: z.boolean(),
  sku: z.string().min(3, 'SKU too short').max(50, 'SKU too long'),
});

const UserRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain special character'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
});

const AddressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  address: z.string().min(5, 'Address too short'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required').max(3, 'Invalid state code'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  country: z.string().length(2, 'Invalid country code'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
});

const CheckoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid('Invalid product ID'),
    quantity: z.number().int('Quantity must be integer').positive('Quantity must be positive').max(10, 'Max quantity is 10'),
    price: z.number().positive('Price must be positive'),
  })).min(1, 'At least one item required'),
  shippingAddress: AddressSchema,
  billingAddress: AddressSchema.optional(),
  email: z.string().email('Invalid email address'),
});

const OrderStatusSchema = z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'], {
  errorMap: () => ({ message: 'Invalid order status' })
});

const PaymentMethodSchema = z.enum(['stripe', 'paypal', 'apple_pay', 'google_pay'], {
  errorMap: () => ({ message: 'Invalid payment method' })
});

describe('Product Validation', () => {
  describe('ProductSchema', () => {
    const validProduct = {
      name: 'Test Product',
      price: 29.99,
      description: 'This is a test product with a valid description',
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
      inStock: true,
      sku: 'TEST-PROD-001',
    };

    it('should validate correct product data', () => {
      expect(() => ProductSchema.parse(validProduct)).not.toThrow();
    });

    it('should reject empty product name', () => {
      const invalidProduct = { ...validProduct, name: '' };
      expect(() => ProductSchema.parse(invalidProduct)).toThrow('Product name is required');
    });

    it('should reject long product name', () => {
      const invalidProduct = { ...validProduct, name: 'x'.repeat(101) };
      expect(() => ProductSchema.parse(invalidProduct)).toThrow('Product name too long');
    });

    it('should reject negative price', () => {
      const invalidProduct = { ...validProduct, price: -10 };
      expect(() => ProductSchema.parse(invalidProduct)).toThrow('Price must be positive');
    });

    it('should reject zero price', () => {
      const invalidProduct = { ...validProduct, price: 0 };
      expect(() => ProductSchema.parse(invalidProduct)).toThrow('Price must be positive');
    });

    it('should reject short description', () => {
      const invalidProduct = { ...validProduct, description: 'Short' };
      expect(() => ProductSchema.parse(invalidProduct)).toThrow('Description too short');
    });

    it('should reject invalid category ID', () => {
      const invalidProduct = { ...validProduct, categoryId: 'invalid-uuid' };
      expect(() => ProductSchema.parse(invalidProduct)).toThrow('Invalid category ID');
    });

    it('should reject empty images array', () => {
      const invalidProduct = { ...validProduct, images: [] };
      expect(() => ProductSchema.parse(invalidProduct)).toThrow('At least one image required');
    });

    it('should reject invalid image URLs', () => {
      const invalidProduct = { ...validProduct, images: ['not-a-url'] };
      expect(() => ProductSchema.parse(invalidProduct)).toThrow('Invalid image URL');
    });

    it('should reject short SKU', () => {
      const invalidProduct = { ...validProduct, sku: 'AB' };
      expect(() => ProductSchema.parse(invalidProduct)).toThrow('SKU too short');
    });
  });
});

describe('User Registration Validation', () => {
  describe('UserRegistrationSchema', () => {
    const validUser = {
      email: 'user@example.com',
      password: 'SecurePass123!',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
    };

    it('should validate correct user data', () => {
      expect(() => UserRegistrationSchema.parse(validUser)).not.toThrow();
    });

    it('should validate user without phone', () => {
      const { phone, ...userWithoutPhone } = validUser;
      expect(() => UserRegistrationSchema.parse(userWithoutPhone)).not.toThrow();
    });

    it('should reject invalid email', () => {
      const invalidUser = { ...validUser, email: 'invalid-email' };
      expect(() => UserRegistrationSchema.parse(invalidUser)).toThrow('Invalid email address');
    });

    it('should reject short password', () => {
      const invalidUser = { ...validUser, password: 'Short1!' };
      expect(() => UserRegistrationSchema.parse(invalidUser)).toThrow('Password must be at least 8 characters');
    });

    it('should reject password without uppercase', () => {
      const invalidUser = { ...validUser, password: 'lowercase123!' };
      expect(() => UserRegistrationSchema.parse(invalidUser)).toThrow('Password must contain uppercase letter');
    });

    it('should reject password without lowercase', () => {
      const invalidUser = { ...validUser, password: 'UPPERCASE123!' };
      expect(() => UserRegistrationSchema.parse(invalidUser)).toThrow('Password must contain lowercase letter');
    });

    it('should reject password without number', () => {
      const invalidUser = { ...validUser, password: 'NoNumbers!' };
      expect(() => UserRegistrationSchema.parse(invalidUser)).toThrow('Password must contain number');
    });

    it('should reject password without special character', () => {
      const invalidUser = { ...validUser, password: 'NoSpecial123' };
      expect(() => UserRegistrationSchema.parse(invalidUser)).toThrow('Password must contain special character');
    });

    it('should reject empty first name', () => {
      const invalidUser = { ...validUser, firstName: '' };
      expect(() => UserRegistrationSchema.parse(invalidUser)).toThrow('First name is required');
    });

    it('should reject invalid phone number', () => {
      const invalidUser = { ...validUser, phone: 'invalid-phone' };
      expect(() => UserRegistrationSchema.parse(invalidUser)).toThrow('Invalid phone number');
    });
  });
});

describe('Address Validation', () => {
  describe('AddressSchema', () => {
    const validAddress = {
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
      phone: '+1234567890',
    };

    it('should validate correct address', () => {
      expect(() => AddressSchema.parse(validAddress)).not.toThrow();
    });

    it('should validate address without phone', () => {
      const { phone, ...addressWithoutPhone } = validAddress;
      expect(() => AddressSchema.parse(addressWithoutPhone)).not.toThrow();
    });

    it('should reject short address', () => {
      const invalidAddress = { ...validAddress, address: '123' };
      expect(() => AddressSchema.parse(invalidAddress)).toThrow('Address too short');
    });

    it('should reject invalid ZIP code', () => {
      const invalidAddress = { ...validAddress, zipCode: '1234' };
      expect(() => AddressSchema.parse(invalidAddress)).toThrow('Invalid ZIP code');
    });

    it('should accept ZIP+4 format', () => {
      const validZip4Address = { ...validAddress, zipCode: '10001-1234' };
      expect(() => AddressSchema.parse(validZip4Address)).not.toThrow();
    });

    it('should reject invalid state code', () => {
      const invalidAddress = { ...validAddress, state: 'X' };
      expect(() => AddressSchema.parse(invalidAddress)).toThrow('Invalid state code');
    });

    it('should reject invalid country code', () => {
      const invalidAddress = { ...validAddress, country: 'USA' };
      expect(() => AddressSchema.parse(invalidAddress)).toThrow('Invalid country code');
    });
  });
});

describe('Checkout Validation', () => {
  describe('CheckoutSchema', () => {
    const validCheckout = {
      items: [
        {
          productId: '123e4567-e89b-12d3-a456-426614174000',
          quantity: 2,
          price: 29.99,
        },
      ],
      shippingAddress: {
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'US',
      },
      email: 'customer@example.com',
    };

    it('should validate correct checkout data', () => {
      expect(() => CheckoutSchema.parse(validCheckout)).not.toThrow();
    });

    it('should validate checkout with billing address', () => {
      const checkoutWithBilling = {
        ...validCheckout,
        billingAddress: {
          firstName: 'Jane',
          lastName: 'Smith',
          address: '456 Billing St',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          country: 'US',
        },
      };
      expect(() => CheckoutSchema.parse(checkoutWithBilling)).not.toThrow();
    });

    it('should reject empty items array', () => {
      const invalidCheckout = { ...validCheckout, items: [] };
      expect(() => CheckoutSchema.parse(invalidCheckout)).toThrow('At least one item required');
    });

    it('should reject invalid product ID in items', () => {
      const invalidCheckout = {
        ...validCheckout,
        items: [{ ...validCheckout.items[0], productId: 'invalid-id' }],
      };
      expect(() => CheckoutSchema.parse(invalidCheckout)).toThrow('Invalid product ID');
    });

    it('should reject zero quantity', () => {
      const invalidCheckout = {
        ...validCheckout,
        items: [{ ...validCheckout.items[0], quantity: 0 }],
      };
      expect(() => CheckoutSchema.parse(invalidCheckout)).toThrow('Quantity must be positive');
    });

    it('should reject high quantity', () => {
      const invalidCheckout = {
        ...validCheckout,
        items: [{ ...validCheckout.items[0], quantity: 11 }],
      };
      expect(() => CheckoutSchema.parse(invalidCheckout)).toThrow('Max quantity is 10');
    });

    it('should reject invalid email', () => {
      const invalidCheckout = { ...validCheckout, email: 'invalid-email' };
      expect(() => CheckoutSchema.parse(invalidCheckout)).toThrow('Invalid email address');
    });
  });
});

describe('Enum Validations', () => {
  describe('OrderStatusSchema', () => {
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    it('should validate correct order statuses', () => {
      validStatuses.forEach(status => {
        expect(() => OrderStatusSchema.parse(status)).not.toThrow();
      });
    });

    it('should reject invalid order status', () => {
      expect(() => OrderStatusSchema.parse('invalid-status')).toThrow('Invalid order status');
    });
  });

  describe('PaymentMethodSchema', () => {
    const validMethods = ['stripe', 'paypal', 'apple_pay', 'google_pay'];
    
    it('should validate correct payment methods', () => {
      validMethods.forEach(method => {
        expect(() => PaymentMethodSchema.parse(method)).not.toThrow();
      });
    });

    it('should reject invalid payment method', () => {
      expect(() => PaymentMethodSchema.parse('bitcoin')).toThrow('Invalid payment method');
    });
  });
});

describe('Complex Validation Scenarios', () => {
  it('should validate complete checkout with multiple items', () => {
    const complexCheckout = {
      items: [
        {
          productId: '123e4567-e89b-12d3-a456-426614174001',
          quantity: 2,
          price: 29.99,
        },
        {
          productId: '123e4567-e89b-12d3-a456-426614174002',
          quantity: 1,
          price: 199.99,
        },
      ],
      shippingAddress: {
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001-1234',
        country: 'US',
        phone: '+1-555-123-4567',
      },
      billingAddress: {
        firstName: 'John',
        lastName: 'Doe',
        address: '456 Billing Ave',
        city: 'New York',
        state: 'NY',
        zipCode: '10002',
        country: 'US',
      },
      email: 'john.doe@example.com',
    };

    expect(() => CheckoutSchema.parse(complexCheckout)).not.toThrow();
  });

  it('should handle validation errors gracefully', () => {
    const invalidData = {
      name: '',
      price: -10,
      description: 'Short',
    };

    try {
      ProductSchema.parse(invalidData);
    } catch (error: any) {
      expect(error.errors).toHaveLength(3);
      expect(error.errors[0].message).toBe('Product name is required');
      expect(error.errors[1].message).toBe('Price must be positive');
      expect(error.errors[2].message).toBe('Description too short');
    }
  });

  it('should transform data during validation', () => {
    const ProductWithTransformSchema = z.object({
      name: z.string().trim().min(1),
      price: z.string().transform(val => parseFloat(val)),
      inStock: z.string().transform(val => val === 'true'),
    });

    const input = {
      name: '  Product Name  ',
      price: '29.99',
      inStock: 'true',
    };

    const result = ProductWithTransformSchema.parse(input);

    expect(result).toEqual({
      name: 'Product Name',
      price: 29.99,
      inStock: true,
    });
  });
});