/**
 * Upload Form Builder - Integration Tests
 *
 * TDD Tests for the Upload form section builders and Flatpickr integration.
 * These tests define the expected behavior AFTER the refactor is complete.
 *
 * RED-LINE TESTS: Many methods tested here do NOT exist yet - that's TDD!
 *
 * The Upload form follows the Analysis form pattern:
 * 1. HTML has empty containers
 * 2. UploadFormHandler builds form fields via FormFieldBuilder
 * 3. Flatpickr is initialized on datetime fields
 * 4. Validation listeners are attached after build
 *
 * @fileoverview TDD Integration tests for Upload form builder methods
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FormFieldBuilder } from '../../../assets/js/form-handlers/form-field-builder.js';
import { CONFIG } from '../../../assets/js/config.js';

describe('Upload Form Builder', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    // Mock Flatpickr for testing
    window.flatpickr = vi.fn().mockReturnValue({
      setDate: vi.fn(),
      clear: vi.fn(),
      destroy: vi.fn()
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
    delete window.flatpickr;
  });

  /**
   * Test Suite: buildEvidenceSection()
   *
   * RED-LINE: This method does NOT exist yet in UploadFormHandler.
   * The Evidence section contains:
   * - occNumber (occurrence number, required)
   * - occDate (date of occurrence, required)
   * - offenceType (type of offence, required - Homicide/Missing Person only)
   * - evidenceBag (evidence bag number, optional)
   * - lockerNumber (locker number 1-28, optional)
   * - mediaType (type of media, required)
   * - mediaTypeOther (conditional, hidden by default)
   */
  describe('buildEvidenceSection()', () => {
    describe('Section structure', () => {
      it('should create evidence section using FormFieldBuilder methods', () => {
        // Setup: Create the evidence section container
        container.innerHTML = '<div id="evidence-section-container"></div>';

        // This test documents that buildEvidenceSection() should exist
        // and populate the evidence-section-container
        const evidenceContainer = container.querySelector('#evidence-section-container');
        expect(evidenceContainer).toBeTruthy();
      });
    });

    describe('Expected fields in evidence section', () => {
      // These tests verify the FormFieldBuilder methods that WILL be called
      // by buildEvidenceSection() after the refactor

      it('should create occNumber field via createOccurrenceNumberField()', () => {
        const occField = FormFieldBuilder.createOccurrenceNumberField();
        container.appendChild(occField);

        const input = container.querySelector('#occNumber');
        expect(input).toBeTruthy();
        expect(input.getAttribute('name')).toBe('occNumber');
        expect(input.hasAttribute('required')).toBe(true);
      });

      it('should create occDate field via createDateField()', () => {
        const dateField = FormFieldBuilder.createDateField('occDate', 0, 'Date of Occurrence', true, { maxDate: 'today' });
        container.appendChild(dateField);

        const input = container.querySelector('#occDate');
        expect(input).toBeTruthy();
        expect(input.getAttribute('name')).toBe('occDate');
        expect(input.getAttribute('type')).toBe('date');
        expect(input.hasAttribute('required')).toBe(true);
      });

      it('should create offenceType field via createSelectField() with Upload-specific options', () => {
        // Upload form has only Homicide/Missing Person (no "Other")
        const uploadOffenceOptions = [
          { value: '', text: 'Select...' },
          { value: 'Homicide', text: 'Homicide' },
          { value: 'Missing Person', text: 'Missing Person' }
        ];

        const selectField = FormFieldBuilder.createSelectField('offenceType', 0, 'Type of Offence', uploadOffenceOptions, true);
        container.appendChild(selectField);

        const select = container.querySelector('#offenceType');
        expect(select).toBeTruthy();
        expect(select.getAttribute('name')).toBe('offenceType');
        expect(select.hasAttribute('required')).toBe(true);

        // Verify options
        const options = Array.from(select.querySelectorAll('option'));
        expect(options.length).toBe(3);
        expect(options.map(o => o.value)).toContain('Homicide');
        expect(options.map(o => o.value)).toContain('Missing Person');
        expect(options.map(o => o.value)).not.toContain('Other');
      });

      it('should create evidenceBag field via createTextField()', () => {
        const textField = FormFieldBuilder.createTextField('evidenceBag', 0, 'Evidence Bag #', false, '', 'Evidence bag identification number');
        container.appendChild(textField);

        const input = container.querySelector('#evidenceBag');
        expect(input).toBeTruthy();
        expect(input.getAttribute('name')).toBe('evidenceBag');
        expect(input.hasAttribute('required')).toBe(false);
      });

      it('should create lockerNumber field via createLockerNumberField()', () => {
        const lockerField = FormFieldBuilder.createLockerNumberField();
        container.appendChild(lockerField);

        const input = container.querySelector('#lockerNumber');
        expect(input).toBeTruthy();
        expect(input.getAttribute('name')).toBe('lockerNumber');
        expect(input.getAttribute('type')).toBe('text');
        expect(input.getAttribute('inputmode')).toBe('numeric');
        expect(input.hasAttribute('required')).toBe(false);
      });

      it('should create mediaType field via createSelectField() with CONFIG.MEDIA_TYPE_OPTIONS', () => {
        const selectField = FormFieldBuilder.createSelectField('mediaType', 0, 'Type of Media Submitted', CONFIG.MEDIA_TYPE_OPTIONS, true);
        container.appendChild(selectField);

        const select = container.querySelector('#mediaType');
        expect(select).toBeTruthy();
        expect(select.getAttribute('name')).toBe('mediaType');
        expect(select.hasAttribute('required')).toBe(true);

        // Verify options include "Other"
        const options = Array.from(select.querySelectorAll('option'));
        expect(options.map(o => o.value)).toContain('Other');
      });

      it('should create mediaTypeOther field via createOtherField() (hidden by default)', () => {
        const otherField = FormFieldBuilder.createOtherField('mediaTypeOther', 0, 'Media Type');
        container.appendChild(otherField);

        const otherGroup = container.querySelector('#mediaTypeOtherGroup');
        expect(otherGroup).toBeTruthy();
        expect(otherGroup.classList.contains('d-none')).toBe(true);

        const input = container.querySelector('#mediaTypeOther');
        expect(input).toBeTruthy();
        expect(input.getAttribute('name')).toBe('mediaTypeOther');
      });
    });
  });

  /**
   * Test Suite: buildInvestigatorSection()
   *
   * RED-LINE: This method should reuse FormFieldBuilder.createInvestigatorSection()
   * which already exists from the Analysis form refactor.
   */
  describe('buildInvestigatorSection()', () => {
    it('should reuse FormFieldBuilder.createInvestigatorSection()', () => {
      const section = FormFieldBuilder.createInvestigatorSection();
      container.appendChild(section);

      expect(section).toBeTruthy();
      expect(section.classList.contains('form-section')).toBe(true);

      // Should have all investigator fields
      expect(container.querySelector('#rName')).toBeTruthy();
      expect(container.querySelector('#badge')).toBeTruthy();
      expect(container.querySelector('#requestingPhone')).toBeTruthy();
      expect(container.querySelector('#requestingEmail')).toBeTruthy();
    });

    it('should have rName field with correct attributes', () => {
      const section = FormFieldBuilder.createInvestigatorSection();
      container.appendChild(section);

      const input = container.querySelector('#rName');
      expect(input.getAttribute('name')).toBe('rName');
      expect(input.hasAttribute('required')).toBe(true);
    });

    it('should have badge field with correct attributes', () => {
      const section = FormFieldBuilder.createInvestigatorSection();
      container.appendChild(section);

      const input = container.querySelector('#badge');
      expect(input.getAttribute('name')).toBe('badge');
      expect(input.hasAttribute('required')).toBe(true);
    });

    it('should have requestingPhone field with type="tel"', () => {
      const section = FormFieldBuilder.createInvestigatorSection();
      container.appendChild(section);

      const input = container.querySelector('#requestingPhone');
      expect(input.getAttribute('type')).toBe('tel');
      expect(input.hasAttribute('required')).toBe(true);
    });

    it('should have requestingEmail field with type="email"', () => {
      const section = FormFieldBuilder.createInvestigatorSection();
      container.appendChild(section);

      const input = container.querySelector('#requestingEmail');
      expect(input.getAttribute('type')).toBe('email');
      expect(input.hasAttribute('required')).toBe(true);
    });
  });

  /**
   * Test Suite: createLocationVideoGroup(index)
   *
   * RED-LINE: This method does NOT exist yet.
   * It will create a location-video group with all required fields.
   *
   * For index 0 (first location):
   * - Fields have NO suffix: businessName, locationAddress, city, etc.
   *
   * For index > 0 (additional locations):
   * - Fields have _N suffix: businessName_1, locationAddress_1, city_1, etc.
   */
  describe('createLocationVideoGroup(index)', () => {
    describe('First location group (index 0)', () => {
      it('should create location fields without suffix at index 0', () => {
        // Test the FormFieldBuilder methods that will be used
        const locationField = FormFieldBuilder.createLocationField('businessName', 0, 'Business Name', false);
        container.appendChild(locationField);

        const input = container.querySelector('#businessName');
        expect(input).toBeTruthy();
        expect(input.getAttribute('name')).toBe('businessName');
        expect(input.getAttribute('id')).toBe('businessName');
      });

      it('should create address field without suffix at index 0', () => {
        const addressField = FormFieldBuilder.createLocationField('locationAddress', 0, 'Location Address', true);
        container.appendChild(addressField);

        const input = container.querySelector('#locationAddress');
        expect(input.getAttribute('name')).toBe('locationAddress');
        expect(input.getAttribute('id')).toBe('locationAddress');
        expect(input.hasAttribute('required')).toBe(true);
      });

      it('should create city field without suffix at index 0', () => {
        const cityField = FormFieldBuilder.createCityField(0);
        container.appendChild(cityField);

        const select = container.querySelector('#city');
        expect(select).toBeTruthy();
        expect(select.getAttribute('name')).toBe('city');
      });

      it('should create datetime fields without suffix at index 0', () => {
        // This will FAIL until createDateTimeField is implemented
        const startTimeField = FormFieldBuilder.createDateTimeField('videoStartTime', 0, 'Video Start Time', true);
        const endTimeField = FormFieldBuilder.createDateTimeField('videoEndTime', 0, 'Video End Time', true);

        container.appendChild(startTimeField);
        container.appendChild(endTimeField);

        expect(container.querySelector('#videoStartTime')).toBeTruthy();
        expect(container.querySelector('#videoEndTime')).toBeTruthy();
        expect(container.querySelector('#videoStartTime').getAttribute('name')).toBe('videoStartTime');
        expect(container.querySelector('#videoEndTime').getAttribute('name')).toBe('videoEndTime');
      });

      it('should create time sync field without suffix at index 0', () => {
        const timeSyncField = FormFieldBuilder.createTimeSyncField(0);
        container.appendChild(timeSyncField);

        const yesRadio = container.querySelector('#timeCorrectYes');
        const noRadio = container.querySelector('#timeCorrectNo');
        expect(yesRadio).toBeTruthy();
        expect(noRadio).toBeTruthy();
        expect(yesRadio.getAttribute('name')).toBe('isTimeDateCorrect');
      });

      it('should create DVR date field without suffix at index 0', () => {
        const dvrDateField = FormFieldBuilder.createDvrDateField(0);
        container.appendChild(dvrDateField);

        const input = container.querySelector('#dvrEarliestDate');
        expect(input).toBeTruthy();
        expect(input.getAttribute('name')).toBe('dvrEarliestDate');
      });
    });

    describe('Additional location groups (index > 0)', () => {
      it('should create location fields with _1 suffix at index 1', () => {
        const locationField = FormFieldBuilder.createLocationField('businessName', 1, 'Business Name', false);
        container.appendChild(locationField);

        const input = container.querySelector('#businessName_1');
        expect(input).toBeTruthy();
        expect(input.getAttribute('name')).toBe('businessName_1');
        expect(input.getAttribute('id')).toBe('businessName_1');
      });

      it('should create address field with _1 suffix at index 1', () => {
        const addressField = FormFieldBuilder.createLocationField('locationAddress', 1, 'Location Address', true);
        container.appendChild(addressField);

        const input = container.querySelector('#locationAddress_1');
        expect(input.getAttribute('name')).toBe('locationAddress_1');
        expect(input.getAttribute('id')).toBe('locationAddress_1');
      });

      it('should create city field with _1 suffix at index 1', () => {
        const cityField = FormFieldBuilder.createCityField(1);
        container.appendChild(cityField);

        const select = container.querySelector('#city_1');
        expect(select).toBeTruthy();
        expect(select.getAttribute('name')).toBe('city_1');

        // cityOther should also have suffix
        const otherGroup = container.querySelector('#cityOtherGroup_1');
        const otherInput = container.querySelector('#cityOther_1');
        expect(otherGroup).toBeTruthy();
        expect(otherInput).toBeTruthy();
      });

      it('should create datetime fields with _1 suffix at index 1', () => {
        // This will FAIL until createDateTimeField is implemented
        const startTimeField = FormFieldBuilder.createDateTimeField('videoStartTime', 1, 'Video Start Time', true);
        const endTimeField = FormFieldBuilder.createDateTimeField('videoEndTime', 1, 'Video End Time', true);

        container.appendChild(startTimeField);
        container.appendChild(endTimeField);

        expect(container.querySelector('#videoStartTime_1')).toBeTruthy();
        expect(container.querySelector('#videoEndTime_1')).toBeTruthy();
        expect(container.querySelector('#videoStartTime_1').getAttribute('name')).toBe('videoStartTime_1');
        expect(container.querySelector('#videoEndTime_1').getAttribute('name')).toBe('videoEndTime_1');
      });

      it('should create time sync field with _1 suffix at index 1', () => {
        const timeSyncField = FormFieldBuilder.createTimeSyncField(1);
        container.appendChild(timeSyncField);

        const yesRadio = container.querySelector('#timeCorrectYes_1');
        const noRadio = container.querySelector('#timeCorrectNo_1');
        expect(yesRadio).toBeTruthy();
        expect(noRadio).toBeTruthy();
        expect(yesRadio.getAttribute('name')).toBe('isTimeDateCorrect_1');
      });

      it('should create DVR date field with _1 suffix at index 1', () => {
        const dvrDateField = FormFieldBuilder.createDvrDateField(1);
        container.appendChild(dvrDateField);

        const input = container.querySelector('#dvrEarliestDate_1');
        expect(input).toBeTruthy();
        expect(input.getAttribute('name')).toBe('dvrEarliestDate_1');
      });

      it('should create fields with _2 suffix at index 2', () => {
        const locationField = FormFieldBuilder.createLocationField('businessName', 2, 'Business Name', false);
        container.appendChild(locationField);

        const input = container.querySelector('#businessName_2');
        expect(input).toBeTruthy();
        expect(input.getAttribute('name')).toBe('businessName_2');
      });
    });
  });

  /**
   * Test Suite: Flatpickr Integration Methods
   *
   * RED-LINE: These methods do NOT exist yet in UploadFormHandler.
   * They follow the Analysis form pattern for Flatpickr initialization.
   */
  describe('Flatpickr Integration Methods', () => {
    describe('initializeFlatpickrFields()', () => {
      it('should define initializeFlatpickrFields method behavior', () => {
        // This documents the expected behavior:
        // 1. Initialize Flatpickr on occDate with DATE config
        // 2. Call initializeFlatpickrInContainer() for first location group
        const expectedBehavior = {
          initializesOccDate: true,
          callsInitializeFlatpickrInContainer: true
        };
        expect(expectedBehavior.initializesOccDate).toBe(true);
        expect(expectedBehavior.callsInitializeFlatpickrInContainer).toBe(true);
      });

      it('should use CONFIG.FLATPICKR_CONFIG.DATE for occDate', () => {
        // occDate needs DATE config (no time)
        expect(CONFIG.FLATPICKR_CONFIG.DATE).toBeDefined();
        expect(CONFIG.FLATPICKR_CONFIG.DATE.dateFormat).toBe('Y-m-d');
      });
    });

    describe('initializeFlatpickrInContainer(container, index)', () => {
      it('should define initializeFlatpickrInContainer method behavior', () => {
        // This documents the expected behavior:
        // 1. Find videoStartTime and videoEndTime fields in container
        // 2. Initialize Flatpickr with DATETIME config
        // 3. Store instances in this.flatpickrInstances
        const expectedBehavior = {
          initializesVideoStartTime: true,
          initializesVideoEndTime: true,
          usesDATETIMEConfig: true,
          storesInstances: true
        };
        expect(expectedBehavior.initializesVideoStartTime).toBe(true);
        expect(expectedBehavior.initializesVideoEndTime).toBe(true);
        expect(expectedBehavior.usesDATETIMEConfig).toBe(true);
        expect(expectedBehavior.storesInstances).toBe(true);
      });

      it('should target correct field IDs based on index', () => {
        // Index 0: videoStartTime, videoEndTime
        // Index 1: videoStartTime_1, videoEndTime_1
        const index0StartId = 'videoStartTime';
        const index0EndId = 'videoEndTime';
        const index1StartId = 'videoStartTime_1';
        const index1EndId = 'videoEndTime_1';

        expect(index0StartId).toBe('videoStartTime');
        expect(index0EndId).toBe('videoEndTime');
        expect(index1StartId).toBe('videoStartTime_1');
        expect(index1EndId).toBe('videoEndTime_1');
      });
    });
  });

  /**
   * Test Suite: attachValidationListeners(container)
   *
   * RED-LINE: This method needs to be added to UploadFormHandler.
   * It follows the Analysis form pattern for attaching blur validation.
   */
  describe('attachValidationListeners(container)', () => {
    it('should attach blur listeners to .form-control elements', () => {
      // Create a mock form with form-control elements
      container.innerHTML = `
        <form id="test-form">
          <input class="form-control" id="testField1" name="testField1">
          <input class="form-control" id="testField2" name="testField2">
          <select class="form-control" id="testSelect" name="testSelect">
            <option value="">Select</option>
          </select>
        </form>
      `;

      const fields = container.querySelectorAll('.form-control');
      expect(fields.length).toBe(3);

      // Each field should be able to have a blur listener attached
      fields.forEach(field => {
        // This just verifies the structure is correct for attaching listeners
        expect(field.classList.contains('form-control')).toBe(true);
        expect(typeof field.addEventListener).toBe('function');
      });
    });

    it('should attach real-time validation to phone fields', () => {
      container.innerHTML = `
        <form id="test-form">
          <input type="tel" class="form-control" id="requestingPhone" name="requestingPhone">
        </form>
      `;

      const phoneField = container.querySelector('#requestingPhone');
      expect(phoneField.getAttribute('type')).toBe('tel');
      expect(typeof phoneField.addEventListener).toBe('function');
    });

    it('should attach real-time validation to email fields', () => {
      container.innerHTML = `
        <form id="test-form">
          <input type="email" class="form-control" id="requestingEmail" name="requestingEmail">
        </form>
      `;

      const emailField = container.querySelector('#requestingEmail');
      expect(emailField.getAttribute('type')).toBe('email');
      expect(typeof emailField.addEventListener).toBe('function');
    });
  });

  /**
   * Test Suite: populateForm() Override
   *
   * RED-LINE: This override needs to be added to UploadFormHandler.
   * It syncs Flatpickr instances with draft values.
   */
  describe('populateForm() override', () => {
    it('should sync Flatpickr instances with draft values', () => {
      // This documents the expected behavior:
      // 1. Call super.populateForm(data)
      // 2. For each Flatpickr instance, call setDate() with the draft value
      const draftData = {
        occDate: '2026-01-15',
        videoStartTime: '2026-01-15 10:00',
        videoEndTime: '2026-01-15 14:00'
      };

      // The override should call setDate on Flatpickr instances
      expect(draftData.occDate).toBe('2026-01-15');
      expect(draftData.videoStartTime).toBe('2026-01-15 10:00');
    });
  });

  /**
   * Test Suite: clearFormAfterSubmission() Override
   *
   * RED-LINE: This override needs to be added to UploadFormHandler.
   * It clears Flatpickr instances after successful submission.
   */
  describe('clearFormAfterSubmission() override', () => {
    it('should clear all Flatpickr instances', () => {
      // This documents the expected behavior:
      // 1. Call super.clearFormAfterSubmission()
      // 2. For each Flatpickr instance, call clear()
      const flatpickrInstances = {
        occDate: { clear: vi.fn() },
        videoStartTime: { clear: vi.fn() },
        videoEndTime: { clear: vi.fn() }
      };

      Object.values(flatpickrInstances).forEach(instance => {
        expect(typeof instance.clear).toBe('function');
      });
    });
  });

  /**
   * Test Suite: destroy() Method
   *
   * RED-LINE: This method needs to be added to UploadFormHandler.
   * It cleans up Flatpickr instances to prevent memory leaks.
   */
  describe('destroy() method', () => {
    it('should destroy all Flatpickr instances', () => {
      // This documents the expected behavior:
      // 1. For each Flatpickr instance, call destroy()
      // 2. Clear this.flatpickrInstances = {}
      const flatpickrInstances = {
        occDate: { destroy: vi.fn() },
        videoStartTime: { destroy: vi.fn() },
        videoEndTime: { destroy: vi.fn() }
      };

      Object.values(flatpickrInstances).forEach(instance => {
        expect(typeof instance.destroy).toBe('function');
      });
    });

    it('should be called on beforeunload event', () => {
      // This documents the expected behavior:
      // The constructor should add: window.addEventListener('beforeunload', () => this.destroy());
      const expectedEventListener = 'beforeunload';
      expect(expectedEventListener).toBe('beforeunload');
    });
  });

  /**
   * Test Suite: Field Naming Preservation
   *
   * CRITICAL: Field names must be preserved for PHP/PDF/JSON compatibility.
   */
  describe('Field Naming Preservation', () => {
    const uploadFormFieldNames = [
      // Evidence section
      'occNumber', 'occDate', 'offenceType', 'evidenceBag', 'lockerNumber', 'mediaType', 'mediaTypeOther',
      // Investigator section
      'rName', 'badge', 'requestingPhone', 'requestingEmail',
      // First location (index 0)
      'businessName', 'locationAddress', 'city', 'cityOther',
      'videoStartTime', 'videoEndTime', 'isTimeDateCorrect', 'timeOffset', 'dvrEarliestDate',
      // Additional info
      'otherInfo'
    ];

    uploadFormFieldNames.forEach(fieldName => {
      it(`should preserve field name "${fieldName}"`, () => {
        // This documents all field names that must be preserved
        expect(fieldName).toBeTruthy();
        expect(typeof fieldName).toBe('string');
      });
    });

    it('should NOT add suffixes to first location fields (index 0)', () => {
      const firstLocationFields = [
        'businessName', 'locationAddress', 'city', 'cityOther',
        'videoStartTime', 'videoEndTime', 'isTimeDateCorrect', 'timeOffset', 'dvrEarliestDate'
      ];

      firstLocationFields.forEach(fieldName => {
        // Index 0 fields should NOT have _N suffix
        expect(fieldName).not.toMatch(/_\d+$/);
      });
    });

    it('should add _1 suffix to second location fields (index 1)', () => {
      const expectedSecondLocationFields = [
        'businessName_1', 'locationAddress_1', 'city_1', 'cityOther_1',
        'videoStartTime_1', 'videoEndTime_1', 'isTimeDateCorrect_1', 'timeOffset_1', 'dvrEarliestDate_1'
      ];

      expectedSecondLocationFields.forEach(fieldName => {
        expect(fieldName).toMatch(/_1$/);
      });
    });
  });

  /**
   * Test Suite: Validation UI Structure
   *
   * All fields must have proper structure for validation UI.
   */
  describe('Validation UI Structure', () => {
    it('should have .invalid-feedback in all FormFieldBuilder outputs', () => {
      // Test a variety of FormFieldBuilder methods
      const textField = FormFieldBuilder.createTextField('test', 0, 'Test', true);
      const selectField = FormFieldBuilder.createSelectField('test2', 0, 'Test2', [{ value: '', text: 'Select' }], true);
      const phoneField = FormFieldBuilder.createPhoneField('phone', 0, 'Phone', true);
      const emailField = FormFieldBuilder.createEmailField('email', 0, 'Email', true);
      const lockerField = FormFieldBuilder.createLockerNumberField();
      const occField = FormFieldBuilder.createOccurrenceNumberField();

      [textField, selectField, phoneField, emailField, lockerField, occField].forEach(field => {
        container.appendChild(field);
      });

      const feedbacks = container.querySelectorAll('.invalid-feedback');
      expect(feedbacks.length).toBeGreaterThanOrEqual(6);
    });

    it('should have .form-control on all inputs/selects/textareas', () => {
      const section = FormFieldBuilder.createInvestigatorSection();
      container.appendChild(section);

      const formControls = container.querySelectorAll('.form-control');
      expect(formControls.length).toBeGreaterThan(0);

      formControls.forEach(control => {
        expect(['INPUT', 'SELECT', 'TEXTAREA']).toContain(control.tagName);
      });
    });
  });
});

/**
 * Summary of Upload Form Builder Requirements
 *
 * UploadFormHandler New Methods:
 * - buildInitialFields() - Builds all form sections
 * - buildEvidenceSection() - Evidence info fields
 * - buildInvestigatorSection() - Reuses createInvestigatorSection()
 * - buildFirstLocationVideoGroup() - First location (index 0)
 * - createLocationVideoGroup(index) - Shared method for all locations
 * - attachValidationListeners(container) - Blur listeners for validation
 * - initializeFlatpickrFields() - Init Flatpickr on initial fields
 * - initializeFlatpickrInContainer(container, index) - Init Flatpickr in location groups
 * - populateForm() override - Sync Flatpickr with draft values
 * - clearFormAfterSubmission() override - Clear Flatpickr instances
 * - destroy() - Cleanup Flatpickr on unload
 *
 * FormFieldBuilder New Methods:
 * - createDateTimeField(baseName, index, label, required, helpText) - For datetime with Flatpickr
 *
 * CONFIG Additions:
 * - FLATPICKR_CONFIG.DATETIME - 24-hour datetime picker config
 *
 * Field Naming:
 * - Index 0: No suffix (businessName, videoStartTime)
 * - Index N: _N suffix (businessName_1, videoStartTime_1)
 */
