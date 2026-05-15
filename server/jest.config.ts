import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  globalSetup: '<rootDir>/src/tests/jest.globalSetup.ts',
  setupFilesAfterEnv: ['<rootDir>/src/tests/jest.setup.ts'],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1',
  },
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.json',
    },
  },
  // SQLite does not support concurrent writes — run files sequentially
  maxWorkers: 1,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
    '!src/tests/**',
  ],
  coverageThreshold: {
    global: {
      lines: 70,
      branches: 60,   // storage.ts file I/O is untestable without mocks; raised in MVP 3+
      functions: 70,
      statements: 70,
    },
  },
};

export default config;
