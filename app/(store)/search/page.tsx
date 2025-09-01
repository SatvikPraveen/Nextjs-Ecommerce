// File: app/(store)/search/page.tsx
import { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { Search, X } from 'lucide-react'
import { searchProducts } from '@/server/queries/products'
import { ProductCard } from '@/components/product-card'
import { ProductGrid } from '@/components/product-grid'
import { ProductGridSkeleton } from '@/components/product-grid-skeleton'
import { SortSelect } from '@/components/sort-select'
import { FilterSidebar } from '@/components/filter-sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface SearchPageProps {
  searchParams: {
    q?: string
    sort?: string
    category?: string
    minPrice?: string
    maxPrice?: string
    page?: string
  }
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const query = searchParams.q || ''
  
  if (!query) {
    return {
      title: 'Search Products',
      description: 'Search through our product catalog to find exactly what you need.',
    }
  }

  return {
    title: `Search results for "${query}"`,
    description: `Find products matching "${query}". Browse our search results and discover great deals.`,
    openGraph: {
      title: `Search: ${query}`,
      description: `Search results for "${query}"`,
      type: 'website',
    },
  }
}

async function SearchResults({ searchParams }: { searchParams: SearchPageProps['searchParams'] }) {
  const query = searchParams.q || ''
  const page = parseInt(searchParams.page || '1')
  const sort = searchParams.sort || 'relevance'
  const categoryFilter = searchParams.category
  const minPrice = searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined
  const maxPrice = searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined

  if (!query.trim()) {
    return (
      <div className="text-center py-16">
        <Search className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Start your search</h2>
        <p className="text-muted-foreground mb-6">
          Enter a keyword to find products that match your needs
        </p>
        <div className="max-w-md mx-auto">
          <form action="/search" method="get">
            <div className="flex gap-2">
              <Input
                name="q"
                placeholder="Search for products..."
                className="flex-1"
                autoFocus
              />
              <Button type="submit">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  const result = await searchProducts({
    query,
    page,
    limit: 12,
    sort: sort as any,
    categoryFilter,
    minPrice,
    maxPrice,
  })

  if (!result.products.length) {
    return (
      <div className="text-center py-16">
        <Search className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">No results found</h2>
        <p className="text-muted-foreground mb-6">
          We couldn't find any products matching "{query}". Try adjusting your search terms.
        </p>
        <div className="space-y-4">
          <div className="max-w-md mx-auto">
            <form action="/search" method="get">
              <div className="flex gap-2">
                <Input
                  name="q"
                  placeholder="Try a different search..."
                  className="flex-1"
                  defaultValue={query}
                />
                <Button type="submit">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
          <Button asChild variant="outline">
            <Link href="/products">Browse All Products</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {((page - 1) * 12) + 1}-{Math.min(page * 12, result.total)} of {result.total} results for "{query}"
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
                href={`/search?${new URLSearchParams({
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
                    href={`/search?${new URLSearchParams({
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
                href={`/search?${new URLSearchParams({
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

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ''

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Search Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Search Products
          </h1>
        </div>

        {/* Search Bar */}
        <form action="/search" method="get" className="mb-6">
          <div className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Input
                name="q"
                placeholder="Search for products..."
                defaultValue={query}
                className="pr-10"
              />
              {query && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => {
                    const form = document.querySelector('form') as HTMLFormElement
                    const input = form?.querySelector('input[name="q"]') as HTMLInputElement
                    if (input) {
                      input.value = ''
                      form.submit()
                    }
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </form>

        {/* Active Filters */}
        {(query || searchParams.category || searchParams.minPrice || searchParams.maxPrice) && (
          <div className="flex flex-wrap gap-2">
            {query && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: {query}
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                >
                  <Link href="/search">
                    <X className="h-3 w-3" />
                  </Link>
                </Button>
              </Badge>
            )}
            {searchParams.category && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Category: {searchParams.category}
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                >
                  <Link
                    href={`/search?${new URLSearchParams({
                      ...searchParams,
                      category: ''
                    })}`}
                  >
                    <X className="h-3 w-3" />
                  </Link>
                </Button>
              </Badge>
            )}
            {(searchParams.minPrice || searchParams.maxPrice) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Price: ${searchParams.minPrice || '0'} - ${searchParams.maxPrice || '∞'}
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                >
                  <Link
                    href={`/search?${new URLSearchParams({
                      ...searchParams,
                      minPrice: '',
                      maxPrice: ''
                    })}`}
                  >
                    <X className="h-3 w-3" />
                  </Link>
                </Button>
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <FilterSidebar searchQuery={query} />
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <Suspense fallback={<ProductGridSkeleton />}>
            <SearchResults searchParams={searchParams} />
          </Suspense>
        </main>
      </div>
    </div>
  )
}