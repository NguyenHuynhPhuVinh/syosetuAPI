import { jest } from '@jest/globals';

// Mock environment variables for testing
process.env['NODE_ENV'] = 'test';
process.env['PORT'] = '3001';
process.env['LOG_LEVEL'] = 'silent';
process.env['LOG_PRETTY_PRINT'] = 'false';

// Mock Puppeteer for testing
const mockPuppeteer = {
  __esModule: true,
  default: {
    launch: jest.fn().mockResolvedValue({
      newPage: jest.fn().mockResolvedValue({
        goto: jest.fn().mockResolvedValue(undefined),
        evaluate: jest.fn().mockResolvedValue({}),
        close: jest.fn().mockResolvedValue(undefined),
        setUserAgent: jest.fn().mockResolvedValue(undefined),
        setViewport: jest.fn().mockResolvedValue(undefined),
        setDefaultTimeout: jest.fn(),
        setRequestInterception: jest.fn().mockResolvedValue(undefined),
        on: jest.fn(),
      }),
      close: jest.fn().mockResolvedValue(undefined),
      connected: true,
      version: jest.fn().mockResolvedValue('test-version'),
      on: jest.fn(),
    }),
  },
};

jest.mock('puppeteer', () => mockPuppeteer);

// Increase test timeout for integration tests
jest.setTimeout(30000);
