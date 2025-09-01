// File: app/(account)/orders/[id]/page.tsx
import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Package, Truck, CheckCircle, Clock } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { getOrderById } from '@/server/queries/orders'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice, formatDate } from '@/lib/utils'

interface OrderDetailPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: OrderDetailPageProps): Promise<Metadata> {
  return {
    title: `Order #${params.id}`,
    description: 'View your order details and tracking information.',
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'PENDING':
      return <Clock className="h-5 w-5 text-yellow-500" />
    case 'PROCESSING':
      return <Package className="h-5 w-5 text-blue-500" />
    case 'SHIPPED':
      return <Truck className="h-5 w-5 text-purple-500" />
    case 'DELIVERED':
      return <CheckCircle className="h-5 w-5 text-green-500" />
    default:
      return <Clock className="h-5 w-5 text-gray-500" />
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'PROCESSING':
      return 'bg-blue-100 text-blue-800'
    case 'SHIPPED':
      return 'bg-purple-100 text-purple-800'
    case 'DELIVERED':
      return 'bg-green-100 text-green-800'
    case 'CANCELLED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/api/auth/signin')
  }

  const order = await getOrderById(params.id, session.user.id)

  if (!order) {
    notFound()
  }

  const statusSteps = [
    { key: 'PENDING', label: 'Order Placed', completed: true },
    { key: 'PROCESSING', label: 'Processing', completed: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status) },
    { key: 'SHIPPED', label: 'Shipped', completed: ['SHIPPED', 'DELIVERED'].includes(order.status) },
    { key: 'DELIVERED', label: 'Delivered', completed: order.status === 'DELIVERED' }
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Order #{order.orderNumber}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(order.status)}
            <Badge className={getStatusColor(order.status)}>
              {order.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                {statusSteps.map((step, index) => (
                  <div key={step.key} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center
                        ${step.completed 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 text-gray-500'
                        }
                      `}>
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <span className="mt-2 text-xs font-medium text-center">
                        {step.label}
                      </span>
                    </div>
                    {index < statusSteps.length - 1 && (
                      <div className={`
                        w-16 h-0.5 mx-2 mt-[-20px]
                        ${step.completed ? 'bg-green-500' : 'bg-gray-200'}
                      `} />
                    )}
                  </div>
                ))}
              </div>
              
              {order.trackingNumber && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-900">Tracking Number</p>
                  <p className="text-blue-700">{order.trackingNumber}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items Ordered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Image
                        src={item.product.images[0]?.url || '/images/placeholder.png'}
                        alt={item.product.name}
                        width={80}
                        height={80}
                        className="h-20 w-20 rounded-md object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="font-medium text-gray-900 hover:text-gray-700"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        SKU: {item.product.sku}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatPrice(item.price)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total: {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          {/* Payment & Shipping */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>{formatPrice(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="font-medium">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.line1}</p>
                {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-5 bg-gray-200 rounded"></div>
                <span className="text-sm">**** **** **** {order.paymentMethod.last4}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {order.paymentMethod.brand} ending in {order.paymentMethod.last4}
              </p>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            {order.status === 'DELIVERED' && (
              <Button className="w-full">
                Leave a Review
              </Button>
            )}
            {['PENDING', 'PROCESSING'].includes(order.status) && (
              <Button variant="outline" className="w-full">
                Cancel Order
              </Button>
            )}
            <Button variant="outline" className="w-full">
              Contact Support
            </Button>
            <Button variant="outline" className="w-full">
              Reorder Items
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}