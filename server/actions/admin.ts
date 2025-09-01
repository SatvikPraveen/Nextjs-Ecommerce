// server/actions/admin.ts
'use server'

import prisma from '@/lib/prisma'
import { revalidateTag } from 'next/cache'
import { updateOrderStatusSchema, createCategorySchema, updateCategorySchema } from '@/lib/validators'
import { requirePermission, PERMISSIONS, requireAdmin } from '@/lib/roles'
import { sendOrderConfirmation } from '@/lib/emails'

// Order Management
export async function updateOrderStatus(orderId: string, formData: FormData) {
  try {
    await requirePermission(PERMISSIONS.ORDER_UPDATE)

    const statusData = {
      status: formData.get('status') as string,
      trackingNumber: formData.get('trackingNumber') as string || undefined,
      notes: formData.get('notes') as string || undefined,
    }

    const validatedData = updateOrderStatusSchema.parse(statusData)

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: validatedData.status as any,
        trackingNumber: validatedData.trackingNumber,
        notes: validatedData.notes,
        updatedAt: new Date(),
      },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, images: true },
            },
          },
        },
      },
    })

    // Send email notification for certain status changes
    if (['SHIPPED', 'DELIVERED'].includes(validatedData.status)) {
      await sendOrderConfirmation({
        orderId: order.id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        orderTotal: order.total,
        items: order.items.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
          image: item.product.images[0],
        })),
        shippingAddress: order.shippingAddress as any,
      })
    }

    revalidateTag('orders')
    
    return { success: true, order }
  } catch (error) {
    console.error('Update order status error:', error)
    return { success: false, error: 'Failed to update order status' }
  }
}

export async function deleteOrder(orderId: string) {
  try {
    await requireAdmin()

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    // Restore inventory if order was processed
    if (['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)) {
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            inventory: { increment: item.quantity },
          },
        })
      }
    }

    await prisma.order.delete({
      where: { id: orderId },
    })

    revalidateTag('orders')
    revalidateTag('products')
    
    return { success: true }
  } catch (error) {
    console.error('Delete order error:', error)
    return { success: false, error: 'Failed to delete order' }
  }
}

// Category Management
export async function createCategory(formData: FormData) {
  try {
    await requirePermission(PERMISSIONS.PRODUCT_CREATE)

    const categoryData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string || undefined,
      slug: formData.get('slug') as string,
      parentId: formData.get('parentId') as string || undefined,
      image: formData.get('image') as string || undefined,
      isActive: formData.get('isActive') === 'true',
      seoTitle: formData.get('seoTitle') as string || undefined,
      seoDescription: formData.get('seoDescription') as string || undefined,
    }

    const validatedData = createCategorySchema.parse(categoryData)

    // Check if slug already exists
    const existingSlug = await prisma.category.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existingSlug) {
      return { success: false, error: 'Slug already exists' }
    }

    const category = await prisma.category.create({
      data: validatedData,
    })

    revalidateTag('categories')
    
    return { success: true, category }
  } catch (error) {
    console.error('Create category error:', error)
    return { success: false, error: 'Failed to create category' }
  }
}

export async function updateCategory(categoryId: string, formData: FormData) {
  try {
    await requirePermission(PERMISSIONS.PRODUCT_UPDATE)

    const categoryData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string || undefined,
      slug: formData.get('slug') as string,
      parentId: formData.get('parentId') as string || undefined,
      image: formData.get('image') as string || undefined,
      isActive: formData.get('isActive') === 'true',
      seoTitle: formData.get('seoTitle') as string || undefined,
      seoDescription: formData.get('seoDescription') as string || undefined,
    }

    const validatedData = updateCategorySchema.parse(categoryData)

    // Check if slug already exists for other categories
    if (validatedData.slug) {
      const existingSlug = await prisma.category.findFirst({
        where: { 
          slug: validatedData.slug,
          NOT: { id: categoryId }
        },
      })

      if (existingSlug) {
        return { success: false, error: 'Slug already exists' }
      }
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: validatedData,
    })

    revalidateTag('categories')
    
    return { success: true, category }
  } catch (error) {
    console.error('Update category error:', error)
    return { success: false, error: 'Failed to update category' }
  }
}

