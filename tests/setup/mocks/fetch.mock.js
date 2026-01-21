import { vi } from 'vitest';

/**
 * Mock implementation of fetch for testing API calls.
 * This provides a flexible fetch mock that can be customized per test.
 */

// Create mock fetch function
const fetchMock = vi.fn((url, options) => {
  // Default mock response
  return Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    json: async () => ({ success: true }),
    text: async () => JSON.stringify({ success: true }),
    blob: async () => new Blob(),
    arrayBuffer: async () => new ArrayBuffer(0),
    formData: async () => new FormData(),
    clone: function() {
      return this;
    }
  });
});

// Assign to global
global.fetch = fetchMock;

/**
 * Helper function to create a mock response.
 * Use this in tests to customize fetch responses:
 *
 * Example:
 *   fetch.mockResolvedValueOnce(createMockResponse({ data: 'test' }, 200));
 */
export function createMockResponse(data, status = 200, ok = true) {
  return {
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    json: async () => data,
    text: async () => JSON.stringify(data),
    blob: async () => new Blob([JSON.stringify(data)]),
    arrayBuffer: async () => new ArrayBuffer(0),
    formData: async () => new FormData(),
    clone: function() {
      return this;
    }
  };
}

/**
 * Helper function to create a network error.
 * Use this in tests to simulate network failures:
 *
 * Example:
 *   fetch.mockRejectedValueOnce(createNetworkError('Failed to fetch'));
 */
export function createNetworkError(message = 'Network error') {
  return new Error(message);
}

export { fetchMock };
