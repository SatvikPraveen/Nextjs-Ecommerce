// Location: prisma/seed.ts

import { PrismaClient, ProductStatus, UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = await hash('admin123', 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin User',
      role: UserRole.ADMIN,
    },
  });

  console.log(`👤 Created admin user: ${admin.email}`);

  // Create test customer
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      name: 'John Doe',
      role: UserRole.USER,
    },
  });

  console.log(`👤 Created customer: ${customer.email}`);

  // Create categories
  const electronicsCategory = await prisma.category.create({
    data: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and gadgets',
      image: '/images/categories/electronics.jpg',
    },
  });

  const clothingCategory = await prisma.category.create({
    data: {
      name: 'Clothing',
      slug: 'clothing',
      description: 'Fashion and apparel',
      image: '/images/categories/clothing.jpg',
    },
  });

  const homeCategory = await prisma.category.create({
    data: {
      name: 'Home & Garden',
      slug: 'home-garden',
      description: 'Home improvement and garden supplies',
      image: '/images/categories/home.jpg',
    },
  });

  console.log('📂 Created categories');

  // Create subcategories
  const smartphonesCategory = await prisma.category.create({
    data: {
      name: 'Smartphones',
      slug: 'smartphones',
      description: 'Latest smartphones and mobile devices',
      parentId: electronicsCategory.id,
    },
  });

  const laptopsCategory = await prisma.category.create({
    data: {
      name: 'Laptops',
      slug: 'laptops',
      description: 'Laptops and notebooks',
      parentId: electronicsCategory.id,
    },
  });

  const mensClothingCategory = await prisma.category.create({
    data: {
      name: "Men's Clothing",
      slug: 'mens-clothing',
      description: 'Clothing for men',
      parentId: clothingCategory.id,
    },
  });

  console.log('📂 Created subcategories');

  // Create products
  const products = [
    {
      name: 'iPhone 15 Pro',
      slug: 'iphone-15-pro',
      description: 'Latest iPhone with advanced camera system',
      content: 'The iPhone 15 Pro features a titanium design, advanced camera system, and A17 Pro chip.',
      price: 999.99,
      comparePrice: 1099.99,
      costPrice: 750.00,
      categoryId: smartphonesCategory.id,
      status: ProductStatus.PUBLISHED,
      sku: 'IPH15PRO-128-NT',
      tags: ['smartphone', 'apple', 'ios', 'premium'],
      seoTitle: 'iPhone 15 Pro - Premium Smartphone | Your Store',
      seoDescription: 'Get the latest iPhone 15 Pro with titanium design and advanced camera system.',
    },
    {
      name: 'MacBook Air M2',
      slug: 'macbook-air-m2',
      description: 'Lightweight laptop with M2 chip',
      content: 'The MacBook Air with M2 chip delivers incredible performance in a thin and light design.',
      price: 1199.99,
      comparePrice: 1299.99,
      costPrice: 900.00,
      categoryId: laptopsCategory.id,
      status: ProductStatus.PUBLISHED,
      sku: 'MBA-M2-256-SG',
      tags: ['laptop', 'apple', 'macos', 'm2'],
      seoTitle: 'MacBook Air M2 - Ultra-thin Laptop | Your Store',
      seoDescription: 'Experience incredible performance with the MacBook Air M2.',
    },
    {
      name: 'Samsung Galaxy S24',
      slug: 'samsung-galaxy-s24',
      description: 'Flagship Android smartphone',
      content: 'The Galaxy S24 features AI-powered camera, long-lasting battery, and stunning display.',
      price: 899.99,
      comparePrice: 999.99,
      costPrice: 650.00,
      categoryId: smartphonesCategory.id,
      status: ProductStatus.PUBLISHED,
      sku: 'SGS24-256-PH',
      tags: ['smartphone', 'samsung', 'android', 'galaxy'],
      seoTitle: 'Samsung Galaxy S24 - AI-Powered Smartphone | Your Store',
      seoDescription: 'Discover the Samsung Galaxy S24 with AI-powered features.',
    },
    {
      name: 'Premium Cotton T-Shirt',
      slug: 'premium-cotton-tshirt',
      description: 'Comfortable and stylish cotton t-shirt',
      content: 'Made from 100% organic cotton, this t-shirt offers comfort and style.',
      price: 29.99,
      comparePrice: 39.99,
      costPrice: 15.00,
      categoryId: mensClothingCategory.id,
      status: ProductStatus.PUBLISHED,
      sku: 'TSHIRT-COT-M-BLU',
      tags: ['clothing', 'cotton', 'casual', 'organic'],
      seoTitle: 'Premium Cotton T-Shirt - Organic & Comfortable | Your Store',
      seoDescription: 'Shop our premium organic cotton t-shirt for ultimate comfort.',
    },
    {
      name: 'Wireless Headphones',
      slug: 'wireless-headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      content: 'Experience superior sound quality with active noise cancellation and 30-hour battery life.',
      price: 199.99,
      comparePrice: 249.99,
      costPrice: 120.00,
      categoryId: electronicsCategory.id,
      status: ProductStatus.PUBLISHED,
      sku: 'WH-NC-BLK-BT',
      tags: ['headphones', 'wireless', 'bluetooth', 'noise-cancelling'],
      seoTitle: 'Wireless Noise-Cancelling Headphones | Your Store',
      seoDescription: 'Premium wireless headphones with active noise cancellation.',
    },
  ];

  for (const productData of products) {
    const product = await prisma.product.create({
      data: productData,
    });

    // Create product images
    await prisma.productImage.createMany({
      data: [
        {
          productId: product.id,
          url: '/images/placeholder.svg',
          altText: `${product.name} - Main Image`,
          position: 0,
        },
        {
          productId: product.id,
          url: '/images/placeholder.svg',
          altText: `${product.name} - Secondary Image`,
          position: 1,
        },
      ],
    });

    // Create inventory
    await prisma.inventory.create({
      data: {
        productId: product.id,
        quantity: Math.floor(Math.random() * 100) + 10,
        reserved: 0,
        available: Math.floor(Math.random() * 100) + 10,
      },
    });

    // Create product variants for some products
    if (product.slug === 'iphone-15-pro') {
      await prisma.productVariant.createMany({
        data: [
          { productId: product.id, name: 'Storage', value: '128GB', position: 0 },
          { productId: product.id, name: 'Storage', value: '256GB', price: 100, position: 1 },
          { productId: product.id, name: 'Storage', value: '512GB', price: 300, position: 2 },
          { productId: product.id, name: 'Color', value: 'Natural Titanium', position: 0 },
          { productId: product.id, name: 'Color', value: 'Blue Titanium', position: 1 },
          { productId: product.id, name: 'Color', value: 'White Titanium', position: 2 },
        ],
      });
    }

    if (product.slug === 'premium-cotton-tshirt') {
      await prisma.productVariant.createMany({
        data: [
          { productId: product.id, name: 'Size', value: 'S', position: 0 },
          { productId: product.id, name: 'Size', value: 'M', position: 1 },
          { productId: product.id, name: 'Size', value: 'L', position: 2 },
          { productId: product.id, name: 'Size', value: 'XL', price: 5, position: 3 },
          { productId: product.id, name: 'Color', value: 'Blue', position: 0 },
          { productId: product.id, name: 'Color', value: 'Black', position: 1 },
          { productId: product.id, name: 'Color', value: 'White', position: 2 },
        ],
      });
    }

    console.log(`📦 Created product: ${product.name}`);
  }

  // Create sample reviews
  const products = await prisma.product.findMany({ take: 3 });
  
  for (const product of products) {
    await prisma.review.create({
      data: {
        rating: 5,
        title: 'Excellent product!',
        content: 'Really happy with this purchase. Great quality and fast shipping.',
        verified: true,
        userId: customer.id,
        productId: product.id,
      },
    });
  }

  console.log('⭐ Created sample reviews');

  // Create sample cart items
  const sampleProducts = await prisma.product.findMany({ take: 2 });
  
  for (const product of sampleProducts) {
    await prisma.cartItem.create({
      data: {
        quantity: Math.floor(Math.random() * 3) + 1,
        userId: customer.id,
        productId: product.id,
      },
    });
  }

  console.log('🛒 Created sample cart items');

  // Create sample orders
  const orderProducts = await prisma.product.findMany({ take: 2 });
  const orderTotal = orderProducts.reduce((sum, p) => sum + Number(p.price), 0);

  const order = await prisma.order.create({
    data: {
      orderNumber: 'ORD-' + Date.now(),
      subtotal: orderTotal,
      tax: orderTotal * 0.08, // 8% tax
      shipping: 9.99,
      total: orderTotal + (orderTotal * 0.08) + 9.99,
      customerEmail: customer.email,
      customerPhone: '+1234567890',
      shippingName: customer.name || 'John Doe',
      shippingAddress: '123 Main St',
      shippingCity: 'New York',
      shippingState: 'NY',
      shippingZip: '10001',
      shippingCountry: 'US',
      userId: customer.id,
    },
  });

  // Create order items
  for (const product of orderProducts) {
    await prisma.orderItem.create({
      data: {
        quantity: 1,
        price: product.price,
        productName: product.name,
        productSku: product.sku,
        orderId: order.id,
        productId: product.id,
      },
    });
  }

  console.log(`📋 Created sample order: ${order.orderNumber}`);

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`👤 Users: ${await prisma.user.count()}`);
  console.log(`📂 Categories: ${await prisma.category.count()}`);
  console.log(`📦 Products: ${await prisma.product.count()}`);
  console.log(`📋 Orders: ${await prisma.order.count()}`);
  console.log(`⭐ Reviews: ${await prisma.review.count()}`);
  console.log('\n🔐 Admin Login:');
  console.log(`Email: ${adminEmail}`);
  console.log('Password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });