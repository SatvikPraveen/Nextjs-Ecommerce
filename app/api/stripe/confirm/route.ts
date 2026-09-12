// app/api/stripe/confirm/route.ts
//
// Stripe redirects here (see success_url in server/actions/checkout.ts)
// instead of straight to the order confirmation page. There is no webhook
// in this app (see app/api/stripe/webhook), so this route is what actually
// finalizes the order -- it's a Route Handler, which is where revalidateTag
// and the cart-clearing cookie write are allowed to run. The confirmation
// page itself stays a plain read-only render.
import { NextRequest, NextResponse } from 'next/server';
import { processSuccessfulPayment } from '@/server/actions/checkout';

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id');
  const orderId = request.nextUrl.searchParams.get('orderId');

  if (!sessionId || !orderId) {
    return NextResponse.redirect(new URL('/cart', request.url));
  }

  const result = await processSuccessfulPayment(sessionId);
  if (!result.success) {
    console.error('Failed to finalize order after checkout:', orderId);
  }

  return NextResponse.redirect(
    new URL(
      `/orders/${orderId}/success?session_id=${encodeURIComponent(sessionId)}`,
      request.url
    )
  );
}
