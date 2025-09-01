// lib/validators.ts
import { z } from 'zod'

// User schemas
export const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
})

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
})

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const newPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// Product schemas
export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  compareAtPrice: z.number().min(0).optional(),
  sku: z.string().min(1, 'SKU is required').max(100),
  inventory: z.number().int().min(0, 'Inventory cannot be negative'),
  categoryId: z.string().min(1, 'Category is required'),
  images: z.array(z.string().url()).min(1, 'At least one image is required'),
  tags: z.array(z.string()).optional().default([]),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  weight: z.number().min(0).optional(),
  dimensions: z.object({
    length: z.number().min(0),
    width: z.number().min(0),
    height: z.number().min(0),
  }).optional(),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
})

export const updateProductSchema = createProductSchema.partial()

export const productFilterSchema = z.object({
  category: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'price', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

// Category schemas
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  description: z.string().optional(),
  slug: z.string().min(1, 'Slug is required').max(100),
  parentId: z.string().optional(),
  image: z.string().url().optional(),
  isActive: z.boolean().default(true),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
})

export const updateCategorySchema = createCategorySchema.partial()

// Order schemas
export const shippingAddressSchema = z.object({
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
})

export const checkoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().min(1),
    price: z.number().min(0),
  })).min(1, 'Cart cannot be empty'),
  shippingAddress: shippingAddressSchema,
  billingAddress: shippingAddressSchema.optional(),
  customerInfo: z.object({
    email: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().optional(),
  }),
  shippingMethod: z.string().min(1, 'Shipping method is required'),
  notes: z.string().optional(),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
})

// Cart schemas
export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100, 'Quantity cannot exceed 100'),
  variantId: z.string().optional(),
})

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, 'Quantity cannot be negative').max(100, 'Quantity cannot exceed 100'),
})

export const removeFromCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantId: z.string().optional(),
})

// Search schemas
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  category: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  sortBy: z.enum(['relevance', 'price', 'name', 'createdAt']).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
})

// Review schemas
export const createReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  title: z.string().min(1, 'Review title is required').max(100),
  content: z.string().min(10, 'Review must be at least 10 characters').max(1000),
  verified: z.boolean().default(false),
})

export const updateReviewSchema = createReviewSchema.partial().omit({ productId: true })

// Inventory schemas
export const updateInventorySchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(0, 'Quantity cannot be negative'),
  operation: z.enum(['SET', 'ADD', 'SUBTRACT']).default('SET'),
  reason: z.string().optional(),
})

export const lowStockThresholdSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  threshold: z.number().int().min(0, 'Threshold cannot be negative'),
})

// File upload schemas
export const fileUploadSchema = z.object({
  file: z.instanceof(File),
  folder: z.string().optional().default('uploads'),
  generateVariants: z.boolean().optional().default(true),
})

// Webhook schemas
export const stripeWebhookSchema = z.object({
  id: z.string(),
  object: z.literal('event'),
  type: z.string(),
  data: z.object({
    object: z.any(),
  }),
})

// Common validation helpers
export const validateId = (id: string) => {
  return z.string().min(1, 'ID is required').parse(id)
}

export const validateSlug = (slug: string) => {
  return z.string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .parse(slug)
}

export const validateEmail = (email: string) => {
  return z.string().email('Invalid email address').parse(email)
}

export const validatePhone = (phone: string) => {
  return z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format')
    .parse(phone)
}

// Type inference helpers
export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type ProductFilterInput = z.infer<typeof productFilterSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
export type AddToCartInput = z.infer<typeof addToCartSchema>
export type SearchInput = z.infer<typeof searchSchema>
export type CreateReviewInput = z.infer<typeof createReviewSchema>