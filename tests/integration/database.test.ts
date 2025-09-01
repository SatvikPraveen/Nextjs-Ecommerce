// tests/integration/database.test.ts

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Reset database to clean state
  execSync('npx prisma migrate reset --force --skip-seed', { stdio: 'inherit' });
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean all tables before each test
  const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ');

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  } catch (error) {
    console.log({ error });
  }
});

describe('Product Database Operations', () => {
  it('should create a product', async () => {
    // First create a category
    const category = await prisma.category.create({
      data: {
        name: 'Electronics',
        slug: 'electronics',
      },
    });

    const productData = {
      name: 'Test Product',
      slug: 'test-product',
      description: 'A test product',
      price: 29.99,
      categoryId: category.id,
      images: ['test.jpg'],
      inStock: true,
    };

    const product = await prisma.product.create({
      data: productData,
    });

    expect(product).toMatchObject({
      name: 'Test Product',
      slug: 'test-product',
      price: 29.99,
      inStock: true,
    });
    expect(product.id).toBeDefined();
    expect(product.createdAt).toBeDefined();
  });

  it('should find products by category', async () => {
    // Create category
    const category = await prisma.category.create({
      data: {
        name: 'Electronics',
        slug: 'electronics',
      },
    });

    // Create products
    await prisma.product.createMany({
      data: [
        {
          name: 'Product 1',
          slug: 'product-1',
          description: 'First product',
          price: 29.99,
          categoryId: category.id,
          images: ['product1.jpg'],
          inStock: true,
        },
        {
          name: 'Product 2',
          slug: 'product-2',
          description: 'Second product',
          price: 39.99,
          categoryId: category.id,
          images: ['product2.jpg'],
          inStock: true,
        },
      ],
    });

    const products = await prisma.product.findMany({
      where: { categoryId: category.id },
      include: { category: true },
    });

    expect(products).toHaveLength(2);
    expect(products[0].category.name).toBe('Electronics');
    expect(products[1].category.name).toBe('Electronics');
  });

  it('should search products by name and description', async () => {
    const category = await prisma.category.create({
      data: {
        name: 'Electronics',
        slug: 'electronics',
      },
    });

    await prisma.product.createMany({
      data: [
        {
          name: 'iPhone 15',
          slug: 'iphone-15',
          description: 'Latest smartphone from Apple',
          price: 999.99,
          categoryId: category.id,
          images: ['iphone.jpg'],
          inStock: true,
        },
        {
          name: 'Samsung Galaxy',
          slug: 'samsung-galaxy',
          description: 'Android smartphone with great camera',
          price: 799.99,
          categoryId: category.id,
          images: ['samsung.jpg'],
          inStock: true,
        },
      ],
    });

    // Search by name
    const phoneResults = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'iPhone', mode: 'insensitive' } },
          { description: { contains: 'iPhone', mode: 'insensitive' } },
        ],
      },
    });

    expect(phoneResults).toHaveLength(1);
    expect(phoneResults[0].name).toBe('iPhone 15');

    // Search by description
    const smartphoneResults = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'smartphone', mode: 'insensitive' } },
          { description: { contains: 'smartphone', mode: 'insensitive' } },
        ],
      },
    });

    expect(smartphoneResults).toHaveLength(2);
  });

  it('should update product stock status', async () => {
    const category = await prisma.category.create({
      data: {
        name: 'Electronics',
        slug: 'electronics',
      },
    });

    const product = await prisma.product.create({
      data: {
        name: 'Test Product',
        slug: 'test-product',
        description: 'A test product',
        price: 29.99,
        categoryId: category.id,
        images: ['test.jpg'],
        inStock: true,
      },
    });

    // Update stock status
    const updatedProduct = await prisma.product.update({
      where: { id: product.id },
      data: { inStock: false },
    });

    expect(updatedProduct.inStock).toBe(false);

    // Verify in database
    const fetchedProduct = await prisma.product.findUnique({
      where: { id: product.id },
    });

    expect(fetchedProduct?.inStock).toBe(false);
  });
});

