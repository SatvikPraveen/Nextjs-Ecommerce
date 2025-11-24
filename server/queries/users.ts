// server/queries/users.ts

import prisma from '@/lib/prisma';

export async function getUserById(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: true,
        reviews: true,
      },
    });
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

// Alias for getUserById
export const getUserProfile = getUserById;

export async function getUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    throw error;
  }
}

export async function getAllUsers(skip: number = 0, take: number = 10) {
  try {
    const users = await prisma.user.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export async function updateUserProfile(
  userId: string,
  data: {
    name?: string;
    image?: string;
    email?: string;
  }
) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });
    return user;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function getUserOrders(userId: string) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return orders;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
}

export async function getUserCart(userId: string) {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
    return cart;
  } catch (error) {
    console.error('Error fetching user cart:', error);
    throw error;
  }
}
