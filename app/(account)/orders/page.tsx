// File: app/(account)/orders/page.tsx
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { getOrders } from '@/server/queries/orders';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'My Orders',
  description: 'View your order history.',
};

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/auth/signin?callbackUrl=/orders');
  }

  const { orders } = await getOrders(1, 20);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-gray-900">
        My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="rounded-lg border py-16 text-center">
          <p className="text-muted-foreground">
            You haven&apos;t placed any orders yet.
          </p>
          <Link
            href="/products"
            className="mt-4 inline-block font-medium text-primary underline-offset-4 hover:underline"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card
                data-testid="order-list-item"
                className="transition-colors hover:bg-muted/50"
              >
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <p className="font-medium">Order #{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge>{order.status}</Badge>
                    <p className="font-semibold">
                      {formatPrice(Number(order.total))}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
