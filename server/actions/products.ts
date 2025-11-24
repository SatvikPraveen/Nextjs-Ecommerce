// server/actions/products.ts
'use server';

import prisma from '@/lib/prisma';
import { revalidateTag } from 'next/cache';
import { createProductSchema, updateProductSchema } from '@/lib/validators';
import { requirePermission, PERMISSIONS } from '@/lib/roles';
import {
  uploadImageWithVariants,
  deleteImageWithVariants,
} from '@/lib/uploader';
import { sendLowStockAlert } from '@/lib/emails';
import { redirect } from 'next/navigation';
import type { Product, ProductImage } from '@prisma/client';

export async function createProduct(formData: FormData) {
  try {
    await requirePermission(PERMISSIONS.PRODUCT_CREATE);

    const productData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      compareAtPrice: formData.get('compareAtPrice')
        ? parseFloat(formData.get('compareAtPrice') as string)
        : undefined,
      sku: formData.get('sku') as string,
      inventory: parseInt(formData.get('inventory') as string),
      categoryId: formData.get('categoryId') as string,
      images: JSON.parse(formData.get('images') as string),
      tags: JSON.parse((formData.get('tags') as string) || '[]'),
      status: (formData.get('status') as string) || 'DRAFT',
      weight: formData.get('weight')
        ? parseFloat(formData.get('weight') as string)
        : undefined,
      dimensions: formData.get('dimensions')
        ? JSON.parse(formData.get('dimensions') as string)
        : undefined,
      seoTitle: (formData.get('seoTitle') as string) || undefined,
      seoDescription: (formData.get('seoDescription') as string) || undefined,
    };

    const validatedData = createProductSchema.parse(productData);

    // Generate slug from name
    const slug = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Check if SKU already exists
    const existingSku = await prisma.product.findUnique({
      where: { sku: validatedData.sku },
    });

    if (existingSku) {
      return { success: false, error: 'SKU already exists' };
    }

    // Extract inventory and images since they're relations
    const { inventory, images, ...productCreateData } = validatedData;

    const product = await prisma.product.create({
      data: {
        name: productCreateData.name,
        slug: `${slug}-${Date.now()}`,
        description: productCreateData.description,
        price: productCreateData.price,
        comparePrice: productCreateData.compareAtPrice,
        sku: productCreateData.sku,
        categoryId: productCreateData.categoryId,
        tags: productCreateData.tags || [],
        status: productCreateData.status,
        weight: productCreateData.weight,
        seoTitle: productCreateData.seoTitle,
        seoDescription: productCreateData.seoDescription,
        images: {
          create: (images as string[]).map((url, index) => ({
            url,
            position: index,
            altText: productCreateData.name,
          })),
        },
      },
      include: {
        images: true,
      },
    });

    // Create inventory record for the product
    if (inventory > 0) {
      await prisma.inventory.create({
        data: {
          productId: product.id,
          quantity: inventory,
          available: inventory,
          reserved: 0,
        },
      });
    }

    revalidateTag('products');
    revalidateTag('categories');

    return { success: true, product };
  } catch (error) {
    console.error('Create product error:', error);
    return { success: false, error: 'Failed to create product' };
  }
}

