// File: app/(store)/products/page.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { getAllProductsPaginated } from '@/server/queries/products';
import { ProductGrid } from '@/components/product-grid';
import { ProductGridSkeleton } from '@/components/product-grid-skeleton';
import { SortSelect } from '@/components/sort-select';
import { FilterSidebar } from '@/components/filter-sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductsPageProps {
  searchParams: Promise<{
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  }>;
}

export const metadata: Metadata = {
  title: 'All Products',
  description: 'Browse our full catalog of products at great prices.',
  openGraph: {
    title: 'All Products',
    description: 'Browse our full catalog of products at great prices.',
    type: 'website',
  },
};

async function ProductsCount({
  searchParams,
}: {
  searchParams: Awaited<ProductsPageProps['searchParams']>;
}) {
  const result = await getAllProductsPaginated({
    page: 1,
    limit: 1,
    minPrice: searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined,
  });

  return (
    <Badge variant="secondary" className="ml-4">
      {result.total || 0} products
    </Badge>
  );
}

async function AllProducts({
  searchParams,
}: {
  searchParams: Awaited<ProductsPageProps['searchParams']>;
}) {
  const page = parseInt(searchParams.page || '1');
  const sort = searchParams.sort || 'newest';
  const minPrice = searchParams.minPrice
    ? parseFloat(searchParams.minPrice)
    : undefined;
  const maxPrice = searchParams.maxPrice
    ? parseFloat(searchParams.maxPrice)
    : undefined;

  const result = await getAllProductsPaginated({
    page,
    limit: 12,
    sort,
    minPrice,
    maxPrice,
  });

  if (!result.products.length) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg text-muted-foreground">No products found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {(page - 1) * 12 + 1}-{Math.min(page * 12, result.total)} of{' '}
          {result.total} products
        </p>
        <SortSelect />
      </div>

      <ProductGrid products={result.products} />

      {/* Pagination */}
      {result.totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          {page > 1 && (
            <Button asChild variant="outline">
              <Link
                href={`/products?${new URLSearchParams({
                  ...searchParams,
                  page: (page - 1).toString(),
                })}`}
              >
                Previous
              </Link>
            </Button>
          )}

          <div className="flex items-center space-x-2">
            {Array.from({ length: Math.min(5, result.totalPages) }, (_, i) => {
              const pageNum = i + 1;
              const isCurrentPage = pageNum === page;

              return (
                <Button
                  key={pageNum}
                  asChild
                  variant={isCurrentPage ? 'default' : 'outline'}
                  size="sm"
                >
                  <Link
                    href={`/products?${new URLSearchParams({
                      ...searchParams,
                      page: pageNum.toString(),
                    })}`}
                  >
                    {pageNum}
                  </Link>
                </Button>
              );
            })}
          </div>

          {page < result.totalPages && (
            <Button asChild variant="outline">
              <Link
                href={`/products?${new URLSearchParams({
                  ...searchParams,
                  page: (page + 1).toString(),
                })}`}
              >
                Next
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default async function ProductsPage(props: ProductsPageProps) {
  const searchParams = await props.searchParams;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
          </li>
          <li>/</li>
          <li className="font-medium text-foreground">Products</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              All Products
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Browse our full catalog
            </p>
          </div>
          <Suspense
            fallback={
              <Badge variant="secondary" className="ml-4">
                Loading...
              </Badge>
            }
          >
            <ProductsCount searchParams={searchParams} />
          </Suspense>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <FilterSidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <Suspense fallback={<ProductGridSkeleton />}>
            <AllProducts searchParams={searchParams} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
