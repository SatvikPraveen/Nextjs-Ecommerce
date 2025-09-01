// server/queries/orders.ts
import prisma from '@/lib/prisma'
import { createCachedFunction, CACHE_TAGS } from '@/lib/cache'
import { getCurrentUser, requireAuth } from '@/lib/auth'
import { hasPermission, PERMISSIONS } from '@/lib/roles'

export const getOrders = createCachedFunction(
  async (page = 1, limit = 20, status?: string) => {
    const skip = (page - 1) * limit
    const canViewAll = await hasPermission(PERMISSIONS.ORDER_READ_ALL)
    
    let where: any = {}
    
    if (!canViewAll) {
      const user = await getCurrentUser()
      if (!user) throw new Error('Authentication required')
      where.userId = user.id
    }
    
    if (status) {
      where.status = status
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  slug: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  },
  [CACHE_TAGS.orders],
  60 // 1 minute
)

export const getOrder = createCachedFunction(
  async (orderId: string) => {
    const canViewAll = await hasPermission(PERMISSIONS.ORDER_READ_ALL)
    const user = await getCurrentUser()
    
    let where: any = { id: orderId }
    
    if (!canViewAll && user) {
      where.userId = user.id
    }

    return await prisma.order.findUnique({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                slug: true,
                price: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  },
  [CACHE_TAGS.order],
  60
)

export const getUserOrders = createCachedFunction(
  async (userId: string, page = 1, limit = 10) => {
    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  slug: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: { userId } }),
    ])

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  },
  [CACHE_TAGS.orders],
  60
)

export const getRecentOrders = createCachedFunction(
  async (limit = 10) => {
    await requireAuth()
    const canViewAll = await hasPermission(PERMISSIONS.ORDER_READ_ALL)
    
    let where: any = {}
    
    if (!canViewAll) {
      const user = await getCurrentUser()
      if (!user) throw new Error('Authentication required')
      where.userId = user.id
    }

    return await prisma.order.findMany({
      where,
      include: {
        items: {
          select: {
            id: true,
            quantity: true,
            price: true,
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })
  },
  [CACHE_TAGS.orders],
  60
)

export const getOrdersByStatus = createCachedFunction(
  async (status: string) => {
    const canViewAll = await hasPermission(PERMISSIONS.ORDER_READ_ALL)
    
    let where: any = { status }
    
    if (!canViewAll) {
      const user = await getCurrentUser()
      if (!user) throw new Error('Authentication required')
      where.userId = user.id
    }

    return await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                slug: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  },
  [CACHE_TAGS.orders],
  60
)

export const getOrderStatistics = createCachedFunction(
  async () => {
    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'PROCESSING' } }),
      prisma.order.count({ where: { status: 'SHIPPED' } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.order.count({ where: { status: 'CANCELLED' } }),
      prisma.order.aggregate({
        where: {
          status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] },
        },
        _sum: { total: true },
      }),
    ])

    return {
      total: totalOrders,
      pending: pendingOrders,
      processing: processingOrders,
      shipped: shippedOrders,
      delivered: deliveredOrders,
      cancelled: cancelledOrders,
      revenue: totalRevenue._sum.total || 0,
    }
  },
  [CACHE_TAGS.orders],
  300 // 5 minutes
)

export const getOrdersByDateRange = createCachedFunction(
  async (startDate: Date, endDate: Date) => {
    await requireAuth()
    const canViewAll = await hasPermission(PERMISSIONS.ORDER_READ_ALL)
    
    let where: any = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    }
    
    if (!canViewAll) {
      const user = await getCurrentUser()
      if (!user) throw new Error('Authentication required')
      where.userId = user.id
    }

    return await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  },
  [CACHE_TAGS.orders],
  300
)

export const getOrderAnalytics = createCachedFunction(
  async (period: 'day' | 'week' | 'month' = 'month') => {
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
    }

    const [orders, revenue] = await Promise.all([
      prisma.order.findMany({
        where: {
          createdAt: { gte: startDate },
        },
        select: {
          createdAt: true,
          total: true,
          status: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startDate },
          status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] },
        },
        _sum: { total: true },
      }),
    ])

    // Group orders by date
    const ordersByDate = orders.reduce((acc, order) => {
      const date = order.createdAt.toDateString()
      if (!acc[date]) {
        acc[date] = { count: 0, revenue: 0 }
      }
      acc[date].count++
      if (['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)) {
        acc[date].revenue += order.total
      }
      return acc
    }, {} as Record<string, { count: number; revenue: number }>)

    return {
      totalRevenue: revenue._sum.total || 0,
      totalOrders: orders.length,
      ordersByDate,
    }
  },
  [CACHE_TAGS.orders],
  300
)