// File: app/page.tsx
import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowRight, Star, TrendingUp, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductGrid } from '@/components/product-grid'
import { ProductCard } from '@/components/product-card'
import { ProductGridSkeleton } from '@/components/product-grid-skeleton'
import { getFeaturedProducts, getNewProducts } from '@/server/queries/products'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Home',
  description: 'Discover amazing products at unbeatable prices. Shop the latest trends and bestsellers.',
  openGraph: {
    title: 'NextJS E-commerce Store - Home',
    description: 'Discover amazing products at unbeatable prices',
    type: 'website'
  }
}

async function FeaturedProducts() {
  const products = await getFeaturedProducts()
  
  if (!products.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No featured products available.</p>
      </div>
    )
  }

  return (
    <ProductGrid>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </ProductGrid>
  )
}

async function NewProducts() {
  const products = await getNewProducts()
  
  if (!products.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No new products available.</p>
      </div>
    )
  }

  return (
    <ProductGrid>
      {products.slice(0, 4).map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </ProductGrid>
  )
}

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Welcome to Our
              <span className="block text-yellow-300">Amazing Store</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-200">
              Discover incredible products at unbeatable prices. From the latest trends to timeless classics, 
              we have everything you need to elevate your lifestyle.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-gray-900">
                <Link href="/category/featured">
                  Browse Categories
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="flex justify-center">
                <Users className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="mt-4 text-3xl font-bold text-gray-900">10K+</h3>
              <p className="text-gray-600">Happy Customers</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center">
                <TrendingUp className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="mt-4 text-3xl font-bold text-gray-900">500+</h3>
              <p className="text-gray-600">Products Available</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center">
                <Star className="h-12 w-12 text-yellow-600" />
              </div>
              <h3 className="mt-4 text-3xl font-bold text-gray-900">4.9/5</h3>
              <p className="text-gray-600">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Featured Products
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Hand-picked selections from our best-selling items
            </p>
          </div>
          <div className="mt-12">
            <Suspense fallback={<ProductGridSkeleton />}>
              <FeaturedProducts />
            </Suspense>
          </div>
          <div className="mt-12 text-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/products">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              New Arrivals
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Fresh finds and latest additions to our collection
            </p>
          </div>
          <div className="mt-12">
            <Suspense fallback={<ProductGridSkeleton />}>
              <NewProducts />
            </Suspense>
          </div>
          <div className="mt-12 text-center">
            <Button asChild size="lg">
              <Link href="/products?sort=newest">
                Shop New Arrivals
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Stay Updated
            </h2>
            <p className="mt-4 text-lg text-gray-300">
              Subscribe to our newsletter for exclusive deals and new product alerts
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full max-w-sm rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}