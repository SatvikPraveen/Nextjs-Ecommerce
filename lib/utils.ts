// Location: lib/utils.ts

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number | string | { toString(): string },
  currency: string = 'USD'
): string {
  let numericAmount: number;

  if (typeof amount === 'string') {
    numericAmount = parseFloat(amount);
  } else if (typeof amount === 'number') {
    numericAmount = amount;
  } else {
    numericAmount = parseFloat(amount.toString());
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(numericAmount);
}

// Alias for formatCurrency
export const formatPrice = formatCurrency;

export function formatNumber(amount: number | string): string {
  const numericAmount =
    typeof amount === 'string' ? parseFloat(amount) : amount;

  return new Intl.NumberFormat('en-US').format(numericAmount);
}

export function formatDate(date: Date | string): string {
  let dateObj: Date;
  if (typeof date === 'string') {
    // Parse date string and adjust for timezone
    dateObj = new Date(date + 'T00:00:00Z');
  } else {
    dateObj = date;
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(dateObj);
}

export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(dateObj);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Alias for slugify to match test expectations
export const generateSlug = slugify;

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + '...';
}

// Alias for truncate to match test expectations
export const truncateText = truncate;

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export function calculateDiscount(
  price: number,
  discountPercent: number
): number {
  if (discountPercent < 0 || discountPercent > 100) {
    throw new Error('Discount percent must be between 0 and 100');
  }
  return Math.round(price * (discountPercent / 100));
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  // Allow various phone formats: +1234567890, 1234567890, +1-555-123-4567, +44 20 7946 0958
  if (!phone || phone.trim().length === 0) return false;
  // Remove all non-digit and non-plus characters for validation
  const cleaned = phone.replace(/[\s\-()]/g, '');
  // Check if it has at least 10 digits, starts with +, and doesn't start with +0
  if (/^[+]?[0-9]{10,}$/.test(cleaned)) {
    // Reject if starts with +0
    if (cleaned.startsWith('+0')) return false;
    return true;
  }
  return false;
}

export function calculateShipping(
  orderTotal: number,
  weight: number = 1
): number {
  // Free shipping for orders over $100
  if (orderTotal >= 100) {
    return 0;
  }
  // Tiered shipping: $5.99 base (up to 3 lbs), $0.75/lb for 4-7 lbs, $1.50/lb for 8+
  let shipping = 5.99;

  if (weight > 3 && weight <= 7) {
    shipping += (weight - 3) * 0.75;
  } else if (weight > 7) {
    shipping += (7 - 3) * 0.75 + (weight - 7) * 1.5;
  }

  return Number(shipping.toFixed(2));
}

export function calculateTaxRate(state: string): number {
  const stateTaxRates: Record<string, number> = {
    CA: 0.0875,
    NY: 0.08,
    TX: 0.0625,
    FL: 0.06,
    WA: 0.065,
    CO: 0.029,
    IL: 0.0625,
    PA: 0.06,
  };
  return stateTaxRates[state.toUpperCase()] || 0.05; // Default 5% tax
}

export function generateSKU(productName: string, variant?: string): string {
  const cleanName = productName
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(' ')
    .map(word => word.substring(0, 3).toUpperCase())
    .join('');

  const timestamp = Date.now().toString().slice(-4);
  const variantCode = variant
    ? '-' + variant.substring(0, 3).toUpperCase()
    : '';

  return `${cleanName}${variantCode}-${timestamp}`;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (obj instanceof Object) {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        (cloned as any)[key] = deepClone((obj as any)[key]);
      }
    }
    return cloned;
  }
  return obj;
}

export function getTimeAgo(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const secondsAgo = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (secondsAgo < 60) return 'just now';
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
  if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
  if (secondsAgo < 2592000) return `${Math.floor(secondsAgo / 86400)}d ago`;

  return formatDate(dateObj);
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function parseSearchParams(searchParams: URLSearchParams) {
  const params: Record<string, string | string[]> = {};

  searchParams.forEach((value, key) => {
    if (params[key]) {
      if (Array.isArray(params[key])) {
        (params[key] as string[]).push(value);
      } else {
        params[key] = [params[key] as string, value];
      }
    } else {
      params[key] = value;
    }
  });

  return params;
}

export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  if (bytes === 0) return '0 Bytes';

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
}

export function generateRandomId(length: number = 8): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}
