// server/actions/products.ts
'use server'

import prisma from '@/lib/prisma'
import { revalidateTag } from 'next/cache'
import { createProductSchema, updateProductSchema } from '@/lib/validators'
import { requirePermission, PERMISSIONS } from '@/lib/roles'
import { uploadImageWithVariants, deleteImageWithVariants } from '@/lib/uploader'
import { sendLowStockAlert } from '@/lib/emails'
import { redirect } from 'next/navigation'

export async function createProduct(formData: FormData) {
  try {
    await requirePermission(PERMISSIONS.PRODUCT_CREATE)

    const productData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      compareAtPrice: formData.get('compareAtPrice') ? parseFloat(formData.get('compareAtPrice') as string) : undefined,
      sku: formData.get('sku') as string,
      inventory: parseInt(formData.get('inventory') as string),
      categoryId: formData.get('categoryId') as string,
      images: JSON.parse(formData.get('images') as string),
      tags: JSON.parse(formData.get('tags') as string || '[]'),
      isActive: formData.get('isActive') === 'true',
      isFeatured: formData.get('isFeatured') === 'true',
      weight: formData.get('weight') ? parseFloat(formData.get('weight') as string) : undefined,
      dimensions: formData.get('dimensions') ? JSON.parse(formData.get('dimensions') as string) : undefined,
      seoTitle: formData.get('seoTitle') as string || undefined,
      seoDescription: formData.get('seoDescription') as string || undefined,
    }

    const validatedData = createProductSchema.parse(productData)

    // Generate slug from name
    const slug = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    // Check if SKU already exists
    const existingSku = await prisma.product.findUnique({
      where: { sku: validatedData.sku },
    })

    if (existingSku) {
      return { success: false, error: 'SKU already exists' }
    }

    const product = await prisma.product.create({
      data: {
        ...validatedData,
        slug: `${slug}-${Date.now()}`,
        tags: validatedData.tags || [],
      },
    })

    revalidateTag('products')
    revalidateTag('categories')
    
    return { success: true, product }
  } catch (error) {
    console.error('Create product error:', error)
    return { success: false, error: 'Failed to create product' }
  }
}

export async function updateProduct(productId: string, formData: FormData) {
  try {
    await requirePermission(PERMISSIONS.PRODUCT_UPDATE)

    const productData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      compareAtPrice: formData.get('compareAtPrice') ? parseFloat(formData.get('compareAtPrice') as string) : undefined,
      sku: formData.get('sku') as string,
      inventory: parseInt(formData.get('inventory') as string),
      categoryId: formData.get('categoryId') as string,
      images: JSON.parse(formData.get('images') as string),
      tags: JSON.parse(formData.get('tags') as string || '[]'),
      isActive: formData.get('isActive') === 'true',
      isFeatured: formData.get('isFeatured') === 'true',
      weight: formData.get('weight') ? parseFloat(formData.get('weight') as string) : undefined,
      dimensions: formData.get('dimensions') ? JSON.parse(formData.get('dimensions') as string) : undefined,
      seoTitle: formData.get('seoTitle') as string || undefined,
      seoDescription: formData.get('seoDescription') as string || undefined,
    }

    const validatedData = updateProductSchema.parse(productData)

    // Check if SKU already exists for other products
    if (validatedData.sku) {
      const existingSku = await prisma.product.findFirst({
        where: { 
          sku: validatedData.sku,
          NOT: { id: productId }
        },
      })

      if (existingSku) {
        return { success: false, error: 'SKU already exists' }
      }
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: validatedData,
    })

    revalidateTag('products')
    revalidateTag('product')
    
    return { success: true, product }
  } catch (error) {
    console.error('Update product error:', error)
    return { success: false, error: 'Failed to update product' }
  }
}

export async function deleteProduct(productId: string) {
  try {
    await requirePermission(PERMISSIONS.PRODUCT_DELETE)

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { images: true },
    })

    if (!product) {
      return { success: false, error: 'Product not found' }
    }

    // Delete product images
    for (const imageUrl of product.images) {
      try {
        await deleteImageWithVariants(imageUrl)
      } catch (error) {
        console.error('Failed to delete image:', error)
      }
    }

    // Delete product
    await prisma.product.delete({
      where: { id: productId },
    })

    revalidateTag('products')
    revalidateTag('categories')
    
    return { success: true }
  } catch (error) {
    console.error('Delete product error:', error)
    return { success: false, error: 'Failed to delete product' }
  }
}

