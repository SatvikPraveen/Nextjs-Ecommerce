// server/actions/orders.ts

'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/roles';

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

// Returns the signed-in user's most recent shipping address, to prefill
// checkout for returning customers. Returns null for guests or first-time
// customers with no prior order.
export async function getSavedAddressForCurrentUser() {
  const user = await getCurrentUser();
  if (!user) return null;

  const lastOrder = await prisma.order.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      shippingName: true,
      shippingAddress: true,
      shippingCity: true,
      shippingState: true,
      shippingZip: true,
      shippingCountry: true,
      customerEmail: true,
      customerPhone: true,
    },
  });

  return lastOrder;
}

// Order confirmation is reachable right after guest checkout (no session
// yet) and by the signed-in owner. Access is proven either by knowing the
// Stripe session id from the redirect, or by owning the order.
export async function getOrderForConfirmation(
  orderId: string,
  sessionId?: string
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        include: {
          product: { select: { name: true, slug: true, sku: true, images: true } },
        },
      },
    },
  });

  if (!order) return null;

  const user = await getCurrentUser();
  const ownsOrder = user && order.userId === user.id;
  const provedBySession =
    !!sessionId && !!order.stripeSessionId && sessionId === order.stripeSessionId;

  if (!ownsOrder && !provedBySession) return null;

  return order;
}
