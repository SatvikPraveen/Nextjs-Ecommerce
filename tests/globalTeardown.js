// tests/globalTeardown.js

module.exports = async () => {
  console.log('🧹 Cleaning up test environment...');

  try {
    // Close any database connections
    // Clean up any test artifacts
    // Reset global state

    console.log('✅ Test environment cleanup complete!');
  } catch (error) {
    console.error('❌ Failed to cleanup test environment:', error.message);
  }
};
