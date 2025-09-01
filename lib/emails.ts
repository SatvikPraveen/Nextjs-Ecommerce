// lib/emails.ts
import { Resend } from 'resend'
import { render } from '@react-email/render'
import { OrderConfirmation } from '@/emails/OrderConfirmation'
import { ResetPassword } from '@/emails/ResetPassword'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface OrderEmailData {
  orderId: string
  customerName: string
  customerEmail: string
  orderTotal: number
  items: Array<{
    name: string
    quantity: number
    price: number
    image?: string
  }>
  shippingAddress: {
    line1: string
    line2?: string
    city: string
    state: string
    postal_code: string
    country: string
  }
}

export interface ResetPasswordEmailData {
  name: string
  resetLink: string
}

export const sendOrderConfirmation = async (data: OrderEmailData) => {
  try {
    const emailHtml = render(OrderConfirmation(data))
    
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: data.customerEmail,
      subject: `Order Confirmation - #${data.orderId}`,
      html: emailHtml,
    })
    
    return { success: true }
  } catch (error) {
    console.error('Failed to send order confirmation email:', error)
    return { success: false, error }
  }
}

export const sendResetPasswordEmail = async (
  email: string,
  data: ResetPasswordEmailData
) => {
  try {
    const emailHtml = render(ResetPassword(data))
    
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: 'Reset your password',
      html: emailHtml,
    })
    
    return { success: true }
  } catch (error) {
    console.error('Failed to send reset password email:', error)
    return { success: false, error }
  }
}

export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: 'Welcome to our store!',
      html: `
        <h1>Welcome ${name}!</h1>
        <p>Thank you for creating an account with us. We're excited to have you as a customer.</p>
        <p>Start shopping now and enjoy exclusive deals and offers.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Start Shopping
        </a>
      `,
    })
    
    return { success: true }
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    return { success: false, error }
  }
}

export const sendLowStockAlert = async (
  adminEmail: string,
  productName: string,
  currentStock: number
) => {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: adminEmail,
      subject: `Low Stock Alert: ${productName}`,
      html: `
        <h2>Low Stock Alert</h2>
        <p>The following product is running low on stock:</p>
        <ul>
          <li><strong>Product:</strong> ${productName}</li>
          <li><strong>Current Stock:</strong> ${currentStock}</li>
        </ul>
        <p>Please consider restocking this item soon.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/inventory" style="background-color: #f59e0b; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Manage Inventory
        </a>
      `,
    })
    
    return { success: true }
  } catch (error) {
    console.error('Failed to send low stock alert:', error)
    return { success: false, error }
  }
}