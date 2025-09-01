// File: app/(store)/category/[slug]/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { getCategoryBySlug, getProductsByCategory } from '@/server/queries/products'
import { ProductCard } from '@/components/product-card'
import { ProductGrid } from '@/components/product-grid'
import { ProductGridSkeleton } from '@/components/product-grid-skeleton'
import { SortSelect } from '@/components/sort-select'
import { FilterSidebar } from '@/components/filter-sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface CategoryPageProps {
  params: {
    slug: string
  }
  searchParams: {
    sort?: string
    minPrice?: string
    maxPrice?: string
    page?: string
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug)

  if (!category) {
    return {
      title: 'Category Not Found',
    }
  }

  return {
    title: `${category.name} | Products`,
    description: category.description || `Shop ${category.name.toLowerCase()} products at great prices.`,
    openGraph: {
      title: `${category.name} Products`,
      description: category.description || `Browse our ${category.name.toLowerCase()} collection`,
      type: 'website',
    },
  }
}

async function CategoryProducts({ 
  categoryId, 
  searchParams 
}: { 
  categoryId: string
  searchParams: CategoryPageProps['searchParams']
}) {
  const page = parseInt(searchParams.page || '1')
  const sort = searchParams.sort || 'newest'
  const minPrice = searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined
  const maxPrice = searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined

  const result = await getProductsByCategory({
    categoryId,
    page,
    limit: 12,
    sort: sort as any,
    minPrice,
    maxPrice,
  })

  if (!result.products.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No products found in this category.</p>
        <Button asChild className="mt-4">
          <Link href="/products">Browse All Products</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {((page - 1) * 12) + 1}-{Math.min(page * 12, result.total)} of {result.total} products
        </p>
        <SortSelect />
      </div>

      <ProductGrid>
        {result.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ProductGrid>

      {/* Pagination */}
      {result.totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          {page > 1 && (
            <Button asChild variant="outline">
              <Link 
                href={`/category/${categoryId}?${new URLSearchParams({
                  ...searchParams,
                  page: (page - 1).toString()
                })}`}
              >
                Previous
              </Link>
            </Button>
          )}
          
          <div className="flex items-center space-x-2">
            {Array.from({ length: Math.min(5, result.totalPages) }, (_, i) => {
              const pageNum = i + 1
              const isCurrentPage = pageNum === page
              
              return (
                <Button
                  key={pageNum}
                  asChild
                  variant={isCurrentPage ? 'default' : 'outline'}
                  size="sm"
                >
                  <Link
                    href={`/category/${categoryId}?${new URLSearchParams({
                      ...searchParams,
                      page: pageNum.toString()
                    })}`}
                  >
                    {pageNum}
                  </Link>
                </Button>
              )
            })}
          </div>

          {page < result.totalPages && (
            <Button asChild variant="outline">
              <Link
                href={`/category/${categoryId}?${new URLSearchParams({
                  ...searchParams,
                  page: (page + 1).toString()
                })}`}
              >
                Next
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const category = await getCategoryBySlug(params.slug)

  if (!category) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
          <li><Link href="/" className="hover:text-foreground">Home</Link></li>
          <li>/</li>
          <li><Link href="/products" className="hover:text-foreground">Products</Link></li>
          <li>/</li>
          <li className="text-foreground font-medium">{category.name}</li>
        </ol>
      </nav>

      {/* Category Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {category.name}
            </h1>
            {category.description && (
              <p className="mt-2 text-lg text-muted-foreground">
                {category.description}
              </p>
            )}
          </div>
          <Badge variant="secondary" className="ml-4">
            {category._count?.products || 0} products
          </Badge>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <FilterSidebar categorySlug={params.slug} />
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <Suspense fallback={<ProductGridSkeleton />}>
            <CategoryProducts 
              categoryId={category.id} 
              searchParams={searchParams}
            />
          </Suspense>
        </main>
      </div>
    </div>
  )
}