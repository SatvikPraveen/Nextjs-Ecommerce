// server/queries/products.ts
import prisma from '@/lib/prisma'
import { createCachedFunction, CACHE_TAGS } from '@/lib/cache'
import { ProductFilterInput } from '@/lib/validators'

export const getProducts = createCachedFunction(
  async (filters: ProductFilterInput = {}) => {
    const {
      category,
      minPrice,
      maxPrice,
      tags,
      featured,
      active = true,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = filters

    const skip = (page - 1) * limit
    
    const where: any = {
      isActive: active,
    }

    if (category) {
      where.category = {
        slug: category,
      }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {}
      if (minPrice !== undefined) where.price.gte = minPrice
      if (maxPrice !== undefined) where.price.lte = maxPrice
    }

    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags,
      }
    }

    if (featured !== undefined) {
      where.isFeatured = featured
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } },
      ]
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  },
  [CACHE_TAGS.products],
  300 // 5 minutes
)

export const getProduct = createCachedFunction(
  async (slug: string) => {
    return await prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })
  },
  [CACHE_TAGS.product],
  300
)

export const getProductById = createCachedFunction(
  async (id: string) => {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })
  },
  [CACHE_TAGS.product],
  300
)

export const getFeaturedProducts = createCachedFunction(
  async (limit = 8) => {
    return await prisma.product.findMany({
      where: {
        isFeatured: true,
        isActive: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })
  },
  [CACHE_TAGS.products],
  600 // 10 minutes
)

export const getRelatedProducts = createCachedFunction(
  async (productId: string, categoryId: string, limit = 4) => {
    return await prisma.product.findMany({
      where: {
        categoryId,
        isActive: true,
        NOT: {
          id: productId,
        },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })
  },
  [CACHE_TAGS.products],
  300
)

export const searchProducts = createCachedFunction(
  async (query: string, filters: any = {}) => {
    const {
      category,
      minPrice,
      maxPrice,
      sortBy = 'relevance',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = filters

    const skip = (page - 1) * limit
    
    const where: any = {
      isActive: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tags: { hasSome: [query] } },
      ],
    }

    if (category) {
      where.category = { slug: category }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {}
      if (minPrice !== undefined) where.price.gte = minPrice
      if (maxPrice !== undefined) where.price.lte = maxPrice
    }

    let orderBy: any = { createdAt: 'desc' }
    
    if (sortBy === 'price') {
      orderBy = { price: sortOrder }
    } else if (sortBy === 'name') {
      orderBy = { name: sortOrder }
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  },
  [CACHE_TAGS.products],
  300
)

export const getProductsByCategory = createCachedFunction(
  async (categorySlug: string, page = 1, limit = 20) => {
    const skip = (page - 1) * limit

    const [products, total, category] = await Promise.all([
      prisma.product.findMany({
        where: {
          category: { slug: categorySlug },
          isActive: true,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.product.count({
        where: {
          category: { slug: categorySlug },
          isActive: true,
        },
      }),
      prisma.category.findUnique({
        where: { slug: categorySlug },
      }),
    ])

    return {
      products,
      category,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  },
  [CACHE_TAGS.products, CACHE_TAGS.categories],
  300
)

export const getNewArrivals = createCachedFunction(
  async (limit = 8) => {
    return await prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })
  },
  [CACHE_TAGS.products],
  300
)

export const getPopularProducts = createCachedFunction(
  async (limit = 8) => {
    // Get products ordered by sales (via order items)
    const popularProductIds = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: limit,
    })

    if (popularProductIds.length === 0) {
      return []
    }

    const productIds = popularProductIds.map(p => p.productId)
    
    return await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })
  },
  [CACHE_TAGS.products],
  600
)

export const getProductTags = createCachedFunction(
  async () => {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { tags: true },
    })

    const allTags = products.flatMap(p => p.tags)
    const uniqueTags = [...new Set(allTags)]
    
    return uniqueTags.sort()
  },
  [CACHE_TAGS.products],
  3600 // 1 hour
)

export const getProductPriceRange = createCachedFunction(
  async () => {
    const result = await prisma.product.aggregate({
      where: { isActive: true },
      _min: { price: true },
      _max: { price: true },
    })

    return {
      min: result._min.price || 0,
      max: result._max.price || 0,
    }
  },
  [CACHE_TAGS.products],
  3600
)