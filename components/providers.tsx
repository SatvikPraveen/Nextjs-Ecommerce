'use client';

import { SessionProvider } from 'next-auth/react';
import { CartProvider } from '@/components/cart-provider';

interface ProvidersProps {
  children: React.ReactNode;
  session?: any;
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <CartProvider>{children}</CartProvider>
    </SessionProvider>
  );
}
