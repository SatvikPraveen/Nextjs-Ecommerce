import {
  PrismaClient,
  UserRole,
  OrderStatus,
  ProductStatus,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

async function seedTestData() {
  try {
    console.log('🌱 Seeding test data...');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.inventory.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    // Create test categories
    console.log('📦 Creating categories...');
    const electronics = await prisma.category.create({
      data: {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and accessories',
      },
    });

    const books = await prisma.category.create({
      data: {
        name: 'Books',
        slug: 'books',
        description: 'Physical and digital books',
      },
    });

    const clothing = await prisma.category.create({
      data: {
        name: 'Clothing',
        slug: 'clothing',
        description: 'Apparel and fashion items',
      },
    });

    // Create test products
    console.log('🛍️  Creating products...');
    const products = await Promise.all([
      prisma.product.create({
        data: {
          name: 'Wireless Headphones',
          slug: 'wireless-headphones',
          description:
            'High-quality wireless headphones with noise cancellation',
          price: new Decimal('99.99'),
          status: ProductStatus.PUBLISHED,
          categoryId: electronics.id,
          inventory: {
            create: {
              quantity: 50,
              available: 50,
            },
          },
        },
      }),
      prisma.product.create({
        data: {
          name: 'USB-C Charger',
          slug: 'usb-c-charger',
          description: 'Fast 65W USB-C charger for laptops and phones',
          price: new Decimal('29.99'),
          status: ProductStatus.PUBLISHED,
          categoryId: electronics.id,
          inventory: {
            create: {
              quantity: 100,
              available: 100,
            },
          },
        },
      }),
      prisma.product.create({
        data: {
          name: 'Programming Book',
          slug: 'programming-book',
          description: 'Advanced techniques in web development',
          price: new Decimal('49.99'),
          status: ProductStatus.PUBLISHED,
          categoryId: books.id,
          inventory: {
            create: {
              quantity: 30,
              available: 30,
            },
          },
        },
      }),
      prisma.product.create({
        data: {
          name: 'T-Shirt',
          slug: 't-shirt',
          description: 'Comfortable cotton t-shirt',
          price: new Decimal('19.99'),
          status: ProductStatus.PUBLISHED,
          categoryId: clothing.id,
          inventory: {
            create: {
              quantity: 200,
              available: 200,
            },
          },
        },
      }),
      prisma.product.create({
        data: {
          name: 'Jeans',
          slug: 'jeans',
          description: 'Premium denim jeans',
          price: new Decimal('79.99'),
          status: ProductStatus.PUBLISHED,
          categoryId: clothing.id,
          inventory: {
            create: {
              quantity: 75,
              available: 75,
            },
          },
        },
      }),
    ]);

    // Create test users
    console.log('👥 Creating test users...');
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        name: 'Admin Test User',
        password: 'password123',
        role: UserRole.ADMIN,
      },
    });

    const customerUser = await prisma.user.create({
      data: {
        email: 'customer@test.com',
        name: 'Customer Test User',
        password: 'password123',
        role: UserRole.USER,
      },
    });

    // Create test orders
    console.log('📋 Creating test orders...');
    const order1 = await prisma.order.create({
      data: {
        orderNumber: 'TEST-001',
        userId: customerUser.id,
        status: OrderStatus.PENDING,
        customerEmail: customerUser.email || '',
        shippingName: 'Test Customer',
        shippingAddress: '123 Main St',
        shippingCity: 'Test City',
        shippingZip: '12345',
        subtotal: new Decimal('129.98'),
        tax: new Decimal('10.40'),
        shipping: new Decimal('0'),
        total: new Decimal('140.38'),
        orderItems: {
          create: [
            {
              productId: products[0].id,
              productName: products[0].name,
              quantity: 1,
              price: new Decimal('99.99'),
            },
            {
              productId: products[1].id,
              productName: products[1].name,
              quantity: 1,
              price: new Decimal('29.99'),
            },
          ],
        },
      },
    });

    const order2 = await prisma.order.create({
      data: {
        orderNumber: 'TEST-002',
        userId: customerUser.id,
        status: OrderStatus.DELIVERED,
        customerEmail: customerUser.email || '',
        shippingName: 'Test Customer',
        shippingAddress: '123 Main St',
        shippingCity: 'Test City',
        shippingZip: '12345',
        subtotal: new Decimal('39.98'),
        tax: new Decimal('3.20'),
        shipping: new Decimal('10.00'),
        total: new Decimal('53.18'),
        deliveredAt: new Date(),
        orderItems: {
          create: [
            {
              productId: products[3].id,
              productName: products[3].name,
              quantity: 2,
              price: new Decimal('19.99'),
            },
          ],
        },
      },
    });

    console.log('✅ Test data seeded successfully!');
    console.log(`
    📊 Seed Summary:
    - Categories: 3
    - Products: 5
    - Users: 2 (1 admin, 1 customer)
    - Orders: 2
    
    Test Credentials:
    - Admin: admin@test.com / password123
    - Customer: customer@test.com / password123
    `);

    return {
      categories: [electronics, books, clothing],
      products,
      users: [adminUser, customerUser],
      orders: [order1, order2],
    };
  } catch (error) {
    console.error('❌ Failed to seed test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedTestData().catch(error => {
    console.error('Seed error:', error);
    process.exit(1);
  });
}

export { seedTestData };
