// server/actions/orders.ts

'use server';

import prisma from '@/lib/prisma';

export async function updateOrderStatus(
  orderId: string,
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
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
      data: { status: 'SHIPPED' },
    });
    return order;
  } catch (error) {
    console.error('Error fulfilling order:', error);
    throw error;
  }
}

export async function cancelOrder(orderId: string) {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
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
