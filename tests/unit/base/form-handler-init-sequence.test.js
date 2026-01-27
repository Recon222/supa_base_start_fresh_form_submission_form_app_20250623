/**
 * FormHandler Initialization Sequence Tests
 *
 * RED-LINE TESTS for Template Method Pattern refactor.
 * These tests are EXPECTED TO FAIL against current code - that's TDD!
 *
 * We are testing that the base class FormHandler:
 * 1. Has a buildFields() hook method
 * 2. Calls buildFields() during initialization
 * 3. Calls buildFields() BEFORE field-dependent setup methods
 * 4. Provides a default no-op buildFields() for backward compatibility
 * 5. Allows subclasses to override buildFields() and have fields available for setup
 *
 * Current Problem (being solved):
 * - Base class init() calls setupKeyboardProgressBarFix() and configureAutofill()
 * - These methods query for form fields that don't exist yet
 * - Subclass constructors haven't run buildInitialFields() at this point
 *
 * Solution (what these tests verify):
 * - init() will call this.buildFields() hook FIRST
 * - THEN call field-dependent setup methods
 * - Subclasses override buildFields() to create dynamic fields
 *
 * @fileoverview TDD RED-LINE tests for FormHandler initialization sequence
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ===========================================================================
// Test Suite: FormHandler Initialization Sequence
// ===========================================================================
describe('FormHandler - Initialization Sequence', () => {
  let FormHandler;
  let originalConsoleLog;

  // -------------------------------------------------------------------------
  // Test Setup and Teardown
  // -------------------------------------------------------------------------
  beforeEach(async () => {
    // Suppress console.log during tests (FormHandler logs autofill config)
    originalConsoleLog = console.log;
    console.log = vi.fn();

    // Reset document body for clean DOM state
    document.body.innerHTML = '';

    // Create minimal form structure required by FormHandler
    const form = document.createElement('form');
    form.id = 'test-form';
    document.body.appendChild(form);

    // Create progress bar elements (required by updateProgress)
    const progressBar = document.createElement('div');
    progressBar.id = 'form-progress';
    document.body.appendChild(progressBar);

    const progressLabel = document.createElement('span');
    progressLabel.id = 'progress-percentage';
    document.body.appendChild(progressLabel);

    // Dynamic import to get fresh module for each test
    // This avoids caching issues with spies
    vi.resetModules();

    // Mock dependencies that FormHandler imports
    vi.doMock('../../../assets/js/storage.js', () => ({
      saveDraft: vi.fn(),
      loadDraft: vi.fn().mockReturnValue(null),
      clearDraft: vi.fn(),
      getDraftAge: vi.fn().mockReturnValue('0 minutes ago'),
      saveSessionStart: vi.fn()
    }));

    vi.doMock('../../../assets/js/officer-storage.js', () => ({
      saveOfficerInfo: vi.fn().mockReturnValue(true),
      loadOfficerInfo: vi.fn().mockReturnValue(null),
      isFirstTimeUse: vi.fn().mockReturnValue(false),
      acknowledgeStorage: vi.fn(),
      clearOfficerInfo: vi.fn()
    }));

    vi.doMock('../../../assets/js/validators.js', () => ({
      validateField: vi.fn().mockReturnValue(null),
      validateConditionalFields: vi.fn().mockReturnValue({}),
      calculateFormCompletion: vi.fn().mockReturnValue({ percentage: 0, completed: 0, total: 0 }),
      formatPhone: vi.fn((phone) => phone)
    }));

    vi.doMock('../../../assets/js/utils.js', () => ({
      debounce: vi.fn((fn) => fn),
      scrollToElement: vi.fn(),
      showToast: vi.fn(),
      downloadBlob: vi.fn()
    }));

    vi.doMock('../../../assets/js/pdf-generator.js', () => ({
      generatePDF: vi.fn().mockResolvedValue(new Blob(['test']))
    }));

    vi.doMock('../../../assets/js/json-generator.js', () => ({
      generateJSON: vi.fn().mockResolvedValue(new Blob(['{}']))
    }));

    vi.doMock('../../../assets/js/notifications.js', () => ({
      showConfirmModal: vi.fn().mockResolvedValue(true)
    }));

    vi.doMock('../../../assets/js/api-client.js', () => ({
      submitWithRetry: vi.fn().mockResolvedValue({ success: true, submissionId: '123' })
    }));

    vi.doMock('../../../assets/js/config.js', () => ({
      CONFIG: {
        FEATURES: {
          BROWSER_AUTOFILL: false,
          SAVE_DRAFTS: true,
          PROGRESS_BAR: true
        },
        FIELD_NAMES: {
          OFFICER_EMAIL: 'requestingEmail',
          OFFICER_PHONE: 'requestingPhone'
        },
        MESSAGES: {
          OFFICER_INFO_LOADED: 'Info loaded',
          OFFICER_INFO_CLEARED: 'Info cleared',
          OFFICER_STORAGE_NOTICE: 'Storage notice',
          SUBMISSION_SUCCESS: 'Success',
          SUBMISSION_ERROR: 'Error',
          DRAFT_LOADED: 'Draft loaded',
          ERROR_TIMEOUT: 'Timeout',
          ERROR_OFFLINE: 'Offline',
          ERROR_SERVER: 'Server error',
          ERROR_RATE_LIMITED: 'Rate limited',
          ERROR_PDF_GENERATION: 'PDF error',
          ERROR_UNKNOWN: 'Unknown error'
        },
        PROGRESS_COLORS: {
          LOW: '#dc3545',
          MEDIUM: '#ffc107',
          HIGH: '#28a745'
        },
        ANIMATIONS: {
          SHAKE_DURATION: 500
        }
      }
    }));

    // Import FormHandler with mocked dependencies
    const module = await import('../../../assets/js/form-handlers/form-handler-base.js');
    FormHandler = module.FormHandler;
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    document.body.innerHTML = '';
    vi.clearAllMocks();
    vi.resetModules();
  });

  // ===========================================================================
  // TEST GROUP 1: buildFields() Hook Exists and Is Called
  // ===========================================================================
  describe('buildFields() hook exists and is called during init', () => {
    /**
     * RED-LINE TEST: buildFields() method must exist on FormHandler
     *
     * Current state: FormHandler does NOT have a buildFields() method
     * Expected: FormHandler has buildFields() method on prototype
     */
    it('should have buildFields method on FormHandler prototype', () => {
      expect(typeof FormHandler.prototype.buildFields).toBe('function');
    });

    /**
     * RED-LINE TEST: buildFields() is called when FormHandler is instantiated
     *
     * Current state: init() does NOT call buildFields()
     * Expected: Constructing a FormHandler should call buildFields()
     */
    it('should call buildFields() when FormHandler is instantiated', () => {
      // Spy on buildFields before instantiation
      const buildFieldsSpy = vi.spyOn(FormHandler.prototype, 'buildFields');

      // Instantiate FormHandler
      const handler = new FormHandler('test-form');

      // Verify buildFields was called
      expect(buildFieldsSpy).toHaveBeenCalled();
      expect(buildFieldsSpy).toHaveBeenCalledTimes(1);
    });

    /**
     * RED-LINE TEST: buildFields() is called with correct context (this)
     *
     * Expected: When buildFields() is called, 'this' refers to the FormHandler instance
     */
    it('should call buildFields() with correct context (this)', () => {
      let capturedThis = null;

      // Override buildFields to capture 'this'
      FormHandler.prototype.buildFields = function() {
        capturedThis = this;
      };

      const handler = new FormHandler('test-form');

      expect(capturedThis).toBe(handler);
    });
  });

  // ===========================================================================
  // TEST GROUP 2: buildFields() Runs BEFORE Field-Dependent Setup
  // ===========================================================================
  describe('buildFields() runs BEFORE field-dependent setup', () => {
    /**
     * RED-LINE TEST: buildFields() runs before setupKeyboardProgressBarFix()
     *
     * Current state: setupKeyboardProgressBarFix() is called in init() before
     *                subclass constructors can build fields
     * Expected: buildFields() completes BEFORE setupKeyboardProgressBarFix() is called
     */
    it('should call buildFields() before setupKeyboardProgressBarFix()', () => {
      const callOrder = [];

      // Spy on both methods to track call order
      vi.spyOn(FormHandler.prototype, 'buildFields').mockImplementation(function() {
        callOrder.push('buildFields');
      });

      vi.spyOn(FormHandler.prototype, 'setupKeyboardProgressBarFix').mockImplementation(function() {
        callOrder.push('setupKeyboardProgressBarFix');
      });

      // Instantiate to trigger init()
      const handler = new FormHandler('test-form');

      // Verify order: buildFields MUST come before setupKeyboardProgressBarFix
      expect(callOrder.indexOf('buildFields')).toBeLessThan(
        callOrder.indexOf('setupKeyboardProgressBarFix')
      );
    });

    /**
     * RED-LINE TEST: buildFields() runs before configureAutofill()
     *
     * Current state: configureAutofill() is called in init() before fields exist
     * Expected: buildFields() completes BEFORE configureAutofill() is called
     */
    it('should call buildFields() before configureAutofill()', () => {
      const callOrder = [];

      vi.spyOn(FormHandler.prototype, 'buildFields').mockImplementation(function() {
        callOrder.push('buildFields');
      });

      vi.spyOn(FormHandler.prototype, 'configureAutofill').mockImplementation(function() {
        callOrder.push('configureAutofill');
      });

      const handler = new FormHandler('test-form');

      expect(callOrder.indexOf('buildFields')).toBeLessThan(
        callOrder.indexOf('configureAutofill')
      );
    });

    /**
     * RED-LINE TEST: buildFields() runs before setupEventListeners()
     *
     * setupEventListeners() queries for .form-control elements
     * Expected: buildFields() completes BEFORE setupEventListeners() is called
     */
    it('should call buildFields() before setupEventListeners()', () => {
      const callOrder = [];

      vi.spyOn(FormHandler.prototype, 'buildFields').mockImplementation(function() {
        callOrder.push('buildFields');
      });

      vi.spyOn(FormHandler.prototype, 'setupEventListeners').mockImplementation(function() {
        callOrder.push('setupEventListeners');
      });

      const handler = new FormHandler('test-form');

      expect(callOrder.indexOf('buildFields')).toBeLessThan(
        callOrder.indexOf('setupEventListeners')
      );
    });

    /**
     * RED-LINE TEST: Full initialization sequence order
     *
     * Expected order:
     * 1. saveSessionStart() - no field dependency
     * 2. buildFields() - creates dynamic fields
     * 3. configureAutofill() - needs fields
     * 4. setupEventListeners() - needs fields
     * 5. setupKeyboardProgressBarFix() - needs fields
     * 6. loadOfficerInfoIfExists() - needs fields
     * 7. loadDraftIfExists() - no strict field dependency
     * 8. updateProgress() - needs fields
     */
    it('should call initialization methods in correct order', async () => {
      const callOrder = [];

      // Import storage to spy on saveSessionStart
      const storage = await import('../../../assets/js/storage.js');
      storage.saveSessionStart.mockImplementation(() => {
        callOrder.push('saveSessionStart');
      });

      vi.spyOn(FormHandler.prototype, 'buildFields').mockImplementation(function() {
        callOrder.push('buildFields');
      });

      vi.spyOn(FormHandler.prototype, 'configureAutofill').mockImplementation(function() {
        callOrder.push('configureAutofill');
      });

      vi.spyOn(FormHandler.prototype, 'setupEventListeners').mockImplementation(function() {
        callOrder.push('setupEventListeners');
      });

      vi.spyOn(FormHandler.prototype, 'setupKeyboardProgressBarFix').mockImplementation(function() {
        callOrder.push('setupKeyboardProgressBarFix');
      });

      vi.spyOn(FormHandler.prototype, 'loadOfficerInfoIfExists').mockImplementation(function() {
        callOrder.push('loadOfficerInfoIfExists');
      });

      vi.spyOn(FormHandler.prototype, 'loadDraftIfExists').mockImplementation(function() {
        callOrder.push('loadDraftIfExists');
      });

      vi.spyOn(FormHandler.prototype, 'updateProgress').mockImplementation(function() {
        callOrder.push('updateProgress');
      });

      const handler = new FormHandler('test-form');

      // Verify buildFields comes after saveSessionStart (pre-field setup)
      expect(callOrder.indexOf('saveSessionStart')).toBeLessThan(
        callOrder.indexOf('buildFields')
      );

      // Verify all field-dependent methods come after buildFields
      const fieldDependentMethods = [
        'configureAutofill',
        'setupEventListeners',
        'setupKeyboardProgressBarFix'
      ];

      fieldDependentMethods.forEach(method => {
        expect(callOrder.indexOf('buildFields')).toBeLessThan(
          callOrder.indexOf(method)
        );
      });
    });
  });

  // ===========================================================================
  // TEST GROUP 3: Default buildFields() Is Empty (Backward Compatibility)
  // ===========================================================================
  describe('default buildFields() is empty (backward compatibility)', () => {
    /**
     * RED-LINE TEST: Base class buildFields() does not throw
     *
     * Expected: Calling FormHandler.prototype.buildFields() should not throw
     *           This ensures forms without override still initialize
     */
    it('should not throw when base class buildFields() is called', () => {
      expect(() => {
        FormHandler.prototype.buildFields.call({});
      }).not.toThrow();
    });

    /**
     * RED-LINE TEST: Base class buildFields() returns undefined (no-op)
     *
     * Expected: Default implementation returns undefined (empty function)
     */
    it('should return undefined from base class buildFields()', () => {
      const result = FormHandler.prototype.buildFields.call({});
      expect(result).toBeUndefined();
    });

    /**
     * RED-LINE TEST: Forms without buildFields override still initialize
     *
     * Expected: A form that relies on static HTML fields (no override)
     *           should still initialize correctly with the default no-op
     */
    it('should allow forms without buildFields override to initialize', () => {
      // Create a minimal form with static HTML field
      const form = document.getElementById('test-form');
      const input = document.createElement('input');
      input.type = 'text';
      input.name = 'staticField';
      input.className = 'form-control';
      form.appendChild(input);

      // Should not throw - uses default empty buildFields()
      expect(() => {
        const handler = new FormHandler('test-form');
      }).not.toThrow();
    });

    /**
     * RED-LINE TEST: Static HTML fields get setup even without buildFields override
     *
     * Expected: When a form has pre-existing static HTML fields,
     *           setupEventListeners should attach listeners to them
     */
    it('should setup event listeners on static HTML fields', () => {
      // Create form with static field
      const form = document.getElementById('test-form');
      const input = document.createElement('input');
      input.type = 'text';
      input.name = 'staticField';
      input.className = 'form-control';
      form.appendChild(input);

      const handler = new FormHandler('test-form');

      // The input should have blur listener from setupEventListeners
      // We verify by checking that validateSingleField gets called on blur
      const validateSpy = vi.spyOn(handler, 'validateSingleField');

      // Trigger blur event
      input.dispatchEvent(new Event('blur'));

      expect(validateSpy).toHaveBeenCalledWith(input);
    });
  });

  // ===========================================================================
  // TEST GROUP 4: Subclass Can Override buildFields()
  // ===========================================================================
  describe('subclass can override buildFields() and fields are available for setup', () => {
    /**
     * RED-LINE TEST: Subclass buildFields() override is called
     *
     * Expected: When a subclass overrides buildFields(), that override is called
     *           instead of the base class implementation
     */
    it('should call subclass buildFields() override instead of base', () => {
      const subclassBuildFieldsCalled = vi.fn();

      class TestFormHandler extends FormHandler {
        buildFields() {
          subclassBuildFieldsCalled();
        }
      }

      const handler = new TestFormHandler('test-form');

      expect(subclassBuildFieldsCalled).toHaveBeenCalled();
      expect(subclassBuildFieldsCalled).toHaveBeenCalledTimes(1);
    });

    /**
     * RED-LINE TEST: Fields created in buildFields() exist when setupEventListeners runs
     *
     * This is THE CRITICAL TEST for the refactor!
     * Current problem: setupEventListeners runs before fields exist
     * Expected: Fields created in buildFields() are available to setupEventListeners
     */
    it('should have fields available in setupEventListeners when created in buildFields()', () => {
      let fieldsExistDuringSetup = false;

      class TestFormHandler extends FormHandler {
        buildFields() {
          // Create a dynamic field
          const input = document.createElement('input');
          input.type = 'text';
          input.name = 'dynamicField';
          input.id = 'dynamicField';
          input.className = 'form-control';
          this.form.appendChild(input);
        }

        setupEventListeners() {
          // Check if our dynamic field exists
          const dynamicField = this.form.querySelector('#dynamicField');
          fieldsExistDuringSetup = dynamicField !== null;

          // Still call parent to complete setup
          super.setupEventListeners();
        }
      }

      const handler = new TestFormHandler('test-form');

      expect(fieldsExistDuringSetup).toBe(true);
    });

    /**
     * RED-LINE TEST: Dynamic fields get autofill prevention
     *
     * Current problem: configureAutofill runs before dynamic fields exist
     * Expected: Fields created in buildFields() have autofill prevention applied
     */
    it('should apply autofill prevention to fields created in buildFields()', () => {
      let autofillAppliedToField = false;

      class TestFormHandler extends FormHandler {
        buildFields() {
          const input = document.createElement('input');
          input.type = 'text';
          input.name = 'dynamicField';
          input.id = 'dynamicField';
          input.className = 'form-control';
          this.form.appendChild(input);
        }
      }

      // Spy on applyAutofillPrevention to see what fields it receives
      const originalApply = FormHandler.prototype.applyAutofillPrevention;
      FormHandler.prototype.applyAutofillPrevention = function(fields) {
        // Check if our dynamic field is in the NodeList
        if (fields && fields.length > 0) {
          for (const field of fields) {
            if (field.id === 'dynamicField') {
              autofillAppliedToField = true;
            }
          }
        }
        return originalApply.call(this, fields);
      };

      const handler = new TestFormHandler('test-form');

      expect(autofillAppliedToField).toBe(true);

      // Restore original
      FormHandler.prototype.applyAutofillPrevention = originalApply;
    });

    /**
     * RED-LINE TEST: Dynamic fields get keyboard progress bar fix
     *
     * Current problem: setupKeyboardProgressBarFix runs before dynamic fields exist
     * Expected: Fields created in buildFields() are included in iOS keyboard fix
     */
    it('should apply keyboard fix to text inputs created in buildFields()', () => {
      // Mock iOS user agent for this test
      const originalUserAgent = navigator.userAgent;
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        configurable: true
      });

      // Create progress container (required for fix to apply)
      const progressContainer = document.createElement('div');
      progressContainer.className = 'progress-container';
      document.body.appendChild(progressContainer);

      let keyboardFixAppliedToField = false;

      class TestFormHandler extends FormHandler {
        buildFields() {
          const input = document.createElement('input');
          input.type = 'text';
          input.name = 'dynamicTextField';
          input.id = 'dynamicTextField';
          input.className = 'form-control';
          this.form.appendChild(input);
        }
      }

      const handler = new TestFormHandler('test-form');

      // Check if the dynamic field has focus listener that hides progress
      const dynamicField = document.getElementById('dynamicTextField');

      // Dispatch focus event and check if progress container is hidden
      dynamicField.dispatchEvent(new Event('focus'));

      // If keyboard fix was applied, opacity should be 0
      keyboardFixAppliedToField = progressContainer.style.opacity === '0';

      expect(keyboardFixAppliedToField).toBe(true);

      // Restore user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        configurable: true
      });
    });

    /**
     * RED-LINE TEST: Dynamic fields get validation listeners
     *
     * Expected: Fields created in buildFields() have validation on blur
     */
    it('should attach validation listeners to fields created in buildFields()', () => {
      class TestFormHandler extends FormHandler {
        buildFields() {
          const input = document.createElement('input');
          input.type = 'text';
          input.name = 'dynamicField';
          input.id = 'dynamicField';
          input.className = 'form-control';
          this.form.appendChild(input);
        }
      }

      const handler = new TestFormHandler('test-form');

      // Spy on validateSingleField
      const validateSpy = vi.spyOn(handler, 'validateSingleField');

      // Trigger blur on dynamic field
      const dynamicField = document.getElementById('dynamicField');
      dynamicField.dispatchEvent(new Event('blur'));

      expect(validateSpy).toHaveBeenCalledWith(dynamicField);
    });

    /**
     * RED-LINE TEST: Dynamic fields are included in progress calculation
     *
     * Expected: Fields created in buildFields() are included when updateProgress runs
     */
    it('should include fields created in buildFields() in progress calculation', async () => {
      const validators = await import('../../../assets/js/validators.js');
      let formPassedToCalculation = null;

      validators.calculateFormCompletion.mockImplementation((form) => {
        formPassedToCalculation = form;
        // Count form-control fields to verify dynamic field is present
        const fieldCount = form.querySelectorAll('.form-control').length;
        return { percentage: fieldCount * 10, completed: fieldCount, total: fieldCount };
      });

      class TestFormHandler extends FormHandler {
        buildFields() {
          const input = document.createElement('input');
          input.type = 'text';
          input.name = 'dynamicField';
          input.id = 'dynamicField';
          input.className = 'form-control';
          this.form.appendChild(input);
        }
      }

      const handler = new TestFormHandler('test-form');

      // Verify the form passed to calculateFormCompletion has our dynamic field
      expect(formPassedToCalculation).not.toBeNull();
      const dynamicField = formPassedToCalculation.querySelector('#dynamicField');
      expect(dynamicField).not.toBeNull();
    });
  });

  // ===========================================================================
  // TEST GROUP 5: Edge Cases and Error Handling
  // ===========================================================================
  describe('edge cases and error handling', () => {
    /**
     * RED-LINE TEST: buildFields() throwing does not break initialization
     *
     * Expected: If buildFields() throws, it should propagate (not be swallowed)
     *           This allows subclasses to fail fast if field building fails
     */
    it('should propagate errors from buildFields()', () => {
      class BrokenFormHandler extends FormHandler {
        buildFields() {
          throw new Error('Field building failed');
        }
      }

      expect(() => {
        new BrokenFormHandler('test-form');
      }).toThrow('Field building failed');
    });

    /**
     * RED-LINE TEST: buildFields() can call parent method
     *
     * Expected: Subclass can call super.buildFields() (which is a no-op)
     *           This is useful if base class ever adds default behavior
     */
    it('should allow subclass to call super.buildFields()', () => {
      let superCalled = false;

      class TestFormHandler extends FormHandler {
        buildFields() {
          super.buildFields();
          superCalled = true;
        }
      }

      expect(() => {
        new TestFormHandler('test-form');
      }).not.toThrow();

      expect(superCalled).toBe(true);
    });

    /**
     * RED-LINE TEST: buildFields() can access this.form
     *
     * Expected: When buildFields() runs, this.form is already set
     */
    it('should have this.form available in buildFields()', () => {
      let formAvailable = false;

      class TestFormHandler extends FormHandler {
        buildFields() {
          formAvailable = this.form !== null && this.form !== undefined;
        }
      }

      const handler = new TestFormHandler('test-form');

      expect(formAvailable).toBe(true);
    });

    /**
     * RED-LINE TEST: buildFields() can access this.formType
     *
     * Expected: When buildFields() runs, this.formType is already set
     */
    it('should have this.formType available in buildFields()', () => {
      let formType = null;

      class TestFormHandler extends FormHandler {
        buildFields() {
          formType = this.formType;
        }
      }

      const handler = new TestFormHandler('test-form');

      expect(formType).toBe('test');
    });

    /**
     * RED-LINE TEST: Multiple fields can be created in buildFields()
     *
     * Expected: buildFields() can create any number of fields
     */
    it('should allow creating multiple fields in buildFields()', () => {
      class TestFormHandler extends FormHandler {
        buildFields() {
          for (let i = 1; i <= 5; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.name = `field${i}`;
            input.id = `field${i}`;
            input.className = 'form-control';
            this.form.appendChild(input);
          }
        }
      }

      const handler = new TestFormHandler('test-form');

      // Verify all fields were created
      for (let i = 1; i <= 5; i++) {
        const field = document.getElementById(`field${i}`);
        expect(field).not.toBeNull();
      }
    });

    /**
     * RED-LINE TEST: buildFields() runs synchronously
     *
     * Expected: buildFields() is called synchronously, not as a callback
     *           Field-dependent methods should not run until buildFields returns
     */
    it('should call buildFields() synchronously (not async)', () => {
      const events = [];

      class TestFormHandler extends FormHandler {
        buildFields() {
          events.push('buildFields-start');
          // Simulate some work
          for (let i = 0; i < 100; i++) {
            // Busy work
          }
          events.push('buildFields-end');
        }

        setupEventListeners() {
          events.push('setupEventListeners');
          super.setupEventListeners();
        }
      }

      const handler = new TestFormHandler('test-form');

      // buildFields should complete before setupEventListeners starts
      expect(events[0]).toBe('buildFields-start');
      expect(events[1]).toBe('buildFields-end');
      expect(events[2]).toBe('setupEventListeners');
    });
  });
});

// ===========================================================================
// SUMMARY OF RED-LINE TESTS
// ===========================================================================
/**
 * These tests define the expected behavior for the Template Method Pattern refactor.
 *
 * Tests that will FAIL against current code:
 * 1. buildFields() method does not exist
 * 2. buildFields() is not called during init
 * 3. Call order is wrong (field-dependent methods run before fields exist)
 *
 * When implementation is complete:
 * - FormHandler.prototype.buildFields exists (empty no-op)
 * - init() calls buildFields() AFTER saveSessionStart() but BEFORE field-dependent setup
 * - Subclasses can override buildFields() to create dynamic fields
 * - All field-dependent setup methods see fields created in buildFields()
 *
 * This is the essence of TDD: Write the tests first, watch them fail,
 * then implement the code to make them pass.
 */
