// lib/roles.ts
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { redirect } from 'next/navigation'

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export const PERMISSIONS = {
  // Product permissions
  PRODUCT_CREATE: 'product:create',
  PRODUCT_READ: 'product:read',
  PRODUCT_UPDATE: 'product:update',
  PRODUCT_DELETE: 'product:delete',
  
  // Order permissions
  ORDER_CREATE: 'order:create',
  ORDER_READ: 'order:read',
  ORDER_UPDATE: 'order:update',
  ORDER_DELETE: 'order:delete',
  ORDER_READ_ALL: 'order:read_all',
  
  // User permissions
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_READ_ALL: 'user:read_all',
  
  // Admin permissions
  ADMIN_ACCESS: 'admin:access',
  ANALYTICS_READ: 'analytics:read',
  SETTINGS_UPDATE: 'settings:update',
} as const

type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

// Role-based permissions mapping
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.USER]: [
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.ORDER_READ,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
  ],
  [Role.ADMIN]: [
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.PRODUCT_UPDATE,
    PERMISSIONS.PRODUCT_DELETE,
    PERMISSIONS.ORDER_READ,
    PERMISSIONS.ORDER_UPDATE,
    PERMISSIONS.ORDER_READ_ALL,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_READ_ALL,
    PERMISSIONS.ADMIN_ACCESS,
    PERMISSIONS.ANALYTICS_READ,
  ],
  [Role.SUPER_ADMIN]: [
    ...Object.values(PERMISSIONS),
  ],
}

// Get current user session
export const getCurrentUser = async () => {
  const session = await getServerSession(authOptions)
  return session?.user
}

// Check if user has specific role
export const hasRole = async (requiredRole: Role) => {
  const user = await getCurrentUser()
  if (!user) return false
  
  const userRole = user.role as Role
  return userRole === requiredRole || userRole === Role.SUPER_ADMIN
}

// Check if user has specific permission
export const hasPermission = async (permission: Permission) => {
  const user = await getCurrentUser()
  if (!user) return false
  
  const userRole = user.role as Role
  const rolePermissions = ROLE_PERMISSIONS[userRole] || []
  
  return rolePermissions.includes(permission)
}

// Check multiple permissions (user must have ALL)
export const hasAllPermissions = async (permissions: Permission[]) => {
  const results = await Promise.all(
    permissions.map(permission => hasPermission(permission))
  )
  return results.every(Boolean)
}

// Check multiple permissions (user must have at least ONE)
export const hasAnyPermission = async (permissions: Permission[]) => {
  const results = await Promise.all(
    permissions.map(permission => hasPermission(permission))
  )
  return results.some(Boolean)
}

// Require authentication
export const requireAuth = async () => {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/signin')
  }
  return user
}

// Require specific role
export const requireRole = async (requiredRole: Role) => {
  const user = await requireAuth()
  const hasRequiredRole = await hasRole(requiredRole)
  
  if (!hasRequiredRole) {
    redirect('/unauthorized')
  }
  
  return user
}

// Require specific permission
export const requirePermission = async (permission: Permission) => {
  const user = await requireAuth()
  const hasRequiredPermission = await hasPermission(permission)
  
  if (!hasRequiredPermission) {
    redirect('/unauthorized')
  }
  
  return user
}

// Admin guard
export const requireAdmin = async () => {
  return await requireRole(Role.ADMIN)
}

// Super admin guard
export const requireSuperAdmin = async () => {
  return await requireRole(Role.SUPER_ADMIN)
}

// Check if user can access admin area
export const canAccessAdmin = async () => {
  return await hasPermission(PERMISSIONS.ADMIN_ACCESS)
}

// Check if user can manage products
export const canManageProducts = async () => {
  return await hasAnyPermission([
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_UPDATE,
    PERMISSIONS.PRODUCT_DELETE,
  ])
}

// Check if user can view all orders
export const canViewAllOrders = async () => {
  return await hasPermission(PERMISSIONS.ORDER_READ_ALL)
}

// Check if user owns resource
export const isResourceOwner = (resourceUserId: string, currentUserId: string) => {
  return resourceUserId === currentUserId
}