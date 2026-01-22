/**
 * FormFieldBuilder - createDateTimeField() Unit Tests
 *
 * TDD Tests for the createDateTimeField() method that is needed for Upload form.
 * This method creates datetime fields compatible with Flatpickr initialization.
 *
 * RED-LINE TESTS: The createDateTimeField() method does NOT exist yet.
 * These tests define what the method should create.
 *
 * @fileoverview Unit tests for FormFieldBuilder.createDateTimeField()
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FormFieldBuilder } from '../../../assets/js/form-handlers/form-field-builder.js';

describe('FormFieldBuilder.createDateTimeField()', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  /**
   * Test Suite: Method Existence
   *
   * RED-LINE: This method does NOT exist yet - that's TDD!
   */
  describe('Method existence', () => {
    it('should have createDateTimeField as a static method', () => {
      expect(typeof FormFieldBuilder.createDateTimeField).toBe('function');
    });
  });

  /**
   * Test Suite: Basic DOM Structure
   *
   * The method should create a form group with:
   * - .form-group container
   * - label element
   * - input element (type="text" for Flatpickr)
   * - optional help text
   * - .invalid-feedback for validation messages
   */
  describe('Basic DOM structure', () => {
    it('should return a form-group div element', () => {
      const group = FormFieldBuilder.createDateTimeField('videoStartTime', 0, 'Video Start Time', true);
      expect(group).toBeTruthy();
      expect(group.tagName.toLowerCase()).toBe('div');
      expect(group.classList.contains('form-group')).toBe(true);
    });

    it('should create a label element', () => {
      const group = FormFieldBuilder.createDateTimeField('videoStartTime', 0, 'Video Start Time', true);
      container.appendChild(group);

      const label = group.querySelector('label');
      expect(label).toBeTruthy();
      expect(label.classList.contains('form-label')).toBe(true);
    });

    it('should create an input element', () => {
      const group = FormFieldBuilder.createDateTimeField('videoStartTime', 0, 'Video Start Time', true);
      container.appendChild(group);

      const input = group.querySelector('input');
      expect(input).toBeTruthy();
    });

    it('should create an invalid-feedback element', () => {
      const group = FormFieldBuilder.createDateTimeField('videoStartTime', 0, 'Video Start Time', true);
      container.appendChild(group);

      const feedback = group.querySelector('.invalid-feedback');
      expect(feedback).toBeTruthy();
    });
  });

  /**
   * Test Suite: Input Element Attributes
   *
   * The input should use type="text" for Flatpickr compatibility.
   * Flatpickr will be initialized by the form handler after DOM insertion.
   */
  describe('Input element attributes', () => {
    it('should create input with type="text" for Flatpickr compatibility', () => {
      const group = FormFieldBuilder.createDateTimeField('videoStartTime', 0, 'Video Start Time', true);
      container.appendChild(group);

      const input = group.querySelector('input');
      expect(input.getAttribute('type')).toBe('text');
    });

    it('should create input with form-control class', () => {
      const group = FormFieldBuilder.createDateTimeField('videoStartTime', 0, 'Video Start Time', true);
      container.appendChild(group);

      const input = group.querySelector('input');
      expect(input.classList.contains('form-control')).toBe(true);
    });
  });

  /**
   * Test Suite: Index 0 Naming (First Location)
   *
   * When index is 0, field names should NOT have a suffix.
   * Examples: videoStartTime, videoEndTime
   */
  describe('Index 0 naming (first location)', () => {
    it('should create input with name="videoStartTime" when index is 0', () => {
      const group = FormFieldBuilder.createDateTimeField('videoStartTime', 0, 'Video Start Time', true);
      container.appendChild(group);

      const input = group.querySelector('input');
      expect(input.getAttribute('name')).toBe('videoStartTime');
    });

    it('should create input with id="videoStartTime" when index is 0', () => {
      const group = FormFieldBuilder.createDateTimeField('videoStartTime', 0, 'Video Start Time', true);
      container.appendChild(group);

      const input = group.querySelector('input');
      expect(input.getAttribute('id')).toBe('videoStartTime');
    });

    it('should create label with for="videoStartTime" when index is 0', () => {
      const group = FormFieldBuilder.createDateTimeField('videoStartTime', 0, 'Video Start Time', true);
      container.appendChild(group);

      const label = group.querySelector('label');
      expect(label.getAttribute('for')).toBe('videoStartTime');
    });

    it('should work correctly for videoEndTime at index 0', () => {
      const group = FormFieldBuilder.createDateTimeField('videoEndTime', 0, 'Video End Time', true);
      container.appendChild(group);

      const input = group.querySelector('input');
      expect(input.getAttribute('name')).toBe('videoEndTime');
      expect(input.getAttribute('id')).toBe('videoEndTime');
    });
  });

  /**
   * Test Suite: Index > 0 Naming (Additional Locations)
   *
   * When index is greater than 0, field names should have _N suffix.
   * Examples: videoStartTime_1, videoStartTime_2
   */
  describe('Index > 0 naming (additional locations)', () => {
    it('should create input with name="videoStartTime_1" when index is 1', () => {
      const group = FormFieldBuilder.createDateTimeField('videoStartTime', 1, 'Video Start Time', true);
      container.appendChild(group);

      const input = group.querySelector('input');
      expect(input.getAttribute('name')).toBe('videoStartTime_1');
    });

    it('should create input with id="videoStartTime_1" when index is 1', () => {
      const group = FormFieldBuilder.createDateTimeField('videoStartTime', 1, 'Video Start Time', true);
      container.appendChild(group);

      const input = group.querySelector('input');
      expect(input.getAttribute('id')).toBe('videoStartTime_1');
    });

    it('should create label with for="videoStartTime_1" when index is 1', () => {
      const group = FormFieldBuilder.createDateTimeField('videoStartTime', 1, 'Video Start Time', true);
      container.appendChild(group);

      const label = group.querySelector('label');
      expect(label.getAttribute('for')).toBe('videoStartTime_1');
    });

    it('should create correct naming for index 2', () => {
      const group = FormFieldBuilder.createDateTimeField('videoEndTime', 2, 'Video End Time', true);
      container.appendChild(group);

      const input = group.querySelector('input');
      expect(input.getAttribute('name')).toBe('videoEndTime_2');
      expect(input.getAttribute('id')).toBe('videoEndTime_2');
    });

    it('should create correct naming for high index (10)', () => {
      const group = FormFieldBuilder.createDateTimeField('videoStartTime', 10, 'Video Start Time', true);
      container.appendChild(group);

      const input = group.querySelector('input');
      expect(input.getAttribute('name')).toBe('videoStartTime_10');
      expect(input.getAttribute('id')).toBe('videoStartTime_10');
    });
  });

  /**
   * Test Suite: Required Attribute
   *
   * The required parameter should control whether the input has the required attribute.
   */
  describe('Required attribute', () => {
    it('should add required attribute when required is true', () => {
      const group = FormFieldBuilder.createDateTimeField('videoStartTime', 0, 'Video Start Time', true);
      container.appendChild(group);

      const input = group.querySelector('input');
      expect(input.hasAttribute('required')).toBe(true);
    });

    it('should NOT add required attribute when required is false', () => {
      const group = FormFieldBuilder.createDateTimeField('videoStartTime', 0, 'Video Start Time', false);
      container.appendChild(group);

      const input = group.querySelector('input');
      expect(input.hasAttribute('required')).toBe(false);
    });
  });

  /**
   * Test Suite: Label Content
   *
   * The label should display the provided label text and asterisk for required fields.
   */
  describe('Label content', () => {
    it('should display the provided label text', () => {
      const group = FormFieldBuilder.createDateTimeField('videoStartTime', 0, 'Video Start Time', true);
      container.appendChild(group);

      const label = group.querySelector('label');
      expect(label.textContent).toContain('Video Start Time');
    });

    it('should include asterisk span for required fields', () => {
      const group = FormFieldBuilder.createDateTimeField('videoStartTime', 0, 'Video Start Time', true);
      container.appendChild(group);

      const label = group.querySelector('label');
      const asterisk = label.querySelector('.required');
      expect(asterisk).toBeTruthy();
      expect(asterisk.textContent).toBe('*');
    });

    it('should NOT include asterisk span for optional fields', () => {
      const group = FormFieldBuilder.createDateTimeField('videoStartTime', 0, 'Video Start Time', false);
      container.appendChild(group);

      const label = group.querySelector('label');
      const asterisk = label.querySelector('.required');
      expect(asterisk).toBeNull();
    });
  });

  /**
   * Test Suite: Help Text
   *
   * The method should support optional help text displayed below the input.
   */
  describe('Help text', () => {
    it('should create help text element when helpText is provided', () => {
      const group = FormFieldBuilder.createDateTimeField(
        'videoStartTime', 0, 'Video Start Time', true, 'When the relevant video begins'
      );
      container.appendChild(group);

      const helpText = group.querySelector('.form-text, small');
      expect(helpText).toBeTruthy();
      expect(helpText.textContent).toBe('When the relevant video begins');
    });

    it('should NOT create help text element when helpText is empty', () => {
      const group = FormFieldBuilder.createDateTimeField('videoStartTime', 0, 'Video Start Time', true, '');
      container.appendChild(group);

      const helpText = group.querySelector('.form-text');
      // When empty string, no help text element should be created
      expect(helpText).toBeNull();
    });

    it('should NOT create help text element when helpText is not provided', () => {
      const group = FormFieldBuilder.createDateTimeField('videoStartTime', 0, 'Video Start Time', true);
      container.appendChild(group);

      // There might be form-text for other purposes, check specifically for non-empty help text
      const helpTexts = group.querySelectorAll('.form-text');
      const hasNonEmptyHelpText = Array.from(helpTexts).some(el => el.textContent.trim() !== '');
      // With no helpText param, there should be no help text (or it should be empty)
      // This depends on implementation - allow for flexibility
      expect(helpTexts.length === 0 || !hasNonEmptyHelpText).toBe(true);
    });
  });

  /**
   * Test Suite: Validation UI Compatibility
   *
   * The generated structure must be compatible with the validation UI system.
   */
  describe('Validation UI compatibility', () => {
    it('should have .invalid-feedback element inside .form-group', () => {
      const group = FormFieldBuilder.createDateTimeField('videoStartTime', 0, 'Video Start Time', true);
      container.appendChild(group);

      expect(group.classList.contains('form-group')).toBe(true);
      const feedback = group.querySelector('.invalid-feedback');
      expect(feedback).toBeTruthy();
    });

    it('should have input with .form-control class for validation styling', () => {
      const group = FormFieldBuilder.createDateTimeField('videoStartTime', 0, 'Video Start Time', true);
      container.appendChild(group);

      const input = group.querySelector('input');
      expect(input.classList.contains('form-control')).toBe(true);
    });
  });

  /**
   * Test Suite: Flatpickr Compatibility
   *
   * The generated input must be compatible with Flatpickr initialization.
   * Flatpickr requires type="text" and will be initialized by the form handler.
   */
  describe('Flatpickr compatibility', () => {
    it('should create input with type="text" (not datetime-local) for Flatpickr', () => {
      const group = FormFieldBuilder.createDateTimeField('videoStartTime', 0, 'Video Start Time', true);
      container.appendChild(group);

      const input = group.querySelector('input');
      // type="text" is required for Flatpickr to work correctly
      // datetime-local inputs have native pickers that conflict with Flatpickr
      expect(input.getAttribute('type')).toBe('text');
    });

    it('should create input that can be targeted by ID for Flatpickr init', () => {
      const group = FormFieldBuilder.createDateTimeField('videoStartTime', 0, 'Video Start Time', true);
      container.appendChild(group);

      const input = group.querySelector('input');
      expect(input.getAttribute('id')).toBeTruthy();

      // Should be findable via ID selector
      const foundBySelector = group.querySelector(`#${input.getAttribute('id')}`);
      expect(foundBySelector).toBe(input);
    });

    it('should NOT have any data-* attributes that could interfere with Flatpickr', () => {
      const group = FormFieldBuilder.createDateTimeField('videoStartTime', 0, 'Video Start Time', true);
      container.appendChild(group);

      const input = group.querySelector('input');
      // Flatpickr should be initialized programmatically, not via data attributes
      expect(input.hasAttribute('data-flatpickr')).toBe(false);
      expect(input.hasAttribute('data-input')).toBe(false);
    });
  });
});

