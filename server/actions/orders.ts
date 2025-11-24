// server/actions/orders.ts

'use server';

import prisma from '@/lib/prisma';

export async function updateOrderStatus(
  orderId: string,
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
) {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
    return order;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

export async function fulfillOrder(orderId: string) {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'shipped' },
    });
    return order;
  } catch (error) {
    console.error('Error fulfilling order:', error);
    throw error;
  }
}

export async function createOrder(
  userId: string,
  data: {
    total: number;
    stripePaymentIntentId: string;
    shippingAddress: string;
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
  }
) {
  try {
    const order = await prisma.order.create({
      data: {
        userId,
        total: data.total,
        stripePaymentIntentId: data.stripePaymentIntentId,
        shippingAddress: data.shippingAddress,
        status: 'pending',
        orderItems: {
          create: data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        orderItems: {
          include: { product: true },
        },
      },
    });

    return order;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

export async function cancelOrder(orderId: string) {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'cancelled' },
    });
    return order;
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
}

export async function getOrderById(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: { product: true },
        },
        user: true,
      },
    });
    return order;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
}
