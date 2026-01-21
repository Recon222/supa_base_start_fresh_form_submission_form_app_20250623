import { vi } from 'vitest';

/**
 * Mock implementation of localStorage for testing.
 * This provides a complete localStorage API that can be used in tests.
 */

// Create a simple in-memory storage
const storage = new Map();

// Mock localStorage with all required methods
const localStorageMock = {
  getItem: vi.fn((key) => {
    return storage.get(key) || null;
  }),

  setItem: vi.fn((key, value) => {
    storage.set(key, String(value));
  }),

  removeItem: vi.fn((key) => {
    storage.delete(key);
  }),

  clear: vi.fn(() => {
    storage.clear();
  }),

  get length() {
    return storage.size;
  },

  key: vi.fn((index) => {
    return Array.from(storage.keys())[index] || null;
  })
};

// Assign to global
global.localStorage = localStorageMock;

export { localStorageMock };
