// lib/cache.ts
import { revalidateTag, unstable_cache } from 'next/cache'
import { cache } from 'react'

// Cache tags for different data types
export const CACHE_TAGS = {
  products: 'products',
  product: 'product',
  categories: 'categories',
  category: 'category',
  orders: 'orders',
  order: 'order',
  inventory: 'inventory',
  user: 'user',
} as const

type CacheTag = typeof CACHE_TAGS[keyof typeof CACHE_TAGS]

// Create a cached function with tags
export const createCachedFunction = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  tags: CacheTag[],
  revalidate?: number
) => {
  return unstable_cache(fn, undefined, {
    tags,
    revalidate,
  })
}

// Revalidate specific cache tags
export const revalidateCache = (tags: CacheTag | CacheTag[]) => {
  const tagsArray = Array.isArray(tags) ? tags : [tags]
  tagsArray.forEach(tag => revalidateTag(tag))
}

// React cache for request-level memoization
export const memoize = cache

// Product cache helpers
export const revalidateProducts = () => {
  revalidateCache([CACHE_TAGS.products, CACHE_TAGS.product])
}

export const revalidateProduct = (productId: string) => {
  revalidateCache([CACHE_TAGS.product, CACHE_TAGS.products])
}

// Category cache helpers
export const revalidateCategories = () => {
  revalidateCache([CACHE_TAGS.categories, CACHE_TAGS.category])
}

export const revalidateCategory = (categoryId: string) => {
  revalidateCache([CACHE_TAGS.category, CACHE_TAGS.categories])
}

// Order cache helpers
export const revalidateOrders = () => {
  revalidateCache([CACHE_TAGS.orders, CACHE_TAGS.order])
}

export const revalidateOrder = (orderId: string) => {
  revalidateCache([CACHE_TAGS.order, CACHE_TAGS.orders])
}

// Inventory cache helpers
export const revalidateInventory = () => {
  revalidateCache(CACHE_TAGS.inventory)
}

// User cache helpers
export const revalidateUser = (userId: string) => {
  revalidateCache(CACHE_TAGS.user)
}

// Cache configuration presets
export const CACHE_CONFIGS = {
  products: {
    tags: [CACHE_TAGS.products],
    revalidate: 60 * 5, // 5 minutes
  },
  categories: {
    tags: [CACHE_TAGS.categories],
    revalidate: 60 * 10, // 10 minutes
  },
  inventory: {
    tags: [CACHE_TAGS.inventory],
    revalidate: 60 * 2, // 2 minutes
  },
  orders: {
    tags: [CACHE_TAGS.orders],
    revalidate: 60, // 1 minute
  },
} as const

// Utility to create product cache key
export const getProductCacheKey = (slug: string) => `product:${slug}`
export const getCategoryCacheKey = (slug: string) => `category:${slug}`
export const getOrderCacheKey = (orderId: string) => `order:${orderId}`
export const getUserCacheKey = (userId: string) => `user:${userId}`