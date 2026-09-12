// File: app/(store)/checkout/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCart } from '@/server/actions/cart';
import { getSavedAddressForCurrentUser } from '@/server/actions/orders';
import { getShippingMethods } from '@/server/actions/checkout';
import { CheckoutForm } from '@/components/checkout/checkout-form';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your order.',
};

export default async function CheckoutPage() {
  const [cart, session, savedAddress, shippingMethods] = await Promise.all([
    getCart(),
    getServerSession(authOptions),
    getSavedAddressForCurrentUser(),
    getShippingMethods(),
  ]);

  return (
    <CheckoutForm
      cart={cart}
      isLoggedIn={!!session?.user}
      userEmail={session?.user?.email ?? undefined}
      savedAddress={savedAddress}
      shippingMethods={shippingMethods}
    />
  );
}
