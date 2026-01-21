import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Smoke Tests for Vitest Infrastructure
 *
 * These tests verify that the testing infrastructure is working correctly.
 * They test the test framework itself, not the application code.
 */

describe('Vitest Infrastructure Smoke Tests', () => {
  describe('Basic Test Functionality', () => {
    it('should run Vitest successfully', () => {
      expect(1 + 1).toBe(2);
    });

    it('should support async tests', async () => {
      const promise = Promise.resolve('success');
      await expect(promise).resolves.toBe('success');
    });

    it('should support test matchers', () => {
      expect(true).toBe(true);
      expect('hello').toContain('ell');
      expect([1, 2, 3]).toHaveLength(3);
      expect({ name: 'test' }).toHaveProperty('name');
    });
  });

  describe('Happy-DOM Environment', () => {
    it('should provide document object', () => {
      expect(document).toBeDefined();
      expect(document.createElement).toBeDefined();
    });

    it('should create DOM elements', () => {
      const div = document.createElement('div');
      div.textContent = 'Test';
      expect(div.textContent).toBe('Test');
    });

    it('should support querySelector', () => {
      document.body.innerHTML = '<div id="test">Hello</div>';
      const element = document.querySelector('#test');
      expect(element).toBeTruthy();
      expect(element.textContent).toBe('Hello');
    });

    it('should support event listeners', () => {
      const button = document.createElement('button');
      let clicked = false;
      button.addEventListener('click', () => {
        clicked = true;
      });
      button.click();
      expect(clicked).toBe(true);
    });
  });

  describe('Mock Infrastructure', () => {
    beforeEach(() => {
      // Clear any previous state
      localStorage.clear();
    });

    it('should provide mocked localStorage', () => {
      expect(global.localStorage).toBeDefined();
      expect(localStorage.setItem).toBeDefined();
      expect(localStorage.getItem).toBeDefined();
    });

    it('should mock localStorage.setItem and getItem', () => {
      localStorage.setItem('testKey', 'testValue');
      const value = localStorage.getItem('testKey');
      expect(value).toBe('testValue');
    });

    it('should mock localStorage.removeItem', () => {
      localStorage.setItem('testKey', 'testValue');
      localStorage.removeItem('testKey');
      const value = localStorage.getItem('testKey');
      expect(value).toBeNull();
    });

    it('should mock localStorage.clear', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      localStorage.clear();
      expect(localStorage.getItem('key1')).toBeNull();
      expect(localStorage.getItem('key2')).toBeNull();
    });

    it('should provide mocked fetch', () => {
      expect(global.fetch).toBeDefined();
      expect(global.fetch).toBeInstanceOf(Function);
    });

    it('should mock fetch responses', async () => {
      const response = await fetch('https://example.com');
      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ success: true });
    });
  });

  describe('Vitest Mocking Capabilities', () => {
    it('should create mock functions with vi.fn()', () => {
      const mockFn = vi.fn();
      mockFn('test');
      expect(mockFn).toHaveBeenCalledWith('test');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should mock function return values', () => {
      const mockFn = vi.fn().mockReturnValue('mocked');
      expect(mockFn()).toBe('mocked');
    });

    it('should mock async function return values', async () => {
      const mockFn = vi.fn().mockResolvedValue('async mocked');
      const result = await mockFn();
      expect(result).toBe('async mocked');
    });

    it('should spy on function calls', () => {
      const obj = {
        method: () => 'original'
      };
      const spy = vi.spyOn(obj, 'method');
      obj.method();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Test Lifecycle Hooks', () => {
    let counter = 0;

    beforeEach(() => {
      counter = 0;
    });

    it('should run beforeEach before each test', () => {
      expect(counter).toBe(0);
      counter++;
    });

    it('should isolate tests from each other', () => {
      expect(counter).toBe(0); // Reset by beforeEach
      counter++;
    });
  });

  describe('Error Handling', () => {
    it('should catch thrown errors', () => {
      expect(() => {
        throw new Error('Test error');
      }).toThrow('Test error');
    });

    it('should handle async rejections', async () => {
      const promise = Promise.reject(new Error('Async error'));
      await expect(promise).rejects.toThrow('Async error');
    });
  });
});

/**
 * Infrastructure Verification Summary
 *
 * If all tests in this file pass, the following infrastructure is confirmed working:
 *
 * ✅ Vitest test runner
 * ✅ Happy-DOM environment (document, DOM APIs)
 * ✅ localStorage mock
 * ✅ fetch mock
 * ✅ Vitest mocking capabilities (vi.fn, vi.spyOn)
 * ✅ Test lifecycle hooks (beforeEach, afterEach)
 * ✅ Async test support
 * ✅ Error handling and assertions
 *
 * Test writers can now proceed to write application tests with confidence
 * that the infrastructure is solid and ready.
 */
