import { beforeEach, afterEach, vi } from 'vitest';

// Import mock helpers
import './mocks/localStorage.mock.js';
import './mocks/fetch.mock.js';

// Reset mocks before each test
beforeEach(() => {
  // localStorage mocks
  if (global.localStorage) {
    global.localStorage.getItem?.mockClear?.();
    global.localStorage.setItem?.mockClear?.();
    global.localStorage.removeItem?.mockClear?.();
    global.localStorage.clear?.mockClear?.();
  }

  // fetch mock
  if (global.fetch) {
    global.fetch.mockClear?.();
  }
});

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
});
