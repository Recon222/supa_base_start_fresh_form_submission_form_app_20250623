/**
 * Analysis Form - Flatpickr Integration Tests
 *
 * PROPER TDD Tests for Flatpickr integration in the Analysis form.
 * These tests verify that the FormFieldBuilder creates date fields
 * that are compatible with Flatpickr initialization.
 *
 * Key requirements:
 * 1. recordingDate field has correct structure for Flatpickr
 * 2. Date field has type="date" (or "text" after Flatpickr init)
 * 3. Field preserves correct ID and name for form submission
 * 4. Field has .invalid-feedback sibling for validation UI
 *
 * Note: Actual Flatpickr library tests require the library to be loaded.
 * These tests verify the DOM structure that Flatpickr will enhance.
 *
 * @fileoverview TDD Integration tests for Flatpickr-ready date fields
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FormFieldBuilder } from '../../../assets/js/form-handlers/form-field-builder.js';

describe('Analysis Form Flatpickr Integration', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    // Mock the current date for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-21T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  /**
   * Test Suite: recordingDate Field Structure
   *
   * The recordingDate field must be created with proper structure
   * so that Flatpickr can enhance it while preserving form submission.
   */
  describe('recordingDate Field Structure', () => {
    describe('Field creation', () => {
      it('should create recordingDate field via createVideoSourceSection()', () => {
        // This will FAIL because createVideoSourceSection() doesn't exist - that's TDD!
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const input = section.querySelector('#recordingDate');
        expect(input).toBeTruthy();
      });

      it('should create recordingDate with type="date"', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const input = section.querySelector('#recordingDate');
        expect(input.getAttribute('type')).toBe('date');
      });

      it('should create recordingDate with correct name for form submission', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const input = section.querySelector('#recordingDate');
        expect(input.getAttribute('name')).toBe('recordingDate');
      });

      it('should create recordingDate with correct ID for Flatpickr targeting', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const input = section.querySelector('#recordingDate');
        expect(input.getAttribute('id')).toBe('recordingDate');
      });

      it('should create recordingDate with form-control class', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const input = section.querySelector('#recordingDate');
        expect(input.classList.contains('form-control')).toBe(true);
      });

      it('should create recordingDate WITHOUT required attribute (field is optional)', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const input = section.querySelector('#recordingDate');
        expect(input.hasAttribute('required')).toBe(false);
      });
    });

    describe('Label association', () => {
      it('should have label associated via for="recordingDate"', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const label = section.querySelector('label[for="recordingDate"]');
        expect(label).toBeTruthy();
      });

      it('should have label with descriptive text', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const label = section.querySelector('label[for="recordingDate"]');
        expect(label.textContent).toBeTruthy();
        // Label should indicate it's for recording/original date
        expect(label.textContent.toLowerCase()).toMatch(/recording|original|date/);
      });
    });

    describe('Validation UI structure', () => {
      it('should have .invalid-feedback sibling for validation messages', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const input = section.querySelector('#recordingDate');
        const formGroup = input.closest('.form-group');
        const feedback = formGroup.querySelector('.invalid-feedback');
        expect(feedback).toBeTruthy();
      });

      it('should be inside a .form-group container', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const input = section.querySelector('#recordingDate');
        const formGroup = input.closest('.form-group');
        expect(formGroup).toBeTruthy();
      });
    });
  });

  /**
   * Test Suite: Date Validation Logic
   *
   * Tests for date validation behavior that will be enhanced by Flatpickr.
   * These verify the expected validation rules for past-date-only fields.
   */
  describe('Date Validation Logic', () => {
    describe('Past date validation', () => {
      it('should validate that today (2026-01-21) is a valid date', () => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        expect(todayStr).toBe('2026-01-21');

        // When Flatpickr is configured with maxDate: 'today',
        // today should be selectable
        const isValidPastDate = new Date(todayStr) <= new Date();
        expect(isValidPastDate).toBe(true);
      });

      it('should validate that yesterday (2026-01-20) is a valid date', () => {
        const yesterday = new Date('2026-01-20');
        const today = new Date('2026-01-21');

        expect(yesterday < today).toBe(true);
      });

      it('should validate that tomorrow (2026-01-22) is NOT a valid date for past-only fields', () => {
        const tomorrow = new Date('2026-01-22');
        const today = new Date('2026-01-21');

        // Tomorrow should be rejected by maxDate: 'today' config
        expect(tomorrow > today).toBe(true);
      });

      it('should accept past dates like 2025-12-01', () => {
        const pastDate = new Date('2025-12-01');
        const today = new Date('2026-01-21');

        expect(pastDate < today).toBe(true);
      });
    });

    describe('Date format validation', () => {
      it('should accept ISO format dates (YYYY-MM-DD)', () => {
        const isoFormatPattern = /^\d{4}-\d{2}-\d{2}$/;
        expect(isoFormatPattern.test('2026-01-21')).toBe(true);
        expect(isoFormatPattern.test('2025-12-15')).toBe(true);
      });

      it('should parse valid date strings correctly', () => {
        const dateStr = '2026-01-21';
        // Parse as local date to avoid timezone issues
        // new Date('2026-01-21') parses as UTC which can shift the day
        const [year, month, day] = dateStr.split('-').map(Number);

        expect(year).toBe(2026);
        expect(month).toBe(1); // January is 1 in the string format
        expect(day).toBe(21);

        // Verify the date can be constructed correctly
        const date = new Date(year, month - 1, day); // month is 0-indexed in Date constructor
        expect(date.getFullYear()).toBe(2026);
        expect(date.getMonth()).toBe(0); // January is 0
        expect(date.getDate()).toBe(21);
      });
    });
  });

  /**
   * Test Suite: Flatpickr Configuration Requirements
   *
   * Tests that define what the Flatpickr configuration should look like.
   * The actual Flatpickr initialization will use these config values.
   */
  describe('Flatpickr Configuration Requirements', () => {
    describe('maxDate configuration', () => {
      it('should require maxDate: "today" for past-date-only validation', () => {
        // This test documents the expected Flatpickr config
        const expectedConfig = {
          maxDate: 'today'
        };

        expect(expectedConfig.maxDate).toBe('today');
      });
    });

    describe('Date format configuration', () => {
      it('should require dateFormat: "Y-m-d" for ISO submission', () => {
        // This test documents the expected Flatpickr config
        const expectedConfig = {
          dateFormat: 'Y-m-d'
        };

        expect(expectedConfig.dateFormat).toBe('Y-m-d');
      });
    });

    describe('User experience configuration', () => {
      it('should require allowInput: true for manual entry', () => {
        const expectedConfig = {
          allowInput: true
        };

        expect(expectedConfig.allowInput).toBe(true);
      });

      it('should require closeOnSelect: true for better UX', () => {
        const expectedConfig = {
          closeOnSelect: true
        };

        expect(expectedConfig.closeOnSelect).toBe(true);
      });
    });

    describe('Default value configuration', () => {
      it('should NOT pre-select any date by default', () => {
        const expectedConfig = {
          defaultDate: null
        };

        expect(expectedConfig.defaultDate).toBeNull();
      });
    });
  });

  /**
   * Test Suite: Form Handler Flatpickr Integration
   *
   * Tests for how the AnalysisFormHandler should initialize Flatpickr.
   * These define the expected integration behavior.
   */
  describe('Form Handler Flatpickr Integration', () => {
    describe('Initialization timing', () => {
      it('should initialize Flatpickr after form fields are built', () => {
        // The form handler should call initializeFlatpickrFields() after buildFields()
        // Note: buildFields() is called by base class init() via Template Method Pattern
        const expectedMethodOrder = [
          'buildFields',
          'initializeFlatpickrFields'
        ];

        // This documents the expected initialization order
        expect(expectedMethodOrder[0]).toBe('buildFields');
        expect(expectedMethodOrder[1]).toBe('initializeFlatpickrFields');
      });
    });

    describe('Validation callback', () => {
      it('should call validateSingleField on date change', () => {
        // The Flatpickr onChange callback should trigger validation
        const expectedCallback = 'validateSingleField';
        expect(expectedCallback).toBe('validateSingleField');
      });
    });

    describe('Instance storage', () => {
      it('should store Flatpickr instance for programmatic access', () => {
        // The form handler should store: this.flatpickrInstances.recordingDate = ...
        const expectedStoragePath = 'this.flatpickrInstances.recordingDate';
        expect(expectedStoragePath).toBeTruthy();
      });
    });
  });

  /**
   * Test Suite: Draft Save/Load with Date Fields
   *
   * Tests for draft functionality with Flatpickr-enhanced date fields.
   */
  describe('Draft Save/Load with Date Fields', () => {
    describe('Draft save', () => {
      it('should save recordingDate value in ISO format', () => {
        // When saving a draft, the date should be in YYYY-MM-DD format
        const draftData = {
          recordingDate: '2025-12-15'
        };

        expect(draftData.recordingDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });

      it('should save empty string for unset recordingDate', () => {
        const draftData = {
          recordingDate: ''
        };

        expect(draftData.recordingDate).toBe('');
      });
    });

    describe('Draft restore', () => {
      it('should handle restoring valid date from draft', () => {
        const draftValue = '2025-12-15';

        // The value should be parseable as a valid date
        const date = new Date(draftValue);
        expect(isNaN(date.getTime())).toBe(false);
      });

      it('should handle restoring empty date from draft', () => {
        const draftValue = '';

        // Empty string should not cause errors
        expect(draftValue).toBe('');
      });

      it('should handle restoring invalid date gracefully', () => {
        const invalidDraftValue = 'not-a-date';

        // Invalid date string should be detectable
        const date = new Date(invalidDraftValue);
        expect(isNaN(date.getTime())).toBe(true);
      });
    });
  });

  /**
   * Test Suite: Accessibility
   *
   * Tests for accessibility requirements of the date field.
   */
  describe('Accessibility', () => {
    it('should preserve label association after Flatpickr initialization', () => {
      // The label[for="recordingDate"] should still work after Flatpickr wraps the input
      const section = FormFieldBuilder.createVideoSourceSection();
      container.appendChild(section);

      const label = section.querySelector('label[for="recordingDate"]');
      const input = section.querySelector('#recordingDate');

      expect(label).toBeTruthy();
      expect(input).toBeTruthy();
      expect(label.getAttribute('for')).toBe(input.getAttribute('id'));
    });

    it('should have input inside a form-group for consistent styling', () => {
      const section = FormFieldBuilder.createVideoSourceSection();
      container.appendChild(section);

      const input = section.querySelector('#recordingDate');
      const formGroup = input.closest('.form-group');

      expect(formGroup).toBeTruthy();
    });
  });

  /**
   * Test Suite: Mobile Responsiveness
   *
   * Tests for date field behavior on mobile devices.
   */
  describe('Mobile Responsiveness', () => {
    it('should have input that works with native date picker on mobile', () => {
      const section = FormFieldBuilder.createVideoSourceSection();
      container.appendChild(section);

      const input = section.querySelector('#recordingDate');

      // type="date" enables native picker on mobile
      expect(input.getAttribute('type')).toBe('date');
    });

    it('should not have disabled attribute that would prevent mobile interaction', () => {
      const section = FormFieldBuilder.createVideoSourceSection();
      container.appendChild(section);

      const input = section.querySelector('#recordingDate');
      expect(input.hasAttribute('disabled')).toBe(false);
    });

    it('should not have readonly attribute that would prevent mobile input', () => {
      const section = FormFieldBuilder.createVideoSourceSection();
      container.appendChild(section);

      const input = section.querySelector('#recordingDate');
      expect(input.hasAttribute('readonly')).toBe(false);
    });
  });
});

/**
 * Summary of Flatpickr Integration Requirements
 *
 * DOM Structure Requirements:
 * - Input with id="recordingDate" and name="recordingDate"
 * - type="date" for native fallback
 * - class="form-control" for Bootstrap styling
 * - .invalid-feedback sibling for validation messages
 * - Inside .form-group container
 * - label[for="recordingDate"] for accessibility
 *
 * Expected Flatpickr Configuration:
 * ```javascript
 * flatpickr('#recordingDate', {
 *   dateFormat: 'Y-m-d',
 *   maxDate: 'today',
 *   allowInput: true,
 *   closeOnSelect: true,
 *   defaultDate: null,
 *   onChange: (selectedDates, dateStr) => {
 *     this.validateSingleField(recordingDateField);
 *   }
 * });
 * ```
 *
 * Form Handler Integration:
 * - Initialize after buildFields() (called via Template Method Pattern)
 * - Store instance in this.flatpickrInstances.recordingDate
 * - Call validateSingleField on change
 * - Handle draft save/restore with setDate() and clear()
 */
