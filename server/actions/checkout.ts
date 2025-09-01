// server/actions/checkout.ts
'use server'

import prisma from '@/lib/prisma'
import { stripe, createCheckoutSession } from '@/lib/stripe'
import { sendOrderConfirmation } from '@/lib/emails'
import { checkoutSchema } from '@/lib/validators'
import { getCurrentUser } from '@/lib/auth'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { getCart, clearCart } from './cart'

export async function createCheckout(formData: FormData) {
  try {
    const checkoutData = {
      items: JSON.parse(formData.get('items') as string),
      shippingAddress: JSON.parse(formData.get('shippingAddress') as string),
      billingAddress: JSON.parse(formData.get('billingAddress') as string || 'null'),
      customerInfo: JSON.parse(formData.get('customerInfo') as string),
      shippingMethod: formData.get('shippingMethod') as string,
      notes: formData.get('notes') as string || undefined,
    }

    const validatedData = checkoutSchema.parse(checkoutData)
    const user = await getCurrentUser()

    // Verify cart items and calculate total
    const cart = await getCart()
    if (cart.items.length === 0) {
      return { success: false, error: 'Cart is empty' }
    }

    // Check inventory for all items
    for (const item of validatedData.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { inventory: true, isActive: true },
      })

      if (!product || !product.isActive) {
        return { success: false, error: 'One or more products are unavailable' }
      }

      if (product.inventory < item.quantity) {
        return { success: false, error: 'Insufficient inventory for one or more items' }
      }
    }

    // Calculate shipping cost
    const shippingCost = await calculateShippingCost(
      validatedData.shippingMethod,
      validatedData.shippingAddress,
      cart.total
    )

    const subtotal = cart.total
    const tax = calculateTax(subtotal, validatedData.shippingAddress.state)
    const total = subtotal + shippingCost + tax

    // Create pending order
    const order = await prisma.order.create({
      data: {
        userId: user?.id,
        status: 'PENDING',
        subtotal,
        shippingCost,
        tax,
        total,
        currency: 'USD',
        customerEmail: validatedData.customerInfo.email,
        customerName: `${validatedData.customerInfo.firstName} ${validatedData.customerInfo.lastName}`,
        customerPhone: validatedData.customerInfo.phone,
        shippingAddress: validatedData.shippingAddress,
        billingAddress: validatedData.billingAddress || validatedData.shippingAddress,
        shippingMethod: validatedData.shippingMethod,
        notes: validatedData.notes,
        items: {
          create: validatedData.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                images: true,
              },
            },
          },
        },
      },
    })

    // Create Stripe checkout session
    const lineItems = order.items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product.name,
          images: item.product.images.slice(0, 1),
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }))

    // Add shipping as line item
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Shipping (${validatedData.shippingMethod})`,
          },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      })
    }

    // Add tax as line item
    if (tax > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Tax',
          },
          unit_amount: Math.round(tax * 100),
        },
        quantity: 1,
      })
    }

    const session = await createCheckoutSession({
      items: lineItems,
      customer_email: validatedData.customerInfo.email,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      metadata: {
        orderId: order.id,
      },
    })

    // Update order with Stripe session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    })

    revalidateTag('orders')
    
    return { success: true, sessionId: session.id, url: session.url }
  } catch (error) {
    console.error('Create checkout error:', error)
    return { success: false, error: 'Failed to create checkout session' }
  }
}

export async function processSuccessfulPayment(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    })

    if (!session.metadata?.orderId) {
      throw new Error('Order ID not found in session metadata')
    }

    const order = await prisma.order.findUnique({
      where: { id: session.metadata.orderId },
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
      },
    })

    if (!order) {
      throw new Error('Order not found')
    }

    // Update order status and payment info
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'PROCESSING',
        stripePaymentIntentId: session.payment_intent?.id,
        paidAt: new Date(),
      },
    })

    // Update product inventory
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          inventory: {
            decrement: item.quantity,
          },
        },
      })
    }

    // Clear user's cart
    await clearCart()

    // Send confirmation email
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

    revalidateTag('orders')
    revalidateTag('products')
    
    return { success: true, order }
  } catch (error) {
    console.error('Process successful payment error:', error)
    return { success: false, error: 'Failed to process payment' }
  }
}

export async function calculateShippingCost(
  method: string,
  address: any,
  orderValue: number
): Promise<number> {
  // Simple shipping calculation - customize based on your needs
  const shippingRates = {
    'standard': 5.99,
    'express': 12.99,
    'overnight': 24.99,
    'free': 0,
  }

  // Free shipping for orders over $75
  if (orderValue >= 75) {
    return 0
  }

  return shippingRates[method as keyof typeof shippingRates] || 5.99
}

export function calculateTax(subtotal: number, state: string): number {
  // Simple tax calculation - customize based on your tax requirements
  const taxRates: Record<string, number> = {
    'CA': 0.08,
    'NY': 0.08,
    'TX': 0.065,
    'FL': 0.06,
    // Add more states as needed
  }

  const taxRate = taxRates[state] || 0
  return subtotal * taxRate
}

export async function cancelOrder(orderId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Authentication required' }
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    if (order.userId !== user.id) {
      return { success: false, error: 'Unauthorized' }
    }

    if (!['PENDING', 'PROCESSING'].includes(order.status)) {
      return { success: false, error: 'Order cannot be cancelled' }
    }

    // Restore inventory if order was already processed
    if (order.status === 'PROCESSING') {
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            inventory: {
              increment: item.quantity,
            },
          },
        })
      }
    }

    // Cancel order
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    })

    revalidateTag('orders')
    revalidateTag('products')
    
    return { success: true }
  } catch (error) {
    console.error('Cancel order error:', error)
    return { success: false, error: 'Failed to cancel order' }
  }
}

export async function getShippingMethods() {
  return [
    {
      id: 'standard',
      name: 'Standard Shipping',
      description: '5-7 business days',
      price: 5.99,
    },
    {
      id: 'express',
      name: 'Express Shipping',
      description: '2-3 business days',
      price: 12.99,
    },
    {
      id: 'overnight',
      name: 'Overnight Shipping',
      description: '1 business day',
      price: 24.99,
    },
  ]
}