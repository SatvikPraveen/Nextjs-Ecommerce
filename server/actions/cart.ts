// server/actions/cart.ts
'use server';

import prisma from '@/lib/prisma';
import { revalidateTag } from 'next/cache';
import {
  addToCartSchema,
  updateCartItemSchema,
  removeFromCartSchema,
} from '@/lib/validators';
import { getCurrentSession } from '@/lib/auth';
import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';

// Get or create cart session
async function getCartSession() {
  const session = await getCurrentSession();

  if (session?.user) {
    // Return user's cart
    return await prisma.cart.upsert({
      where: { userId: session.user.id },
      update: {},
      create: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
                status: true,
              },
            },
          },
        },
      },
    });
  } else {
    // Handle guest cart with session
    const cookieStore = await cookies();
    let sessionId = cookieStore.get('cart-session')?.value;

    if (!sessionId) {
      sessionId = nanoid();
      cookieStore.set('cart-session', sessionId, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });
    }

    return await prisma.cart.upsert({
      where: { sessionId },
      update: {},
      create: { sessionId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
                status: true,
              },
            },
          },
        },
      },
    });
  }
}

export async function addToCart(formData: FormData) {
  try {
    const productId = formData.get('productId') as string;
    const quantity = parseInt(formData.get('quantity') as string);
    const variantId = formData.get('variantId') as string | null;

    const validatedData = addToCartSchema.parse({
      productId,
      quantity,
      variantId: variantId || undefined,
    });

    // Check if product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId },
      select: {
        id: true,
        status: true,
        inventory: {
          select: { available: true },
        },
      },
    });

    if (!product || product.status !== 'PUBLISHED') {
      return { success: false, error: 'Product not found or unavailable' };
    }

    const availableQuantity = product.inventory[0]?.available || 0;
    if (availableQuantity < validatedData.quantity) {
      return { success: false, error: 'Insufficient inventory' };
    }

    const cart = await getCartSession();

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: validatedData.productId,
        variantId: validatedData.variantId,
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + validatedData.quantity;

      if (newQuantity > availableQuantity) {
        return {
          success: false,
          error: 'Cannot add more items than available in inventory',
        };
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: validatedData.productId,
          quantity: validatedData.quantity,
          variantId: validatedData.variantId,
        },
      });
    }

    revalidateTag('cart');
    return { success: true };
  } catch (error) {
    console.error('Add to cart error:', error);
    return { success: false, error: 'Failed to add item to cart' };
  }
}

export async function updateCartItem(itemId: string, formData: FormData) {
  try {
    const quantity = parseInt(formData.get('quantity') as string);
    const validatedData = updateCartItemSchema.parse({ quantity });

    const cart = await getCartSession();

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id,
      },
      include: {
        product: {
          select: {
            id: true,
            inventory: {
              select: { available: true },
            },
          },
        },
      },
    });

    if (!cartItem) {
      return { success: false, error: 'Cart item not found' };
    }

    if (validatedData.quantity === 0) {
      await prisma.cartItem.delete({
        where: { id: itemId },
      });
    } else {
      const totalAvailable =
        cartItem.product.inventory?.reduce(
          (sum, inv) => sum + inv.available,
          0
        ) || 0;
      if (validatedData.quantity > totalAvailable) {
        return {
          success: false,
          error: 'Quantity exceeds available inventory',
        };
      }

      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity: validatedData.quantity },
      });
    }

    revalidateTag('cart');
    return { success: true };
  } catch (error) {
    console.error('Update cart item error:', error);
    return { success: false, error: 'Failed to update cart item' };
  }
}

export async function removeFromCart(formData: FormData) {
  try {
    const productId = formData.get('productId') as string;
    const variantId = formData.get('variantId') as string | null;

    const validatedData = removeFromCartSchema.parse({
      productId,
      variantId: variantId || undefined,
    });

    const cart = await getCartSession();

    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        productId: validatedData.productId,
        variantId: validatedData.variantId,
      },
    });

    revalidateTag('cart');
    return { success: true };
  } catch (error) {
    console.error('Remove from cart error:', error);
    return { success: false, error: 'Failed to remove item from cart' };
  }
}

export async function clearCart() {
  try {
    const cart = await getCartSession();

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    revalidateTag('cart');
    return { success: true };
  } catch (error) {
    console.error('Clear cart error:', error);
    return { success: false, error: 'Failed to clear cart' };
  }
}

export async function getCart() {
  try {
    const cart = await getCartSession();

    const cartItems = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            comparePrice: true,
            images: true,
            status: true,
          },
        },
      },
    });

    // Convert Decimal prices to numbers
    const convertedItems = cartItems.map(item => ({
      ...item,
      product: {
        ...item.product,
        price: Number(item.product.price),
        comparePrice: item.product.comparePrice
          ? Number(item.product.comparePrice)
          : null,
      },
    }));

    const total = convertedItems.reduce((sum, item) => {
      return sum + Number(item.product.price) * item.quantity;
    }, 0);

    const itemCount = convertedItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    return {
      id: cart.id,
      items: convertedItems,
      total,
      itemCount,
      updatedAt: cart.updatedAt,
    };
  } catch (error) {
    console.error('Get cart error:', error);
    return {
      id: '',
      items: [],
      total: 0,
      itemCount: 0,
      updatedAt: new Date(),
    };
  }
}

export async function mergeGuestCart(guestSessionId: string) {
  try {
    const session = await getCurrentSession();
    if (!session?.user)
      return { success: false, error: 'User not authenticated' };

    const guestCart = await prisma.cart.findUnique({
      where: { sessionId: guestSessionId },
      include: { items: true },
    });

    if (!guestCart || guestCart.items.length === 0) {
      return { success: true }; // Nothing to merge
    }

    const userCart = await prisma.cart.upsert({
      where: { userId: session.user.id },
      update: {},
      create: { userId: session.user.id },
    });

    // Merge items from guest cart to user cart
    for (const item of guestCart.items) {
      const existingItem = await prisma.cartItem.findFirst({
        where: {
          cartId: userCart.id,
          productId: item.productId,
          variantId: item.variantId,
        },
      });

      if (existingItem) {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + item.quantity },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: userCart.id,
            productId: item.productId,
            quantity: item.quantity,
            variantId: item.variantId,
          },
        });
      }
    }

    // Delete guest cart
    await prisma.cart.delete({
      where: { id: guestCart.id },
    });

    revalidateTag('cart');
    return { success: true };
  } catch (error) {
    console.error('Merge guest cart error:', error);
    return { success: false, error: 'Failed to merge guest cart' };
  }
}
