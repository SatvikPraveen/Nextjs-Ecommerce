// File: app/(account)/orders/[id]/success/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { CheckCircle } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { getOrderForConfirmation } from '@/server/actions/orders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';

interface SuccessPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session_id?: string }>;
}

export const metadata: Metadata = {
  title: 'Order Confirmed',
  description: 'Your order has been placed.',
};

export default async function OrderSuccessPage(props: SuccessPageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const order = await getOrderForConfirmation(
    params.id,
    searchParams.session_id
  );

  if (!order) {
    notFound();
  }

  const session = await getServerSession(authOptions);

  return (
    <div
      className="mx-auto max-w-3xl px-4 py-16 sm:px-6"
      data-testid="order-confirmation"
    >
      <div className="mb-8 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
          Order Confirmed
        </h1>
        <p className="mt-2 text-muted-foreground" data-testid="email-confirmation">
          A confirmation has been sent to {order.customerEmail}.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Order <span data-testid="order-number">{order.orderNumber}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div data-testid="order-items" className="space-y-3">
            {order.orderItems.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.product.name} × {item.quantity}
                </span>
                <span>{formatPrice(Number(item.price) * item.quantity)}</span>
              </div>
            ))}
          </div>

          <Separator />

          <div
            className="flex justify-between text-lg font-semibold"
            data-testid="order-total"
          >
            <span>Total</span>
            <span>{formatPrice(Number(order.total))}</span>
          </div>

          <Separator />

          <div data-testid="shipping-address" className="text-sm">
            <p className="mb-1 font-medium">Shipping to</p>
            <p>{order.shippingName}</p>
            <p>{order.shippingAddress}</p>
            <p>
              {order.shippingCity}, {order.shippingState} {order.shippingZip}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
        {session?.user && (
          <Button asChild variant="outline" data-testid="view-all-orders">
            <Link href="/orders">View All Orders</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