describe('Order Database Operations', () => {
  let user: any;
  let product: any;
  let category: any;

  beforeEach(async () => {
    // Create test data
    category = await prisma.category.create({
      data: {
        name: 'Electronics',
        slug: 'electronics',
      },
    });

    user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        role: 'customer',
      },
    });

    product = await prisma.product.create({
      data: {
        name: 'Test Product',
        slug: 'test-product',
        description: 'A test product',
        price: 29.99,
        categoryId: category.id,
        images: ['test.jpg'],
        inStock: true,
      },
    });
  });

  it('should create an order with items', async () => {
    const orderData = {
      userId: user.id,
      total: 59.98,
      status: 'pending' as const,
      shippingAddress: {
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'US',
      },
      items: {
        create: [
          {
            productId: product.id,
            quantity: 2,
            price: 29.99,
          },
        ],
      },
    };

    const order = await prisma.order.create({
      data: orderData,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });

    expect(order).toMatchObject({
      userId: user.id,
      total: 59.98,
      status: 'pending',
    });
    expect(order.items).toHaveLength(1);
    expect(order.items[0].quantity).toBe(2);
    expect(order.items[0].product.name).toBe('Test Product');
    expect(order.user.email).toBe('test@example.com');
  });

  it('should find orders by user', async () => {
    // Create multiple orders
    await prisma.order.createMany({
      data: [
        {
          userId: user.id,
          total: 29.99,
          status: 'completed',
          shippingAddress: {
            firstName: 'John',
            lastName: 'Doe',
            address: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'US',
          },
        },
        {
          userId: user.id,
          total: 49.99,
          status: 'pending',
          shippingAddress: {
            firstName: 'John',
            lastName: 'Doe',
            address: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'US',
          },
        },
      ],
    });

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    expect(orders).toHaveLength(2);
    expect(orders[0].total).toBe(49.99); // Most recent first
    expect(orders[1].total).toBe(29.99);
  });

  it('should update order status', async () => {
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        total: 29.99,
        status: 'pending',
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'US',
        },
      },
    });

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'shipped' },
    });

    expect(updatedOrder.status).toBe('shipped');
  });

  it('should calculate order totals correctly', async () => {
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        total: 0, // Will be calculated
        status: 'pending',
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'US',
        },
        items: {
          create: [
            {
              productId: product.id,
              quantity: 2,
              price: 29.99,
            },
          ],
        },
      },
      include: {
        items: true,
      },
    });

    // Calculate total from items
    const calculatedTotal = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Update order with calculated total
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { total: calculatedTotal },
    });

    expect(updatedOrder.total).toBe(59.98);
  });
});

describe('User Database Operations', () => {
  it('should create a user', async () => {
    const userData = {
      email: 'newuser@example.com',
      name: 'New User',
      role: 'customer' as const,
    };

    const user = await prisma.user.create({
      data: userData,
    });

    expect(user).toMatchObject({
      email: 'newuser@example.com',
      name: 'New User',
      role: 'customer',
    });
    expect(user.id).toBeDefined();
    expect(user.createdAt).toBeDefined();
  });

  it('should find user by email', async () => {
    const userData = {
      email: 'findme@example.com',
      name: 'Find Me',
      role: 'customer' as const,
    };

    await prisma.user.create({ data: userData });

    const foundUser = await prisma.user.findUnique({
      where: { email: 'findme@example.com' },
    });

    expect(foundUser).not.toBeNull();
    expect(foundUser?.name).toBe('Find Me');
  });

  it('should enforce unique email constraint', async () => {
    const userData = {
      email: 'duplicate@example.com',
      name: 'First User',
      role: 'customer' as const,
    };

    await prisma.user.create({ data: userData });

    // Try to create another user with same email
    await expect(
      prisma.user.create({
        data: {
          email: 'duplicate@example.com',
          name: 'Second User',
          role: 'customer',
        },
      })
    ).rejects.toThrow();
  });

  it('should find user with orders', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'withorders@example.com',
        name: 'User With Orders',
        role: 'customer',
      },
    });

    const category = await prisma.category.create({
      data: {
        name: 'Electronics',
        slug: 'electronics',
      },
    });

    // Create an order for the user
    await prisma.order.create({
      data: {
        userId: user.id,
        total: 99.99,
        status: 'completed',
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'US',
        },
      },
    });

    const userWithOrders = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    expect(userWithOrders?.orders).toHaveLength(1);
    expect(userWithOrders?.orders[0].total).toBe(99.99);
  });
});