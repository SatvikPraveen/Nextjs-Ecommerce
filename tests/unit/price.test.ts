// tests/unit/price.test.ts

import { describe, it, expect } from '@jest/globals';

// Mock price calculation functions
const calculatePrice = (basePrice: number, discount: number = 0): number => {
  if (basePrice < 0) throw new Error('Price cannot be negative');
  if (discount < 0 || discount > 1) throw new Error('Discount must be between 0 and 1');
  return Math.round((basePrice * (1 - discount)) * 100) / 100;
};

const calculateTax = (price: number, taxRate: number = 0.08): number => {
  if (price < 0) throw new Error('Price cannot be negative');
  if (taxRate < 0) throw new Error('Tax rate cannot be negative');
  return Math.round((price * taxRate) * 100) / 100;
};

const calculateTotal = (price: number, tax: number, shipping: number = 0): number => {
  if (price < 0 || tax < 0 || shipping < 0) {
    throw new Error('Values cannot be negative');
  }
  return Math.round((price + tax + shipping) * 100) / 100;
};

const formatPrice = (price: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price);
};

describe('Price Calculations', () => {
  describe('calculatePrice', () => {
    it('should return correct price without discount', () => {
      expect(calculatePrice(100)).toBe(100);
      expect(calculatePrice(99.99)).toBe(99.99);
    });

    it('should apply discount correctly', () => {
      expect(calculatePrice(100, 0.1)).toBe(90);
      expect(calculatePrice(50, 0.2)).toBe(40);
      expect(calculatePrice(99.99, 0.15)).toBe(84.99);
    });

    it('should handle edge cases', () => {
      expect(calculatePrice(0)).toBe(0);
      expect(calculatePrice(100, 0)).toBe(100);
      expect(calculatePrice(100, 1)).toBe(0);
    });

    it('should throw error for negative prices', () => {
      expect(() => calculatePrice(-10)).toThrow('Price cannot be negative');
    });

    it('should throw error for invalid discounts', () => {
      expect(() => calculatePrice(100, -0.1)).toThrow('Discount must be between 0 and 1');
      expect(() => calculatePrice(100, 1.1)).toThrow('Discount must be between 0 and 1');
    });
  });

  describe('calculateTax', () => {
    it('should calculate tax correctly with default rate', () => {
      expect(calculateTax(100)).toBe(8);
      expect(calculateTax(50)).toBe(4);
    });

    it('should calculate tax with custom rate', () => {
      expect(calculateTax(100, 0.1)).toBe(10);
      expect(calculateTax(100, 0.05)).toBe(5);
    });

    it('should handle zero values', () => {
      expect(calculateTax(0)).toBe(0);
      expect(calculateTax(100, 0)).toBe(0);
    });

    it('should throw error for negative values', () => {
      expect(() => calculateTax(-10)).toThrow('Price cannot be negative');
      expect(() => calculateTax(100, -0.1)).toThrow('Tax rate cannot be negative');
    });

    it('should round to 2 decimal places', () => {
      expect(calculateTax(33.33, 0.08)).toBe(2.67);
    });
  });

  describe('calculateTotal', () => {
    it('should calculate total correctly', () => {
      expect(calculateTotal(100, 8, 10)).toBe(118);
      expect(calculateTotal(50, 4, 5)).toBe(59);
    });

    it('should handle zero shipping', () => {
      expect(calculateTotal(100, 8)).toBe(108);
      expect(calculateTotal(100, 8, 0)).toBe(108);
    });

    it('should throw error for negative values', () => {
      expect(() => calculateTotal(-10, 8, 10)).toThrow('Values cannot be negative');
      expect(() => calculateTotal(100, -8, 10)).toThrow('Values cannot be negative');
      expect(() => calculateTotal(100, 8, -10)).toThrow('Values cannot be negative');
    });

    it('should round to 2 decimal places', () => {
      expect(calculateTotal(33.33, 2.67, 4.99)).toBe(40.99);
    });
  });

  describe('formatPrice', () => {
    it('should format price with default currency', () => {
      expect(formatPrice(100)).toBe('$100.00');
      expect(formatPrice(99.99)).toBe('$99.99');
      expect(formatPrice(0)).toBe('$0.00');
    });

    it('should format price with custom currency', () => {
      expect(formatPrice(100, 'EUR')).toBe('€100.00');
      expect(formatPrice(100, 'GBP')).toBe('£100.00');
    });

    it('should handle decimal values', () => {
      expect(formatPrice(99.5)).toBe('$99.50');
      expect(formatPrice(99.999)).toBe('$100.00');
    });
  });
});

describe('Price Integration Tests', () => {
  it('should calculate final price with discount, tax, and shipping', () => {
    const basePrice = 100;
    const discount = 0.1; // 10% discount
    const taxRate = 0.08; // 8% tax
    const shipping = 10;

    const discountedPrice = calculatePrice(basePrice, discount);
    expect(discountedPrice).toBe(90);

    const tax = calculateTax(discountedPrice, taxRate);
    expect(tax).toBe(7.2);

    const total = calculateTotal(discountedPrice, tax, shipping);
    expect(total).toBe(107.2);

    const formatted = formatPrice(total);
    expect(formatted).toBe('$107.20');
  });

  it('should handle complex calculation scenarios', () => {
    const scenarios = [
      { price: 29.99, discount: 0.15, taxRate: 0.0875, shipping: 5.99 },
      { price: 199.99, discount: 0.25, taxRate: 0.06, shipping: 0 },
      { price: 49.50, discount: 0, taxRate: 0.1, shipping: 7.50 },
    ];

    scenarios.forEach((scenario, index) => {
      const discountedPrice = calculatePrice(scenario.price, scenario.discount);
      const tax = calculateTax(discountedPrice, scenario.taxRate);
      const total = calculateTotal(discountedPrice, tax, scenario.shipping);
      const formatted = formatPrice(total);

      expect(discountedPrice).toBeGreaterThanOrEqual(0);
      expect(tax).toBeGreaterThanOrEqual(0);
      expect(total).toBeGreaterThanOrEqual(0);
      expect(formatted).toMatch(/^\$\d+\.\d{2}$/);
    });
  });
});