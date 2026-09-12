// app/api/stripe/create-checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createCheckout } from '@/server/actions/checkout';

export async function POST(request: NextRequest) {
  const body = await request.json();

  const formData = new FormData();
  formData.set('items', JSON.stringify(body.items ?? []));
  formData.set('shippingAddress', JSON.stringify(body.shippingAddress ?? {}));
  formData.set('billingAddress', JSON.stringify(body.billingAddress ?? null));
  formData.set('customerInfo', JSON.stringify(body.customerInfo ?? {}));
  formData.set('shippingMethod', body.shippingMethod ?? 'standard');
  if (body.notes) formData.set('notes', body.notes);

  const result = await createCheckout(formData);

  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
