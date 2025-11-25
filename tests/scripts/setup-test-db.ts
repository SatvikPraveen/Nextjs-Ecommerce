import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import path from 'path';

const prisma = new PrismaClient();

async function setupTestDatabase() {
  try {
    console.log('🔧 Setting up test database...');

    // Run Prisma migrations for test environment
    console.log('📋 Running migrations...');
    execSync('npx prisma migrate deploy', {
      cwd: path.resolve(__dirname, '../..'),
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL,
      },
    });

    console.log('✅ Test database setup complete!');
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  setupTestDatabase();
}

export { setupTestDatabase };
