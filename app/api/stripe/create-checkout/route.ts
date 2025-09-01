// File: app/api/stripe/create-checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { stripe } from '@/lib/stripe'
import { authOptions } from '@/lib/auth'
import { getCartItems } from '@/server/queries/cart'
import { createOrder } from '@/server/actions/checkout'

const checkoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
  })),
  shippingAddress: z.object({
    name: z.string(),
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }),
  billingAddress: z.object({
    name: z.string(),
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { items, shippingAddress, billingAddress } = checkoutSchema.parse(body)

    // Get cart items with product details
    const cartItems = await getCartItems(session.user.id)
    
    if (!cartItems.length) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      )
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    )
    const shippingCost = subtotal >= 10000 ? 0 : 1500 // Free shipping over $100
    const tax = Math.round(subtotal * 0.08) // 8% tax
    const total = subtotal + shippingCost + tax

    // Create Stripe checkout session
    const session_checkout = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: session.user.email!,
      line_items: cartItems.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.product.name,
            description: item.product.description,
            images: item.product.images.map(img => img.url),
          },
          unit_amount: item.product.price,
        },
        quantity: item.quantity,
      })),
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: shippingCost,
              currency: 'usd',
            },
            display_name: shippingCost === 0 ? 'Free shipping' : 'Standard shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 3,
              },
              maximum: {
                unit: 'business_day',
                value: 7,
              },
            },
          },
        },
      ],
      automatic_tax: {
        enabled: false, // We're calculating tax manually
      },
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'],
      },
      billing_address_collection: 'required',
      metadata: {
        userId: session.user.id,
        orderItems: JSON.stringify(items),
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
    })

    // Create pending order in database
    const order = await createOrder({
      userId: session.user.id,
      items: cartItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      subtotal,
      shippingCost,
      tax,
      total,
      stripeSessionId: session_checkout.id,
    })

    return NextResponse.json({
      sessionId: session_checkout.id,
      url: session_checkout.url,
      orderId: order.id,
    })

  } catch (error) {
    console.error('Checkout error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}