export async function updateProductImages(productId: string, images: string[]) {
  try {
    await requirePermission(PERMISSIONS.PRODUCT_UPDATE)

    const product = await prisma.product.update({
      where: { id: productId },
      data: { images },
    })

    revalidateTag('products')
    revalidateTag('product')
    
    return { success: true, product }
  } catch (error) {
    console.error('Update product images error:', error)
    return { success: false, error: 'Failed to update product images' }
  }
}

export async function toggleProductStatus(productId: string) {
  try {
    await requirePermission(PERMISSIONS.PRODUCT_UPDATE)

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { isActive: true },
    })

    if (!product) {
      return { success: false, error: 'Product not found' }
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { isActive: !product.isActive },
    })

    revalidateTag('products')
    revalidateTag('product')
    
    return { success: true, product: updatedProduct }
  } catch (error) {
    console.error('Toggle product status error:', error)
    return { success: false, error: 'Failed to toggle product status' }
  }
}

export async function toggleProductFeatured(productId: string) {
  try {
    await requirePermission(PERMISSIONS.PRODUCT_UPDATE)

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { isFeatured: true },
    })

    if (!product) {
      return { success: false, error: 'Product not found' }
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { isFeatured: !product.isFeatured },
    })

    revalidateTag('products')
    revalidateTag('product')
    
    return { success: true, product: updatedProduct }
  } catch (error) {
    console.error('Toggle product featured error:', error)
    return { success: false, error: 'Failed to toggle product featured status' }
  }
}

export async function updateProductInventory(productId: string, quantity: number, operation: 'SET' | 'ADD' | 'SUBTRACT' = 'SET') {
  try {
    await requirePermission(PERMISSIONS.PRODUCT_UPDATE)

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { inventory: true, name: true },
    })

    if (!product) {
      return { success: false, error: 'Product not found' }
    }

    let newQuantity = quantity
    if (operation === 'ADD') {
      newQuantity = product.inventory + quantity
    } else if (operation === 'SUBTRACT') {
      newQuantity = Math.max(0, product.inventory - quantity)
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { inventory: newQuantity },
    })

    // Check if inventory is low (below 10)
    if (newQuantity <= 10 && newQuantity > 0) {
      const adminEmail = process.env.ADMIN_EMAIL
      if (adminEmail) {
        await sendLowStockAlert(adminEmail, product.name, newQuantity)
      }
    }

    revalidateTag('products')
    revalidateTag('inventory')
    
    return { success: true, product: updatedProduct }
  } catch (error) {
    console.error('Update product inventory error:', error)
    return { success: false, error: 'Failed to update product inventory' }
  }
}

export async function bulkUpdateProducts(productIds: string[], updates: any) {
  try {
    await requirePermission(PERMISSIONS.PRODUCT_UPDATE)

    await prisma.product.updateMany({
      where: { id: { in: productIds } },
      data: updates,
    })

    revalidateTag('products')
    
    return { success: true }
  } catch (error) {
    console.error('Bulk update products error:', error)
    return { success: false, error: 'Failed to bulk update products' }
  }
}

export async function duplicateProduct(productId: string) {
  try {
    await requirePermission(PERMISSIONS.PRODUCT_CREATE)

    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return { success: false, error: 'Product not found' }
    }

    const duplicatedProduct = await prisma.product.create({
      data: {
        name: `${product.name} (Copy)`,
        description: product.description,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        sku: `${product.sku}-copy-${Date.now()}`,
        slug: `${product.slug}-copy-${Date.now()}`,
        inventory: 0,
        categoryId: product.categoryId,
        images: product.images,
        tags: product.tags,
        isActive: false,
        isFeatured: false,
        weight: product.weight,
        dimensions: product.dimensions,
        seoTitle: product.seoTitle,
        seoDescription: product.seoDescription,
      },
    })

    revalidateTag('products')
    
    return { success: true, product: duplicatedProduct }
  } catch (error) {
    console.error('Duplicate product error:', error)
    return { success: false, error: 'Failed to duplicate product' }
  }
}

export async function uploadProductImages(productId: string, files: FileList) {
  try {
    await requirePermission(PERMISSIONS.PRODUCT_UPDATE)

    const uploadPromises = Array.from(files).map(async (file) => {
      const result = await uploadImageWithVariants(file, 'products')
      return result.original.url
    })

    const imageUrls = await Promise.all(uploadPromises)

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { images: true },
    })

    if (!product) {
      return { success: false, error: 'Product not found' }
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { images: [...product.images, ...imageUrls] },
    })

    revalidateTag('products')
    revalidateTag('product')
    
    return { success: true, product: updatedProduct }
  } catch (error) {
    console.error('Upload product images error:', error)
    return { success: false, error: 'Failed to upload product images' }
  }
}