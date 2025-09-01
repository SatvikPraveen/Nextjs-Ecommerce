// File: app/admin/orders/page.tsx
import { Suspense } from 'react'
import { Search, Filter, Download } from 'lucide-react'
import { getOrders } from '@/server/queries/orders'
import { OrdersDataTable } from '@/components/orders-data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatPrice } from '@/lib/utils'

interface AdminOrdersPageProps {
  searchParams: {
    search?: string
    status?: string
    dateFrom?: string
    dateTo?: string
    page?: string
  }
}

async function OrdersList({ searchParams }: { searchParams: AdminOrdersPageProps['searchParams'] }) {
  const page = parseInt(searchParams.page || '1')
  const search = searchParams.search || ''
  const status = searchParams.status || ''
  const dateFrom = searchParams.dateFrom ? new Date(searchParams.dateFrom) : undefined
  const dateTo = searchParams.dateTo ? new Date(searchParams.dateTo) : undefined

  const result = await getOrders({
    page,
    limit: 20,
    search,
    status,
    dateFrom,
    dateTo,
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {((page - 1) * 20) + 1}-{Math.min(page * 20, result.total)} of {result.total} orders
        </p>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{result.total} total</Badge>
          <Badge className="bg-yellow-100 text-yellow-800">{result.orders.filter(o => o.status === 'PENDING').length} pending</Badge>
          <Badge className="bg-blue-100 text-blue-800">{result.orders.filter(o => o.status === 'PROCESSING').length} processing</Badge>
        </div>
      </div>
      
      <OrdersDataTable 
        orders={result.orders}
        totalPages={result.totalPages}
        currentPage={page}
      />
    </div>
  )
}

export default function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage customer orders and fulfillment
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            defaultValue={searchParams.search}
            className="pl-9"
          />
        </div>
        
        <Select defaultValue={searchParams.status}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PROCESSING">Processing</SelectItem>
            <SelectItem value="SHIPPED">Shipped</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <DatePickerWithRange />

        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          More Filters
        </Button>
      </div>

      {/* Orders Table */}
      <div className="rounded-md border bg-white">
        <Suspense fallback={
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading orders...</p>
          </div>
        }>
          <OrdersList searchParams={searchParams} />
        </Suspense>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center">
            <div className="w-2 h-8 bg-blue-500 rounded mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold">2,847</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center">
            <div className="w-2 h-8 bg-yellow-500 rounded mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">42</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center">
            <div className="w-2 h-8 bg-purple-500 rounded mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Processing</p>
              <p className="text-2xl font-bold">128</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center">
            <div className="w-2 h-8 bg-green-500 rounded mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">2,651</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center">
            <div className="w-2 h-8 bg-gray-500 rounded mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Revenue</p>
              <p className="text-2xl font-bold">{formatPrice(284750)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}