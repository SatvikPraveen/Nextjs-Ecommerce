// File: app/admin/inventory/page.tsx
import { Suspense } from 'react'
import { Search, Filter, AlertTriangle, TrendingUp, Package } from 'lucide-react'
import { getInventoryData } from '@/server/queries/inventory'
import { InventoryDataTable } from '@/components/inventory-data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AdminInventoryPageProps {
  searchParams: {
    search?: string
    category?: string
    stockLevel?: string
    page?: string
  }
}

async function InventoryList({ searchParams }: { searchParams: AdminInventoryPageProps['searchParams'] }) {
  const page = parseInt(searchParams.page || '1')
  const search = searchParams.search || ''
  const category = searchParams.category || ''
  const stockLevel = searchParams.stockLevel || ''

  const result = await getInventoryData({
    page,
    limit: 20,
    search,
    category,
    stockLevel,
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {((page - 1) * 20) + 1}-{Math.min(page * 20, result.total)} of {result.total} items
        </p>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{result.total} items</Badge>
          <Badge variant="destructive">{result.lowStockCount} low stock</Badge>
          <Badge className="bg-red-100 text-red-800">{result.outOfStockCount} out of stock</Badge>
        </div>
      </div>
      
      <InventoryDataTable 
        inventory={result.items}
        totalPages={result.totalPages}
        currentPage={page}
      />
    </div>
  )
}

export default function AdminInventoryPage({ searchParams }: AdminInventoryPageProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">
            Monitor stock levels and manage inventory
          </p>
        </div>
        <Button>
          Update Stock
        </Button>
      </div>

      {/* Alerts */}
      <div className="space-y-4">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Low Stock Alert</AlertTitle>
          <AlertDescription className="text-red-700">
            You have 23 products with low stock levels that need attention.
          </AlertDescription>
        </Alert>
        
        <Alert className="border-yellow-200 bg-yellow-50">
          <Package className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Reorder Suggestions</AlertTitle>
          <AlertDescription className="text-yellow-700">
            8 products are recommended for reordering based on sales velocity.
          </AlertDescription>
        </Alert>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search inventory..."
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

        <Select defaultValue={searchParams.stockLevel}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Stock Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Levels</SelectItem>
            <SelectItem value="in-stock">In Stock</SelectItem>
            <SelectItem value="low-stock">Low Stock</SelectItem>
            <SelectItem value="out-of-stock">Out of Stock</SelectItem>
            <SelectItem value="overstock">Overstock</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          More Filters
        </Button>
      </div>

      {/* Inventory Table */}
      <div className="rounded-md border bg-white">
        <Suspense fallback={
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading inventory...</p>
          </div>
        }>
          <InventoryList searchParams={searchParams} />
        </Suspense>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold">1,234</p>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600">23</p>
              <p className="text-xs text-muted-foreground">Needs attention</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">8</p>
              <p className="text-xs text-muted-foreground">Critical</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold">$486K</p>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8.2%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}