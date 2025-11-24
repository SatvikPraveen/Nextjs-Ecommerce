// server/queries/products.ts
import prisma from '@/lib/prisma';
import { createCachedFunction, CACHE_TAGS } from '@/lib/cache';
import { ProductFilterInput } from '@/lib/validators';

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
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {
      status: active ? 'PUBLISHED' : { not: 'PUBLISHED' },
    };

    if (category) {
      where.category = {
        slug: category,
      };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags,
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } },
      ];
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
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },
  [CACHE_TAGS.products],
  300 // 5 minutes
);

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
    });
  },
  [CACHE_TAGS.product],
  300
);

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
    });
  },
  [CACHE_TAGS.product],
  300
);

export const getFeaturedProducts = createCachedFunction(
  async (limit = 8) => {
    const products = await prisma.product.findMany({
      where: {
        status: 'PUBLISHED',
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          select: {
            url: true,
            altText: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Convert Decimal prices to numbers
    return products.map(p => ({
      ...p,
      price: Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
    }));
  },
  [CACHE_TAGS.products],
  600 // 10 minutes
);

export const getRelatedProducts = createCachedFunction(
  async (productId: string, categoryId: string, limit = 4) => {
    return await prisma.product.findMany({
      where: {
        categoryId,
        status: 'PUBLISHED',
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
        images: {
          select: {
            url: true,
            altText: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  },
  [CACHE_TAGS.products],
  300
);

export const searchProducts = createCachedFunction(
  async (
    queryOrOptions:
      | string
      | {
          query: string;
          page?: number;
          limit?: number;
          sort?: string;
          categoryFilter?: string;
          minPrice?: number;
          maxPrice?: number;
        },
    filters: any = {}
  ) => {
    let query: string;
    let options: any = filters;

    if (typeof queryOrOptions === 'string') {
      query = queryOrOptions;
    } else {
      query = queryOrOptions.query;
      options = {
        page: queryOrOptions.page || 1,
        limit: queryOrOptions.limit || 20,
        category: queryOrOptions.categoryFilter,
        minPrice: queryOrOptions.minPrice,
        maxPrice: queryOrOptions.maxPrice,
        sortBy: queryOrOptions.sort || 'relevance',
      };
    }

    const {
      category,
      minPrice,
      maxPrice,
      sortBy = 'relevance',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = options;

    const skip = (page - 1) * limit;

    const where: any = {
      status: 'PUBLISHED',
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tags: { hasSome: [query] } },
      ],
    };

    if (category) {
      where.category = { slug: category };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    let orderBy: any = { createdAt: 'desc' };

    if (sortBy === 'price') {
      orderBy = { price: sortOrder };
    } else if (sortBy === 'name') {
      orderBy = { name: sortOrder };
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
          images: {
            select: {
              url: true,
              altText: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Convert Decimal prices to numbers
    const convertedProducts = products.map(p => ({
      ...p,
      price: Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
    }));

    return {
      products: convertedProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },
  [CACHE_TAGS.products],
  300
);

export const getProductsByCategory = createCachedFunction(
  async (
    options:
      | {
          categoryId: string;
          page?: number;
          limit?: number;
          sort?: string;
          minPrice?: number;
          maxPrice?: number;
        }
      | string,
    page = 1,
    limit = 20
  ) => {
    // Handle both old string format and new object format
    let categoryId: string;
    let pageNum: number;
    let limitNum: number;
    let sortBy = 'newest';
    let minPrice: number | undefined;
    let maxPrice: number | undefined;

    if (typeof options === 'string') {
      categoryId = options;
      pageNum = page;
      limitNum = limit;
    } else {
      categoryId = options.categoryId;
      pageNum = options.page || 1;
      limitNum = options.limit || 20;
      sortBy = options.sort || 'newest';
      minPrice = options.minPrice;
      maxPrice = options.maxPrice;
    }

    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const whereClause: any = {
      categoryId,
      status: 'PUBLISHED',
    };

    if (minPrice !== undefined || maxPrice !== undefined) {
      whereClause.price = {};
      if (minPrice !== undefined) whereClause.price.gte = minPrice;
      if (maxPrice !== undefined) whereClause.price.lte = maxPrice;
    }

    // Determine sort order
    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'price-low') orderBy = { price: 'asc' };
    else if (sortBy === 'price-high') orderBy = { price: 'desc' };
    else if (sortBy === 'popular') orderBy = { _count: { reviews: 'desc' } };
    else if (sortBy === 'rating') orderBy = { avgRating: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          images: {
            select: {
              url: true,
              altText: true,
            },
          },
          inventory: {
            select: {
              available: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.product.count({
        where: whereClause,
      }),
    ]);

    // Convert Decimal prices to numbers
    const convertedProducts = products.map(p => ({
      ...p,
      price: Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
    }));

    return {
      products: convertedProducts,
      total,
      totalPages: Math.ceil(total / limitNum),
      page: pageNum,
      limit: limitNum,
    };
  },
  [CACHE_TAGS.products, CACHE_TAGS.categories],
  300
);

export const getNewArrivals = createCachedFunction(
  async (limit = 8) => {
    return await prisma.product.findMany({
      where: {
        status: 'PUBLISHED',
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
    });
  },
  [CACHE_TAGS.products],
  300
);

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
    });

    if (popularProductIds.length === 0) {
      return [];
    }

    const productIds = popularProductIds.map(p => p.productId);

    return await prisma.product.findMany({
      where: {
        id: { in: productIds },
        status: 'PUBLISHED',
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
    });
  },
  [CACHE_TAGS.products],
  600
);

export const getProductTags = createCachedFunction(
  async () => {
    const products = await prisma.product.findMany({
      where: { status: 'PUBLISHED' },
      select: { tags: true },
    });

    const allTags = products.flatMap(p => p.tags);
    const uniqueTags = [...new Set(allTags)];

    return uniqueTags.sort();
  },
  [CACHE_TAGS.products],
  3600 // 1 hour
);

export const getProductPriceRange = createCachedFunction(
  async () => {
    const result = await prisma.product.aggregate({
      where: { status: 'PUBLISHED' },
      _min: { price: true },
      _max: { price: true },
    });

    return {
      min: result._min.price || 0,
      max: result._max.price || 0,
    };
  },
  [CACHE_TAGS.products],
  3600
);

export const getNewProducts = createCachedFunction(
  async (limit: number = 8) => {
    const products = await prisma.product.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        images: {
          select: {
            url: true,
            altText: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Convert Decimal prices to numbers
    return products.map(p => ({
      ...p,
      price: Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
    }));
  },
  [CACHE_TAGS.products],
  3600
);

export const getAllProducts = createCachedFunction(
  async () => {
    return await prisma.product.findMany({
      where: { status: 'PUBLISHED' },
    });
  },
  [CACHE_TAGS.products],
  3600
);

export const getProductBySlug = createCachedFunction(
  async (slug: string) => {
    return await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: {
          select: {
            url: true,
            altText: true,
          },
        },
      },
    });
  },
  [CACHE_TAGS.product],
  3600
);

export const getCategoryBySlug = createCachedFunction(
  async (slug: string) => {
    return await prisma.category.findUnique({
      where: { slug },
      include: { products: true },
    });
  },
  [CACHE_TAGS.products],
  3600
);
