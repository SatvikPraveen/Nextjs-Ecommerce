// File: app/admin/products/page.tsx
import { Suspense } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter } from 'lucide-react'
import { getProducts } from '@/server/queries/products'
import { ProductsDataTable } from '@/components/products-data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AdminProductsPageProps {
  searchParams: {
    search?: string
    category?: string
    status?: string
    page?: string
  }
}

async function ProductsList({ searchParams }: { searchParams: AdminProductsPageProps['searchParams'] }) {
  const page = parseInt(searchParams.page || '1')
  const search = searchParams.search || ''
  const category = searchParams.category || ''
  const status = searchParams.status || ''

  const result = await getProducts({
    page,
    limit: 20,
    search,
    category,
    status,
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {((page - 1) * 20) + 1}-{Math.min(page * 20, result.total)} of {result.total} products
        </p>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{result.total} total</Badge>
          <Badge variant="secondary">{result.products.filter(p => p.published).length} published</Badge>
          <Badge variant="destructive">{result.products.filter(p => !p.published).length} draft</Badge>
        </div>
      </div>
      
      <ProductsDataTable 
        products={result.products}
        totalPages={result.totalPages}
        currentPage={page}
      />
    </div>
  )
}

export default function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your product catalog
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            defaultValue={searchParams.search}
            className="pl-9"
          />
        </div>
        
        <Select defaultValue={searchParams.category}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            <SelectItem value="electronics">Electronics</SelectItem>
            <SelectItem value="clothing">Clothing</SelectItem>
            <SelectItem value="books">Books</SelectItem>
            <SelectItem value="home">Home & Garden</SelectItem>
            <SelectItem value="sports">Sports</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue={searchParams.status}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          More Filters
        </Button>
      </div>

      {/* Products Table */}
      <div className="rounded-md border bg-white">
        <Suspense fallback={
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading products...</p>
          </div>
        }>
          <ProductsList searchParams={searchParams} />
        </Suspense>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center">
            <div className="w-2 h-8 bg-blue-500 rounded mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold">1,234</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center">
            <div className="w-2 h-8 bg-green-500 rounded mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Published</p>
              <p className="text-2xl font-bold">1,089</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center">
            <div className="w-2 h-8 bg-yellow-500 rounded mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
              <p className="text-2xl font-bold">23</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center">
            <div className="w-2 h-8 bg-red-500 rounded mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
              <p className="text-2xl font-bold">8</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}