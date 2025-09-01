// File: app/(store)/products/[slug]/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Heart, Share2, Truck, Shield, RotateCcw } from 'lucide-react'
import { getProductBySlug, getRelatedProducts } from '@/server/queries/products'
import { AddToCart } from '@/components/add-to-cart'
import { ProductCard } from '@/components/product-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatPrice } from '@/lib/utils'
import { JsonLd } from '@/components/jsonld'

interface ProductPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug)

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      type: 'product',
      images: product.images.map(img => ({
        url: img.url,
        width: 1200,
        height: 630,
        alt: product.name,
      })),
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: product.images.map(img => img.url),
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(product.id, product.categoryId)

  const averageRating = 4.5 // This would come from reviews
  const totalReviews = 128 // This would come from reviews

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images.map(img => img.url),
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Store Brand'
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'NextJS E-commerce Store'
      }
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: averageRating,
      reviewCount: totalReviews
    }
  }

  return (
    <>
      <JsonLd data={structuredData} />
      
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
            <li><Link href="/" className="hover:text-foreground">Home</Link></li>
            <li>/</li>
            <li><Link href="/products" className="hover:text-foreground">Products</Link></li>
            <li>/</li>
            <li><Link href={`/category/${product.category?.slug}`} className="hover:text-foreground">{product.category?.name}</Link></li>
            <li>/</li>
            <li className="text-foreground font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg">
              <Image
                src={product.images[0]?.url || '/images/placeholder.png'}
                alt={product.name}
                width={600}
                height={600}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1, 5).map((image, index) => (
                  <div key={index} className="aspect-square overflow-hidden rounded-lg">
                    <Image
                      src={image.url}
                      alt={`${product.name} ${index + 2}`}
                      width={150}
                      height={150}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {product.name}
              </h1>
              <div className="mt-2 flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(averageRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {averageRating} ({totalReviews} reviews)
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>
              {product.compareAtPrice && (
                <Badge variant="secondary">
                  Save {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                </Badge>
              )}
            </div>

            <p className="text-gray-600">{product.description}</p>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Badge variant={product.stock > 0 ? 'default' : 'destructive'}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </Badge>
                {product.sku && (
                  <span className="text-sm text-muted-foreground">SKU: {product.sku}</span>
                )}
              </div>

              <AddToCart product={product} />

              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Heart className="mr-2 h-4 w-4" />
                  Add to Wishlist
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>

            <Separator />

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <Truck className="mx-auto h-8 w-8 text-blue-600" />
                <p className="mt-2 text-sm font-medium">Free Shipping</p>
                <p className="text-xs text-muted-foreground">On orders over $100</p>
              </div>
              <div>
                <Shield className="mx-auto h-8 w-8 text-green-600" />
                <p className="mt-2 text-sm font-medium">Secure Payment</p>
                <p className="text-xs text-muted-foreground">100% protected</p>
              </div>
              <div>
                <RotateCcw className="mx-auto h-8 w-8 text-purple-600" />
                <p className="mt-2 text-sm font-medium">Easy Returns</p>
                <p className="text-xs text-muted-foreground">30-day policy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-8">
              <div className="prose max-w-none">
                <p>{product.description}</p>
                {/* Add more detailed description content here */}
              </div>
            </TabsContent>
            
            <TabsContent value="specifications" className="mt-8">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-2 py-2 border-b">
                  <span className="font-medium">SKU</span>
                  <span>{product.sku}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 py-2 border-b">
                  <span className="font-medium">Category</span>
                  <span>{product.category?.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 py-2 border-b">
                  <span className="font-medium">Weight</span>
                  <span>1.2 lbs</span>
                </div>
                <div className="grid grid-cols-2 gap-2 py-2 border-b">
                  <span className="font-medium">Dimensions</span>
                  <span>10 × 8 × 2 in</span>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-8">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Reviews coming soon...</p>
              </div>
            </TabsContent>
            
            <TabsContent value="shipping" className="mt-8">
              <div className="prose max-w-none">
                <h3>Shipping Information</h3>
                <ul>
                  <li>Free standard shipping on orders over $100</li>
                  <li>Express shipping available for $15</li>
                  <li>Orders typically process within 1-2 business days</li>
                </ul>
                
                <h3>Return Policy</h3>
                <ul>
                  <li>30-day return window</li>
                  <li>Items must be in original condition</li>
                  <li>Free return shipping for defective items</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-8">
              Related Products
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}