// File: app/admin/layout.tsx
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { hasRole } from '@/lib/roles'
import { AdminNav } from '@/components/admin-nav'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings,
  LogOut
} from 'lucide-react'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user || !hasRole(session.user, 'ADMIN')) {
    redirect('/')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <Link href="/admin" className="text-xl font-bold text-gray-900">
            Admin Panel
          </Link>
        </div>
        
        <nav className="mt-6">
          <div className="px-3 space-y-1">
            <Link
              href="/admin"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
            >
              <LayoutDashboard className="mr-3 h-4 w-4" />
              Dashboard
            </Link>
            
            <Link
              href="/admin/products"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
            >
              <Package className="mr-3 h-4 w-4" />
              Products
            </Link>
            
            <Link
              href="/admin/orders"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
            >
              <ShoppingCart className="mr-3 h-4 w-4" />
              Orders
            </Link>
            
            <Link
              href="/admin/inventory"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
            >
              <Package className="mr-3 h-4 w-4" />
              Inventory
            </Link>
            
            <Link
              href="/admin/customers"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
            >
              <Users className="mr-3 h-4 w-4" />
              Customers
            </Link>
            
            <Link
              href="/admin/settings"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
            >
              <Settings className="mr-3 h-4 w-4" />
              Settings
            </Link>
          </div>
        </nav>

        <div className="absolute bottom-0 w-64 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">
                {session.user.name}
              </p>
              <p className="text-xs text-gray-500">
                {session.user.email}
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/api/auth/signout">
                <LogOut className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <AdminNav />
          </div>
        </header>
        
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}