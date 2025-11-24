// server/queries/cart.ts

import prisma from '@/lib/prisma';

export async function getCartItems(userId: string) {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      // Create an empty cart if it doesn't exist
      return {
        userId,
        items: [],
      };
    }

    return cart;
  } catch (error) {
    console.error('Error fetching cart items:', error);
    throw error;
  }
}

export async function getCartTotal(userId: string): Promise<number> {
  try {
    const cart = await getCartItems(userId);
    return cart.items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);
  } catch (error) {
    console.error('Error calculating cart total:', error);
    throw error;
  }
}

export async function getCartItemCount(userId: string): Promise<number> {
  try {
    const cart = await getCartItems(userId);
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  } catch (error) {
    console.error('Error getting cart item count:', error);
    throw error;
  }
}

export async function clearCart(userId: string) {
  try {
    await prisma.cartItem.deleteMany({
      where: {
        cart: {
          userId,
        },
      },
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
}