export async function updateProduct(productId: string, formData: FormData) {
  try {
    await requirePermission(PERMISSIONS.PRODUCT_UPDATE);

    const productData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      compareAtPrice: formData.get('compareAtPrice')
        ? parseFloat(formData.get('compareAtPrice') as string)
        : undefined,
      sku: formData.get('sku') as string,
      inventory: parseInt(formData.get('inventory') as string),
      categoryId: formData.get('categoryId') as string,
      images: JSON.parse(formData.get('images') as string),
      tags: JSON.parse((formData.get('tags') as string) || '[]'),
      status: (formData.get('status') as string) || 'DRAFT',
      weight: formData.get('weight')
        ? parseFloat(formData.get('weight') as string)
        : undefined,
      dimensions: formData.get('dimensions')
        ? JSON.parse(formData.get('dimensions') as string)
        : undefined,
      seoTitle: (formData.get('seoTitle') as string) || undefined,
      seoDescription: (formData.get('seoDescription') as string) || undefined,
    };

    const validatedData = updateProductSchema.parse(productData);

    // Check if SKU already exists for other products
    if (validatedData.sku) {
      const existingSku = await prisma.product.findFirst({
        where: {
          sku: validatedData.sku,
          NOT: { id: productId },
        },
      });

      if (existingSku) {
        return { success: false, error: 'SKU already exists' };
      }
    }

    // Extract inventory and images since they're relations
    const { inventory, images, ...productUpdateData } = validatedData;

    // Delete old images if new ones provided
    if (images && (images as string[]).length > 0) {
      await prisma.productImage.deleteMany({
        where: { productId },
      });
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name: productUpdateData.name,
        description: productUpdateData.description,
        price: productUpdateData.price,
        comparePrice: productUpdateData.compareAtPrice,
        sku: productUpdateData.sku,
        categoryId: productUpdateData.categoryId,
        tags: productUpdateData.tags,
        status: productUpdateData.status,
        weight: productUpdateData.weight,
        seoTitle: productUpdateData.seoTitle,
        seoDescription: productUpdateData.seoDescription,
        images:
          images && (images as string[]).length > 0
            ? {
                create: (images as string[]).map((url, index) => ({
                  url,
                  position: index,
                  altText: productUpdateData.name || 'Product image',
                })),
              }
            : undefined,
      },
      include: {
        images: true,
      },
    });

    // Update inventory if provided
    if (inventory !== undefined) {
      const existingInventory = await prisma.inventory.findUnique({
        where: { productId },
      });

      if (existingInventory) {
        await prisma.inventory.update({
          where: { productId },
          data: {
            quantity: inventory,
            available: Math.max(0, inventory - existingInventory.reserved),
          },
        });
      } else {
        await prisma.inventory.create({
          data: {
            productId,
            quantity: inventory,
            available: inventory,
            reserved: 0,
          },
        });
      }
    }

    revalidateTag('products');
    revalidateTag('product');

    return { success: true, product };
  } catch (error) {
    console.error('Update product error:', error);
    return { success: false, error: 'Failed to update product' };
  }
}

export async function deleteProduct(productId: string) {
  try {
    await requirePermission(PERMISSIONS.PRODUCT_DELETE);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });

    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    // Delete product images from storage
    for (const image of product.images) {
      try {
        await deleteImageWithVariants(image.url);
      } catch (error) {
        console.error(`Failed to delete image ${image.url}:`, error);
      }
    }

    // Delete product and associated records
    await prisma.product.delete({
      where: { id: productId },
    });

    revalidateTag('products');
    revalidateTag('categories');

    return { success: true };
  } catch (error) {
    console.error('Delete product error:', error);
    return { success: false, error: 'Failed to delete product' };
  }
}

export async function toggleProductStatus(productId: string) {
  try {
    await requirePermission(PERMISSIONS.PRODUCT_UPDATE);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { status: true },
    });

    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    const newStatus = product.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { status: newStatus },
    });

    revalidateTag('products');
    revalidateTag('product');

    return { success: true, product: updatedProduct };
  } catch (error) {
    console.error('Toggle product status error:', error);
    return { success: false, error: 'Failed to toggle product status' };
  }
}

