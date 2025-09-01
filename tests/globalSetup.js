// tests/globalSetup.js

const { execSync } = require('child_process');

module.exports = async () => {
  console.log('🚀 Setting up test environment...');
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ecommerce_test';
  
  try {
    // Setup test database
    console.log('📦 Setting up test database...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    execSync('npx prisma migrate reset --force --skip-seed', { stdio: 'inherit' });
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    console.log('✅ Test environment setup complete!');
  } catch (error) {
    console.error('❌ Failed to setup test environment:', error.message);
    process.exit(1);
  }
};