/**
 * Summary of createDateTimeField() Requirements
 *
 * Method Signature:
 * static createDateTimeField(baseName, index, label, required, helpText = '')
 *
 * Parameters:
 * - baseName: string - Field base name (e.g., 'videoStartTime')
 * - index: number - Field index (0 for first, N for additional)
 * - label: string - Label text to display
 * - required: boolean - Whether field is required
 * - helpText: string - Optional help text below field
 *
 * Returns:
 * - HTMLElement - Form group div with label, input, help text, and invalid-feedback
 *
 * Field Naming:
 * - Index 0: name="baseName", id="baseName"
 * - Index N: name="baseName_N", id="baseName_N"
 *
 * DOM Structure:
 * <div class="form-group">
 *   <label for="fieldId" class="form-label">
 *     Label Text <span class="required">*</span>
 *   </label>
 *   <input type="text" class="form-control" id="fieldId" name="fieldName" required>
 *   <small class="form-text">Help text</small>
 *   <div class="invalid-feedback"></div>
 * </div>
 *
 * Flatpickr Initialization (done by form handler):
 * flatpickr('#videoStartTime', {
 *   ...CONFIG.FLATPICKR_CONFIG.DATETIME,
 *   onChange: (selectedDates, dateStr) => {
 *     this.validateSingleField(input);
 *   }
 * });
 */
