// tests/unit/utils.test.ts

import { describe, it, expect } from '@jest/globals';

// Utility functions to test
const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

const calculateDiscount = (price: number, discountPercent: number): number => {
  if (discountPercent < 0 || discountPercent > 100) {
    throw new Error('Discount percent must be between 0 and 100');
  }
  return Math.round((price * (discountPercent / 100)) * 100) / 100;
};

const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const truncateText = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + '...';
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

const calculateShipping = (subtotal: number, weight: number = 0): number => {
  const freeShippingThreshold = 100;
  if (subtotal >= freeShippingThreshold) return 0;
  
  const baseRate = 5.99;
  const weightRate = weight > 5 ? (weight - 5) * 1.5 : 0;
  return Math.round((baseRate + weightRate) * 100) / 100;
};

const calculateTaxRate = (state: string): number => {
  const taxRates: Record<string, number> = {
    'CA': 0.0875,
    'NY': 0.08,
    'TX': 0.0625,
    'FL': 0.06,
    'WA': 0.065,
  };
  return taxRates[state] || 0.05;
};

const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getTimeAgo = (date: Date | string): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(past);
};

const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T;
  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  return obj;
};

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('should format USD currency correctly', () => {
      expect(formatCurrency(29.99)).toBe('$29.99');
      expect(formatCurrency(1000)).toBe('$1,000.00');
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should format other currencies correctly', () => {
      expect(formatCurrency(29.99, 'EUR')).toBe('€29.99');
      expect(formatCurrency(29.99, 'GBP')).toBe('£29.99');
    });

    it('should handle decimal places correctly', () => {
      expect(formatCurrency(29.999)).toBe('$30.00');
      expect(formatCurrency(29.1)).toBe('$29.10');
    });
  });

  describe('calculateDiscount', () => {
    it('should calculate discount correctly', () => {
      expect(calculateDiscount(100, 10)).toBe(10);
      expect(calculateDiscount(99.99, 15)).toBe(15);
      expect(calculateDiscount(50, 0)).toBe(0);
    });

    it('should handle edge cases', () => {
      expect(calculateDiscount(100, 100)).toBe(100);
      expect(calculateDiscount(0, 50)).toBe(0);
    });

    it('should throw error for invalid discount percent', () => {
      expect(() => calculateDiscount(100, -1)).toThrow();
      expect(() => calculateDiscount(100, 101)).toThrow();
    });
  });

  describe('generateSlug', () => {
    it('should generate slugs correctly', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
      expect(generateSlug('MacBook Pro 14-inch')).toBe('macbook-pro-14-inch');
      expect(generateSlug('Test Product!!!')).toBe('test-product');
    });

    it('should handle special characters', () => {
      expect(generateSlug('Product @#$% Name')).toBe('product-name');
      expect(generateSlug('  Spaced  Out  ')).toBe('spaced-out');
    });

    it('should handle edge cases', () => {
      expect(generateSlug('')).toBe('');
      expect(generateSlug('---')).toBe('');
      expect(generateSlug('123')).toBe('123');
    });
  });

  describe('truncateText', () => {
    it('should truncate text correctly', () => {
      expect(truncateText('Hello World', 5)).toBe('Hello...');
      expect(truncateText('Short', 10)).toBe('Short');
      expect(truncateText('This is a long text', 10)).toBe('This is a...');
    });

    it('should handle edge cases', () => {
      expect(truncateText('', 10)).toBe('');
      expect(truncateText('Hello', 5)).toBe('Hello');
      expect(truncateText('Hello', 0)).toBe('...');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.email@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('user@domain')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate correct phone numbers', () => {
      expect(isValidPhone('+1234567890')).toBe(true);
      expect(isValidPhone('1234567890')).toBe(true);
      expect(isValidPhone('+1-555-123-4567')).toBe(true);
      expect(isValidPhone('+44 20 7946 0958')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abc')).toBe(false);
      expect(isValidPhone('+0123456789')).toBe(false);
      expect(isValidPhone('')).toBe(false);
    });
  });

  describe('calculateShipping', () => {
    it('should calculate shipping correctly', () => {
      expect(calculateShipping(50)).toBe(5.99);
      expect(calculateShipping(99.99)).toBe(5.99);
      expect(calculateShipping(100)).toBe(0);
      expect(calculateShipping(150)).toBe(0);
    });

    it('should handle weight-based shipping', () => {
      expect(calculateShipping(50, 3)).toBe(5.99);
      expect(calculateShipping(50, 7)).toBe(8.99);
      expect(calculateShipping(50, 10)).toBe(13.49);
    });
  });

  describe('calculateTaxRate', () => {
    it('should return correct tax rates for states', () => {
      expect(calculateTaxRate('CA')).toBe(0.0875);
      expect(calculateTaxRate('NY')).toBe(0.08);
      expect(calculateTaxRate('TX')).toBe(0.0625);
    });

    it('should return default rate for unknown states', () => {
      expect(calculateTaxRate('UNKNOWN')).toBe(0.05);
      expect(calculateTaxRate('')).toBe(0.05);
    });
  });

  describe('formatDate', () => {
    it('should format dates correctly', () => {
      const date = new Date('2024-03-15T10:30:00Z');
      expect(formatDate(date)).toBe('Mar 15, 2024');
    });

    it('should handle string dates', () => {
      expect(formatDate('2024-12-25')).toBe('Dec 25, 2024');
    });
  });

  describe('getTimeAgo', () => {
    const now = new Date('2024-03-15T10:30:00Z');
    
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(now);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return correct time ago strings', () => {
      expect(getTimeAgo(new Date('2024-03-15T10:29:30Z'))).toBe('just now');
      expect(getTimeAgo(new Date('2024-03-15T10:25:00Z'))).toBe('5m ago');
      expect(getTimeAgo(new Date('2024-03-15T08:30:00Z'))).toBe('2h ago');
      expect(getTimeAgo(new Date('2024-03-14T10:30:00Z'))).toBe('1d ago');
    });

    it('should return formatted date for old dates', () => {
      const oldDate = new Date('2024-01-15T10:30:00Z');
      expect(getTimeAgo(oldDate)).toBe('Jan 15, 2024');
    });
  });

  describe('debounce', () => {
    jest.useFakeTimers();

    it('should debounce function calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('test1');
      debouncedFn('test2');
      debouncedFn('test3');

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('test3');
    });
  });

  describe('capitalize', () => {
    it('should capitalize text correctly', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('WORLD')).toBe('World');
      expect(capitalize('tEsT')).toBe('Test');
    });

    it('should handle edge cases', () => {
      expect(capitalize('')).toBe('');
      expect(capitalize('a')).toBe('A');
    });
  });

  describe('deepClone', () => {
    it('should clone primitive values', () => {
      expect(deepClone(42)).toBe(42);
      expect(deepClone('hello')).toBe('hello');
      expect(deepClone(true)).toBe(true);
      expect(deepClone(null)).toBe(null);
    });

    it('should clone arrays', () => {
      const original = [1, 2, [3, 4]];
      const cloned = deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned[2]).not.toBe(original[2]);
    });

    it('should clone objects', () => {
      const original = {
        name: 'Test',
        nested: { value: 42 },
        array: [1, 2, 3]
      };
      const cloned = deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.nested).not.toBe(original.nested);
      expect(cloned.array).not.toBe(original.array);
    });

    it('should clone dates', () => {
      const original = new Date('2024-03-15');
      const cloned = deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });
  });
});