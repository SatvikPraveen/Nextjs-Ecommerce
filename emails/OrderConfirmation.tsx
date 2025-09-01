// emails/OrderConfirmation.tsx
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Img,
  Hr,
  Row,
  Column,
  Button,
  Link,
} from '@react-email/components'

interface OrderConfirmationProps {
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

export const OrderConfirmation = ({
  orderId,
  customerName,
  customerEmail,
  orderTotal,
  items,
  shippingAddress,
}: OrderConfirmationProps) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = 5.99
  const tax = subtotal * 0.08

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerText}>Order Confirmation</Text>
          </Section>

          <Section style={section}>
            <Text style={greeting}>Hi {customerName},</Text>
            <Text style={paragraph}>
              Thank you for your order! We're processing it now and will send you a shipping 
              confirmation as soon as it's on its way.
            </Text>
            
            <Section style={orderInfo}>
              <Text style={orderNumber}>Order #: {orderId}</Text>
              <Text style={orderDate}>
                Order Date: {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </Section>
          </Section>

          <Hr style={hr} />

          <Section style={section}>
            <Text style={sectionTitle}>Order Items</Text>
            {items.map((item, index) => (
              <Row key={index} style={itemRow}>
                <Column style={itemImageColumn}>
                  {item.image && (
                    <Img
                      src={item.image}
                      alt={item.name}
                      style={itemImage}
                    />
                  )}
                </Column>
                <Column style={itemDetailsColumn}>
                  <Text style={itemName}>{item.name}</Text>
                  <Text style={itemQuantity}>Quantity: {item.quantity}</Text>
                </Column>
                <Column style={itemPriceColumn}>
                  <Text style={itemPrice}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Hr style={hr} />

          <Section style={section}>
            <Text style={sectionTitle}>Order Summary</Text>
            <Row style={summaryRow}>
              <Column><Text style={summaryLabel}>Subtotal:</Text></Column>
              <Column><Text style={summaryValue}>${subtotal.toFixed(2)}</Text></Column>
            </Row>
            <Row style={summaryRow}>
              <Column><Text style={summaryLabel}>Shipping:</Text></Column>
              <Column><Text style={summaryValue}>${shipping.toFixed(2)}</Text></Column>
            </Row>
            <Row style={summaryRow}>
              <Column><Text style={summaryLabel}>Tax:</Text></Column>
              <Column><Text style={summaryValue}>${tax.toFixed(2)}</Text></Column>
            </Row>
            <Hr style={summaryHr} />
            <Row style={summaryRow}>
              <Column><Text style={totalLabel}>Total:</Text></Column>
              <Column><Text style={totalValue}>${orderTotal.toFixed(2)}</Text></Column>
            </Row>
          </Section>

          <Hr style={hr} />

          <Section style={section}>
            <Text style={sectionTitle}>Shipping Address</Text>
            <Text style={address}>
              {shippingAddress.line1}
              {shippingAddress.line2 && <br />}
              {shippingAddress.line2}
              <br />
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}
              <br />
              {shippingAddress.country}
            </Text>
          </Section>

          <Section style={section}>
            <Button style={button} href={`${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}`}>
              View Order Details
            </Button>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              Questions about your order? Reply to this email or contact us at{' '}
              <Link href="mailto:support@yourstore.com" style={link}>
                support@yourstore.com
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const header = {
  padding: '32px 40px',
  backgroundColor: '#000000',
}

const headerText = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#ffffff',
  margin: '0',
  textAlign: 'center' as const,
}

const section = {
  padding: '0 40px',
}

const greeting = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#333333',
  margin: '32px 0 16px',
}

const paragraph = {
  fontSize: '16px',
  color: '#555555',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const orderInfo = {
  backgroundColor: '#f8f9fa',
  padding: '20px',
  borderRadius: '8px',
  margin: '24px 0',
}

const orderNumber = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#333333',
  margin: '0 0 8px',
}

const orderDate = {
  fontSize: '14px',
  color: '#666666',
  margin: '0',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '32px 0',
}

const sectionTitle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#333333',
  margin: '0 0 20px',
}

const itemRow = {
  padding: '16px 0',
  borderBottom: '1px solid #f0f0f0',
}

const itemImageColumn = {
  width: '80px',
  verticalAlign: 'top' as const,
}

const itemImage = {
  width: '64px',
  height: '64px',
  objectFit: 'cover' as const,
  borderRadius: '8px',
}

const itemDetailsColumn = {
  paddingLeft: '16px',
  verticalAlign: 'top' as const,
}

const itemName = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#333333',
  margin: '0 0 8px',
}

const itemQuantity = {
  fontSize: '14px',
  color: '#666666',
  margin: '0',
}

const itemPriceColumn = {
  textAlign: 'right' as const,
  verticalAlign: 'top' as const,
}

const itemPrice = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#333333',
  margin: '0',
}

const summaryRow = {
  padding: '8px 0',
}

const summaryLabel = {
  fontSize: '16px',
  color: '#555555',
  margin: '0',
}

const summaryValue = {
  fontSize: '16px',
  color: '#333333',
  textAlign: 'right' as const,
  margin: '0',
}

const summaryHr = {
  borderColor: '#e6ebf1',
  margin: '16px 0',
}

const totalLabel = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#333333',
  margin: '0',
}

const totalValue = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#333333',
  textAlign: 'right' as const,
  margin: '0',
}

const address = {
  fontSize: '16px',
  color: '#555555',
  lineHeight: '24px',
  margin: '0',
}

const button = {
  backgroundColor: '#000000',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '200px',
  padding: '12px 24px',
  margin: '24px auto',
}

const footer = {
  padding: '32px 40px',
  backgroundColor: '#f8f9fa',
}

const footerText = {
  fontSize: '14px',
  color: '#666666',
  textAlign: 'center' as const,
  margin: '0',
}

const link = {
  color: '#000000',
  textDecoration: 'underline',
}

export default OrderConfirmation