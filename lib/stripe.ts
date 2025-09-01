// lib/stripe.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100)
}

export const formatAmountFromStripe = (amount: number): number => {
  return amount / 100
}

export const createPaymentIntent = async (amount: number, currency = 'usd') => {
  return await stripe.paymentIntents.create({
    amount: formatAmountForStripe(amount),
    currency,
    automatic_payment_methods: {
      enabled: true,
    },
  })
}

export const createCheckoutSession = async (params: {
  items: Array<{
    price_data: {
      currency: string
      product_data: {
        name: string
        images?: string[]
      }
      unit_amount: number
    }
    quantity: number
  }>
  customer_email?: string
  success_url: string
  cancel_url: string
  metadata?: Record<string, string>
}) => {
  return await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: params.items,
    customer_email: params.customer_email,
    success_url: params.success_url,
    cancel_url: params.cancel_url,
    metadata: params.metadata,
  })
}

export const constructWebhookEvent = (body: string, signature: string) => {
  return stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}

export const retrieveCheckoutSession = async (sessionId: string) => {
  return await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'payment_intent'],
  })
}

export const createCustomer = async (params: {
  email: string
  name?: string
}) => {
  return await stripe.customers.create(params)
}

export const updateCustomer = async (
  customerId: string,
  params: {
    email?: string
    name?: string
    metadata?: Record<string, string>
  }
) => {
  return await stripe.customers.update(customerId, params)
}