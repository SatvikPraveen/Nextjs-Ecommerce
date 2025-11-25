module.exports = {
  projects: [
    // Unit tests with jsdom for browser API support
    {
      displayName: 'unit',
      testEnvironment: 'jsdom',
      roots: ['<rootDir>/tests/unit'],
      testMatch: ['**/?(*.)+(spec|test).ts'],
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
      preset: 'ts-jest',
      globals: {
        'ts-jest': {
          tsconfig: {
            jsx: 'react',
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
            strict: false,
            skipLibCheck: true,
            module: 'commonjs',
            target: 'es2020',
            types: ['jest', '@jest/globals'],
          },
        },
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '^@/components/(.*)$': '<rootDir>/components/$1',
        '^@/lib/(.*)$': '<rootDir>/lib/$1',
        '^@/app/(.*)$': '<rootDir>/app/$1',
        '^@/server/(.*)$': '<rootDir>/server/$1',
      },
      setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
      testTimeout: 10000,
    },
    // Integration tests with node environment for Prisma support
    {
      displayName: 'integration',
      testEnvironment: 'node',
      roots: ['<rootDir>/tests/integration', '<rootDir>/tests/e2e'],
      testMatch: ['**/?(*.)+(spec|test).ts'],
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
      preset: 'ts-jest',
      globals: {
        'ts-jest': {
          tsconfig: {
            jsx: 'react',
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
            strict: false,
            skipLibCheck: true,
            module: 'commonjs',
            target: 'es2020',
            types: ['jest', '@jest/globals'],
          },
        },
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '^@/components/(.*)$': '<rootDir>/components/$1',
        '^@/lib/(.*)$': '<rootDir>/lib/$1',
        '^@/app/(.*)$': '<rootDir>/app/$1',
        '^@/server/(.*)$': '<rootDir>/server/$1',
      },
      setupFilesAfterEnv: ['<rootDir>/tests/setup-integration.ts'],
      testTimeout: 10000,
    },
  ],

  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'server/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
};