export async function deleteCategory(categoryId: string) {
  try {
    await requirePermission(PERMISSIONS.PRODUCT_DELETE)

    // Check if category has products
    const productsCount = await prisma.product.count({
      where: { categoryId },
    })

    if (productsCount > 0) {
      return { success: false, error: 'Cannot delete category with existing products' }
    }

    // Check if category has subcategories
    const subcategoriesCount = await prisma.category.count({
      where: { parentId: categoryId },
    })

    if (subcategoriesCount > 0) {
      return { success: false, error: 'Cannot delete category with subcategories' }
    }

    await prisma.category.delete({
      where: { id: categoryId },
    })

    revalidateTag('categories')
    
    return { success: true }
  } catch (error) {
    console.error('Delete category error:', error)
    return { success: false, error: 'Failed to delete category' }
  }
}

// Analytics
export async function getAnalytics(period: 'today' | 'week' | 'month' | 'year' = 'month') {
  try {
    await requirePermission(PERMISSIONS.ANALYTICS_READ)

    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    const [
      totalRevenue,
      totalOrders,
      totalCustomers,
      lowStockProducts,
      topProducts,
      recentOrders
    ] = await Promise.all([
      // Total revenue
      prisma.order.aggregate({
        where: {
          status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] },
          createdAt: { gte: startDate },
        },
        _sum: { total: true },
      }),
      
      // Total orders
      prisma.order.count({
        where: {
          createdAt: { gte: startDate },
        },
      }),
      
      // Total customers
      prisma.user.count({
        where: {
          createdAt: { gte: startDate },
        },
      }),
      
      // Low stock products
      prisma.product.findMany({
        where: {
          inventory: { lte: 10 },
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          inventory: true,
          sku: true,
        },
        take: 10,
      }),
      
      // Top selling products
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        _count: { productId: true },
        orderBy: {
          _sum: { quantity: 'desc' },
        },
        take: 5,
      }),
      
      // Recent orders
      prisma.order.findMany({
        where: {
          createdAt: { gte: startDate },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          status: true,
          total: true,
          customerName: true,
          createdAt: true,
        },
      }),
    ])

    // Get product details for top products
    const productIds = topProducts.map(p => p.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, images: true },
    })

    const topProductsWithDetails = topProducts.map(tp => {
      const product = products.find(p => p.id === tp.productId)
      return {
        ...tp,
        product,
      }
    })

    return {
      revenue: totalRevenue._sum.total || 0,
      orders: totalOrders,
      customers: totalCustomers,
      lowStockProducts,
      topProducts: topProductsWithDetails,
      recentOrders,
    }
  } catch (error) {
    console.error('Get analytics error:', error)
    return {
      revenue: 0,
      orders: 0,
      customers: 0,
      lowStockProducts: [],
      topProducts: [],
      recentOrders: [],
    }
  }
}

export async function exportOrders(startDate: string, endDate: string) {
  try {
    await requirePermission(PERMISSIONS.ORDER_READ_ALL)

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, sku: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Convert to CSV format
    const csvHeaders = [
      'Order ID',
      'Customer Name',
      'Customer Email',
      'Status',
      'Total',
      'Created At',
      'Items',
    ]

    const csvRows = orders.map(order => [
      order.id,
      order.customerName,
      order.customerEmail,
      order.status,
      order.total,
      order.createdAt.toISOString(),
      order.items.map(item => `${item.product.name} (${item.quantity})`).join('; '),
    ])

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    return { success: true, csvContent }
  } catch (error) {
    console.error('Export orders error:', error)
    return { success: false, error: 'Failed to export orders' }
  }
}