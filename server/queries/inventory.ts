// server/queries/inventory.ts
import prisma from '@/lib/prisma';
import { createCachedFunction, CACHE_TAGS } from '@/lib/cache';
import { hasPermission, PERMISSIONS } from '@/lib/roles';

export async function getInventoryData(options?: {
  page?: number;
  limit?: number;
  search?: string;
  stockLevel?: string;
}) {
  try {
    const canRead = await hasPermission(PERMISSIONS.PRODUCT_READ);
    if (!canRead) {
      throw new Error('Unauthorized');
    }

    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const search = options?.search || '';
    const stockLevel = options?.stockLevel || '';
    const skip = (page - 1) * limit;

    const where: any = { status: 'PUBLISHED' };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (stockLevel) {
      if (stockLevel === 'low') {
        where.inventory = { lte: 10 };
      } else if (stockLevel === 'out') {
        where.inventory = 0;
      } else if (stockLevel === 'in') {
        where.inventory = { gt: 10 };
      }
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          sku: true,
          price: true,
          status: true,
          inventory: {
            select: {
              available: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const items = products.map(product => {
      const available = product.inventory?.[0]?.available ?? 0;
      let status: 'in-stock' | 'low-stock' | 'out-of-stock' = 'in-stock';
      if (available === 0) status = 'out-of-stock';
      else if (available < 10) status = 'low-stock';

      return {
        id: product.id,
        name: product.name,
        sku: product.sku || 'N/A',
        quantity: available,
        reorderLevel: 10,
        status,
      };
    });

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error fetching inventory data:', error);
    throw error;
  }
}

export const getInventory = createCachedFunction(
  async (page = 1, limit = 20, lowStock = false) => {
    const canRead = await hasPermission(PERMISSIONS.PRODUCT_READ);
    if (!canRead) throw new Error('Unauthorized');

    const skip = (page - 1) * limit;

    let where: any = {};

    if (lowStock) {
      where.inventory = { lte: 10 };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          sku: true,
          price: true,
          images: true,
          status: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          inventory: {
            select: {
              available: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
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
  [CACHE_TAGS.inventory],
  120 // 2 minutes
);

export const getLowStockProducts = createCachedFunction(
  async (threshold = 10) => {
    const canRead = await hasPermission(PERMISSIONS.PRODUCT_READ);
    if (!canRead) throw new Error('Unauthorized');

    return await prisma.product.findMany({
      where: {
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        name: true,
        sku: true,
        inventory: true,
        price: true,
        images: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },
  [CACHE_TAGS.inventory],
  300
);

export const getOutOfStockProducts = createCachedFunction(
  async () => {
    const canRead = await hasPermission(PERMISSIONS.PRODUCT_READ);
    if (!canRead) throw new Error('Unauthorized');

    return await prisma.product.findMany({
      where: {
        status: 'PUBLISHED',
        inventory: {
          some: {
            available: 0,
          },
        },
      },
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        images: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  },
  [CACHE_TAGS.inventory],
  300
);

export const getInventoryStatistics = createCachedFunction(
  async () => {
    const canRead = await hasPermission(PERMISSIONS.PRODUCT_READ);
    if (!canRead) throw new Error('Unauthorized');

    const [
      totalProducts,
      activeProducts,
      inactiveProducts,
      lowStockCount,
      outOfStockCount,
      totalInventoryValue,
      averageInventory,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { status: 'PUBLISHED' } }),
      prisma.product.count({ where: { status: { not: 'PUBLISHED' } } }),
      prisma.product.count({
        where: {
          status: 'PUBLISHED',
          inventory: {
            some: {
              available: { lte: 10, gt: 0 },
            },
          },
        },
      }),
      prisma.product.count({
        where: {
          status: 'PUBLISHED',
          inventory: {
            some: {
              available: 0,
            },
          },
        },
      }),
      prisma.inventory.aggregate({
        _sum: {
          quantity: true,
        },
      }),
      prisma.inventory.aggregate({
        _avg: {
          quantity: true,
        },
        where: {
          product: {
            status: 'PUBLISHED',
          },
        },
      }),
    ]);

    // Calculate total inventory value (quantity * price)
    const productsWithValue = await prisma.product.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        price: true,
        inventory: {
          select: {
            quantity: true,
          },
        },
      },
    });

    const inventoryValue = productsWithValue.reduce((total, product) => {
      const quantity = product.inventory[0]?.quantity || 0;
      return total + quantity * Number(product.price);
    }, 0);

    return {
      totalProducts,
      activeProducts,
      inactiveProducts,
      lowStockCount,
      outOfStockCount,
      totalInventoryQuantity: totalInventoryValue._sum.quantity || 0,
      averageInventory: Math.round(averageInventory._avg.quantity || 0),
      totalInventoryValue: inventoryValue,
    };
  },
  [CACHE_TAGS.inventory],
  300
);

export const getInventoryMovements = createCachedFunction(
  async (productId?: string, page = 1, limit = 20) => {
    const canRead = await hasPermission(PERMISSIONS.PRODUCT_READ);
    if (!canRead) throw new Error('Unauthorized');

    const skip = (page - 1) * limit;

    let where: any = {};

    if (productId) {
      where.productId = productId;
    }

    // This would require a separate inventory movement table
    // For now, we'll simulate with order items as movements
    const [movements, total] = await Promise.all([
      prisma.orderItem.findMany({
        where: productId ? { productId } : {},
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
          order: {
            select: {
              id: true,
              status: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          order: {
            createdAt: 'desc',
          },
        },
        skip,
        take: limit,
      }),
      prisma.orderItem.count({ where: productId ? { productId } : {} }),
    ]);

    // Transform to movement format
    const inventoryMovements = movements.map(movement => ({
      id: movement.id,
      productId: movement.productId,
      product: movement.product,
      type: 'SALE' as const,
      quantity: -movement.quantity, // Negative for sale
      reason: `Order ${movement.order.id}`,
      createdAt: movement.order.createdAt,
      orderId: movement.order.id,
    }));

    return {
      movements: inventoryMovements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },
  [CACHE_TAGS.inventory],
  60
);

export const getProductInventoryHistory = createCachedFunction(
  async (productId: string) => {
    const canRead = await hasPermission(PERMISSIONS.PRODUCT_READ);
    if (!canRead) throw new Error('Unauthorized');

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        sku: true,
        inventory: true,
        price: true,
      },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Get sales from orders
    const sales = await prisma.orderItem.findMany({
      where: {
        productId,
        order: {
          status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] },
        },
      },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        order: {
          createdAt: 'desc',
        },
      },
    });

    const movements = sales.map(sale => ({
      id: sale.id,
      type: 'SALE' as const,
      quantity: -sale.quantity,
      reason: `Order ${sale.order.id}`,
      createdAt: sale.order.createdAt,
      reference: sale.order.id,
    }));

    return {
      product,
      currentStock: product.inventory,
      movements,
    };
  },
  [CACHE_TAGS.inventory],
  300
);

export const getInventoryAlerts = createCachedFunction(
  async () => {
    const canRead = await hasPermission(PERMISSIONS.PRODUCT_READ);
    if (!canRead) throw new Error('Unauthorized');

    const [lowStock, outOfStock, overstock] = await Promise.all([
      // Low stock products (1-10 items)
      prisma.product.findMany({
        where: {
          status: 'PUBLISHED',
          inventory: {
            some: {
              available: { lte: 10, gt: 0 },
            },
          },
        },
        select: {
          id: true,
          name: true,
          sku: true,
          inventory: {
            select: { available: true },
          },
          category: {
            select: { name: true },
          },
        },
        take: 20,
      }),

      // Out of stock products
      prisma.product.findMany({
        where: {
          status: 'PUBLISHED',
          inventory: {
            some: {
              available: 0,
            },
          },
        },
        select: {
          id: true,
          name: true,
          sku: true,
          category: {
            select: { name: true },
          },
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: 20,
      }),

      // Overstock products (>100 items)
      prisma.product.findMany({
        where: {
          status: 'PUBLISHED',
          inventory: {
            some: {
              available: { gte: 100 },
            },
          },
        },
        select: {
          id: true,
          name: true,
          sku: true,
          inventory: {
            select: { available: true },
          },
          price: true,
          category: {
            select: { name: true },
          },
        },
        take: 20,
      }),
    ]);

    return {
      lowStock,
      outOfStock,
      overstock,
      summary: {
        lowStockCount: lowStock.length,
        outOfStockCount: outOfStock.length,
        overstockCount: overstock.length,
      },
    };
  },
  [CACHE_TAGS.inventory],
  300
);

export const getCategoryInventoryStats = createCachedFunction(
  async () => {
    const canRead = await hasPermission(PERMISSIONS.PRODUCT_READ);
    if (!canRead) throw new Error('Unauthorized');

    const categories = await prisma.category.findMany({
      include: {
        products: {
          where: { status: 'PUBLISHED' },
          select: {
            inventory: {
              select: {
                quantity: true,
              },
            },
            price: true,
          },
        },
      },
    });

    return categories.map(category => {
      const totalProducts = category.products.length;
      const totalInventory = category.products.reduce(
        (sum, product) => sum + (product.inventory[0]?.quantity || 0),
        0
      );
      const totalValue = category.products.reduce(
        (sum, product) =>
          sum + (product.inventory[0]?.quantity || 0) * Number(product.price),
        0
      );
      const lowStockProducts = category.products.filter(product => {
        const qty = product.inventory[0]?.quantity || 0;
        return qty <= 10 && qty > 0;
      }).length;
      const outOfStockProducts = category.products.filter(
        product => (product.inventory[0]?.quantity || 0) === 0
      ).length;

      return {
        categoryId: category.id,
        categoryName: category.name,
        totalProducts,
        totalInventory,
        totalValue,
        lowStockProducts,
        outOfStockProducts,
        averageInventory:
          totalProducts > 0 ? Math.round(totalInventory / totalProducts) : 0,
      };
    });
  },
  [CACHE_TAGS.inventory, CACHE_TAGS.categories],
  600
);