export async function updateProductInventory(
  productId: string,
  quantity: number,
  operation: 'SET' | 'ADD' | 'SUBTRACT' = 'SET'
) {
  try {
    await requirePermission(PERMISSIONS.PRODUCT_UPDATE);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true },
    });

    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    // Get or create inventory for this product
    let inventory = await prisma.inventory.findUnique({
      where: { productId },
    });

    if (!inventory) {
      inventory = await prisma.inventory.create({
        data: {
          productId,
          quantity: 0,
          available: 0,
          reserved: 0,
        },
      });
    }

    let newQuantity = quantity;
    if (operation === 'ADD') {
      newQuantity = inventory.quantity + quantity;
    } else if (operation === 'SUBTRACT') {
      newQuantity = Math.max(0, inventory.quantity - quantity);
    }

    const updatedInventory = await prisma.inventory.update({
      where: { productId },
      data: {
        quantity: newQuantity,
        available: newQuantity - inventory.reserved,
      },
    });

    // Check if inventory is low (below 10)
    if (updatedInventory.available <= 10 && updatedInventory.available > 0) {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        await sendLowStockAlert(
          adminEmail,
          product.name,
          updatedInventory.available
        );
      }
    }

    revalidateTag('products');
    revalidateTag('inventory');

    return { success: true, inventory: updatedInventory };
  } catch (error) {
    console.error('Update product inventory error:', error);
    return { success: false, error: 'Failed to update product inventory' };
  }
}

export async function bulkUpdateProducts(productIds: string[], updates: any) {
  try {
    await requirePermission(PERMISSIONS.PRODUCT_UPDATE);

    await prisma.product.updateMany({
      where: { id: { in: productIds } },
      data: updates,
    });

    revalidateTag('products');

    return { success: true };
  } catch (error) {
    console.error('Bulk update products error:', error);
    return { success: false, error: 'Failed to bulk update products' };
  }
}

export async function duplicateProduct(productId: string) {
  try {
    await requirePermission(PERMISSIONS.PRODUCT_CREATE);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });

    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    const duplicatedProduct = await prisma.product.create({
      data: {
        name: `${product.name} (Copy)`,
        description: product.description,
        price: product.price,
        comparePrice: product.comparePrice,
        sku: `${product.sku}-copy-${Date.now()}`,
        slug: `${product.slug}-copy-${Date.now()}`,
        categoryId: product.categoryId,
        tags: product.tags,
        status: 'DRAFT',
        weight: product.weight,
        seoTitle: product.seoTitle,
        seoDescription: product.seoDescription,
        images: {
          create: product.images.map((img, index) => ({
            url: img.url,
            altText: img.altText,
            position: index,
          })),
        },
      },
      include: {
        images: true,
      },
    });

    revalidateTag('products');

    return { success: true, product: duplicatedProduct };
  } catch (error) {
    console.error('Duplicate product error:', error);
    return { success: false, error: 'Failed to duplicate product' };
  }
}

export async function uploadProductImages(productId: string, files: FileList) {
  try {
    await requirePermission(PERMISSIONS.PRODUCT_UPDATE);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });

    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    const uploadPromises = Array.from(files).map(async file => {
      const result = await uploadImageWithVariants(file, 'products');
      return result.original.url;
    });

    const imageUrls = await Promise.all(uploadPromises);
    const maxPosition = Math.max(
      ...product.images.map(img => img.position),
      -1
    );

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        images: {
          create: imageUrls.map((url, index) => ({
            url,
            position: maxPosition + 1 + index,
            altText: product.name,
          })),
        },
      },
      include: {
        images: true,
      },
    });

    revalidateTag('products');
    revalidateTag('product');

    return { success: true, product: updatedProduct };
  } catch (error) {
    console.error('Upload product images error:', error);
    return { success: false, error: 'Failed to upload product images' };
  }
}

export async function deleteProductImage(productId: string, imageId: string) {
  try {
    await requirePermission(PERMISSIONS.PRODUCT_UPDATE);

    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
    });

    if (!image || image.productId !== productId) {
      return { success: false, error: 'Image not found' };
    }

    try {
      await deleteImageWithVariants(image.url);
    } catch (error) {
      console.error(`Failed to delete image from storage:`, error);
    }

    await prisma.productImage.delete({
      where: { id: imageId },
    });

    revalidateTag('products');
    revalidateTag('product');

    return { success: true };
  } catch (error) {
    console.error('Delete product image error:', error);
    return { success: false, error: 'Failed to delete product image' };
  }
}
