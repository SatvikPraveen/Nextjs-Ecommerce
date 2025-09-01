// tests/jest.config.js

const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: '../',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/setup.ts'],
  
  // Test environment
  testEnvironment: 'jsdom',
  
  // Module paths
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/../$1',
    '^@/components/(.*)$': '<rootDir>/../components/$1',
    '^@/lib/(.*)$': '<rootDir>/../lib/$1',
    '^@/app/(.*)$': '<rootDir>/../app/$1',
    '^@/server/(.*)$': '<rootDir>/../server/$1',
  },
  
  // Test patterns
  testMatch: [
    '<rootDir>/unit/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/integration/**/*.test.{js,jsx,ts,tsx}',
  ],
  
  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    '../app/**/*.{js,jsx,ts,tsx}',
    '../components/**/*.{js,jsx,ts,tsx}',
    '../lib/**/*.{js,jsx,ts,tsx}',
    '../server/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
  ],
  
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['html', 'text', 'text-summary', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  
  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/../node_modules/',
    '<rootDir>/../.next/',
    '<rootDir>/../e2e/',
  ],
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|@testing-library))',
  ],
  
  // Global setup
  globalSetup: '<rootDir>/globalSetup.js',
  globalTeardown: '<rootDir>/globalTeardown.js',
  
  // Test timeout
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  
  // Error handling
  bail: false,
  maxWorkers: '50%',
  
  // Reporter configuration
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: '<rootDir>/coverage',
        outputName: 'junit.xml',
      },
    ],
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);