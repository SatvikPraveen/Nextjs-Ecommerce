// File: app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartProvider } from '@/components/cart-provider'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'NextJS E-commerce Store',
    template: '%s | NextJS E-commerce'
  },
  description: 'Modern e-commerce store built with Next.js, Prisma, and Stripe',
  keywords: ['ecommerce', 'nextjs', 'store', 'shopping'],
  authors: [{ name: 'NextJS E-commerce' }],
  creator: 'NextJS E-commerce',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'NextJS E-commerce Store',
    description: 'Modern e-commerce store built with Next.js',
    siteName: 'NextJS E-commerce'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NextJS E-commerce Store',
    description: 'Modern e-commerce store built with Next.js',
    creator: '@nextjsecommerce'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarnings>
      <body className={inter.className}>
        <Providers>
          <CartProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
          </CartProvider>
        </Providers>
      </body>
    </html>
  )
}