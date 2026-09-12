// components/checkout/checkout-form.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency } from '@/lib/utils';

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: Array<{ url: string }>;
  };
}

interface SavedAddress {
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string | null;
  shippingZip: string;
  shippingCountry: string;
  customerEmail: string;
  customerPhone: string | null;
}

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface CheckoutFormProps {
  cart: { items: CartItem[]; total: number; itemCount: number };
  isLoggedIn: boolean;
  userEmail?: string;
  savedAddress: SavedAddress | null;
  shippingMethods: ShippingMethod[];
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID',
  'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS',
  'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK',
  'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV',
  'WI', 'WY',
];

export function CheckoutForm({
  cart,
  isLoggedIn,
  userEmail,
  savedAddress,
  shippingMethods,
}: CheckoutFormProps) {
  const [addressMode, setAddressMode] = useState<'saved' | 'form'>(
    isLoggedIn && savedAddress ? 'saved' : 'form'
  );
  const [email, setEmail] = useState(userEmail ?? '');
  const [firstName, setFirstName] = useState(
    savedAddress?.shippingName?.split(' ')[0] ?? ''
  );
  const [lastName, setLastName] = useState(
    savedAddress?.shippingName?.split(' ').slice(1).join(' ') ?? ''
  );
  const [address, setAddress] = useState(savedAddress?.shippingAddress ?? '');
  const [city, setCity] = useState(savedAddress?.shippingCity ?? '');
  const [state, setState] = useState(savedAddress?.shippingState ?? '');
  const [zip, setZip] = useState(savedAddress?.shippingZip ?? '');
  const [phone, setPhone] = useState(savedAddress?.customerPhone ?? '');
  const [shippingMethod, setShippingMethod] = useState(
    shippingMethods[0]?.id ?? 'standard'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  const useSavedAddress = () => setAddressMode('saved');
  const editAddress = () => setAddressMode('form');

  const handlePlaceOrder = async () => {
    setError(null);

    if (cart.items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    const info =
      addressMode === 'saved' && savedAddress
        ? {
            email: savedAddress.customerEmail,
            firstName: savedAddress.shippingName.split(' ')[0] ?? '',
            lastName: savedAddress.shippingName.split(' ').slice(1).join(' '),
            phone: savedAddress.customerPhone ?? undefined,
            line1: savedAddress.shippingAddress,
            city: savedAddress.shippingCity,
            state: savedAddress.shippingState ?? '',
            postalCode: savedAddress.shippingZip,
            country: savedAddress.shippingCountry,
          }
        : {
            email,
            firstName,
            lastName,
            phone: phone || undefined,
            line1: address,
            city,
            state,
            postalCode: zip,
            country: 'US',
          };

    if (
      !info.email ||
      !info.firstName ||
      !info.lastName ||
      !info.line1 ||
      !info.city ||
      !info.state ||
      !info.postalCode
    ) {
      setError('Please fill in all required shipping fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.items.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          })),
          shippingAddress: {
            line1: info.line1,
            city: info.city,
            state: info.state,
            postalCode: info.postalCode,
            country: info.country,
          },
          customerInfo: {
            email: info.email,
            firstName: info.firstName,
            lastName: info.lastName,
            phone: info.phone,
          },
          shippingMethod,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to start checkout.');
        return;
      }

      setRedirectUrl(data.url);
      window.location.assign(data.url);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">
          Add some products before checking out.
        </p>
        <Button asChild className="mt-6">
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-gray-900">
        Checkout
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {error && (
            <Alert variant="destructive" data-testid="checkout-error">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {redirectUrl && (
            <Alert data-testid="checkout-redirecting">
              <AlertDescription>
                Redirecting you to secure payment.{' '}
                <a
                  href={redirectUrl}
                  data-testid="stripe-redirect-link"
                  className="underline"
                >
                  Click here if you are not redirected automatically.
                </a>
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {addressMode === 'saved' && savedAddress ? (
                <div className="space-y-4" data-testid="saved-address">
                  <div className="rounded-lg border p-4 text-sm">
                    <p className="font-medium">{savedAddress.shippingName}</p>
                    <p>{savedAddress.shippingAddress}</p>
                    <p>
                      {savedAddress.shippingCity}, {savedAddress.shippingState}{' '}
                      {savedAddress.shippingZip}
                    </p>
                    <p>{savedAddress.customerEmail}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      data-testid="use-default-address"
                      onClick={useSavedAddress}
                    >
                      Use this address
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={editAddress}
                    >
                      Use a different address
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="checkout-email">Email</Label>
                    <Input
                      id="checkout-email"
                      data-testid="checkout-email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      disabled={isLoggedIn && !!userEmail}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkout-first-name">First name</Label>
                    <Input
                      id="checkout-first-name"
                      data-testid="checkout-first-name"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkout-last-name">Last name</Label>
                    <Input
                      id="checkout-last-name"
                      data-testid="checkout-last-name"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="checkout-address">Address</Label>
                    <Input
                      id="checkout-address"
                      data-testid="checkout-address"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkout-city">City</Label>
                    <Input
                      id="checkout-city"
                      data-testid="checkout-city"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkout-state">State</Label>
                    <select
                      id="checkout-state"
                      data-testid="checkout-state"
                      value={state}
                      onChange={e => setState(e.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">Select a state</option>
                      {US_STATES.map(code => (
                        <option key={code} value={code}>
                          {code}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkout-zip">ZIP code</Label>
                    <Input
                      id="checkout-zip"
                      data-testid="checkout-zip"
                      value={zip}
                      onChange={e => setZip(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkout-phone">Phone (optional)</Label>
                    <Input
                      id="checkout-phone"
                      data-testid="checkout-phone"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                    />
                  </div>
                  {isLoggedIn && savedAddress && (
                    <div className="sm:col-span-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={useSavedAddress}
                      >
                        Use my saved address instead
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {shippingMethods.map(method => (
                <label
                  key={method.id}
                  className="flex cursor-pointer items-center justify-between rounded-lg border p-3 text-sm"
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value={method.id}
                      checked={shippingMethod === method.id}
                      onChange={() => setShippingMethod(method.id)}
                      data-testid={`shipping-method-${method.id}`}
                    />
                    <span>
                      <span className="block font-medium">{method.name}</span>
                      <span className="block text-muted-foreground">
                        {method.description}
                      </span>
                    </span>
                  </span>
                  <span className="font-medium">
                    {formatCurrency(method.price)}
                  </span>
                </label>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {cart.items.map(item => (
                  <div
                    key={item.id}
                    data-testid="checkout-summary-item"
                    className="flex items-center gap-3 text-sm"
                  >
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-muted">
                      <Image
                        src={
                          item.product.images[0]?.url ||
                          '/images/placeholder.png'
                        }
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {item.product.name}
                      </p>
                      <p className="text-muted-foreground">
                        Qty {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatCurrency(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <Separator />

              <div
                className="flex justify-between text-sm"
                data-testid="checkout-subtotal"
              >
                <span>Subtotal ({cart.itemCount} items)</span>
                <span>{formatCurrency(cart.total)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Shipping and tax are calculated on the next step.
              </p>

              <Separator />

              <div
                className="flex justify-between text-lg font-semibold"
                data-testid="checkout-total"
              >
                <span>Estimated total</span>
                <span>{formatCurrency(cart.total)}</span>
              </div>

              <Button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full"
                size="lg"
                data-testid="place-order"
              >
                {isSubmitting ? 'Placing order...' : 'Place Order'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
