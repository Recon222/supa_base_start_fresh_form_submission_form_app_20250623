/**
 * Analysis Form - Conditional Field DOM Behavior Tests
 *
 * PROPER TDD Tests for conditional field behavior in the Analysis form.
 * These tests verify that FormFieldBuilder creates the correct DOM structure
 * for conditional fields to work properly.
 *
 * Key patterns tested:
 * 1. "Other" conditionals: offenceType, videoLocation, serviceRequired
 * 2. "Locker" conditional: videoLocation -> bagNumber, lockerNumber (OPTIONAL fields)
 *
 * Note: These tests verify the DOM structure. The actual show/hide behavior
 * is handled by ConditionalFieldHandler which attaches event listeners.
 *
 * @fileoverview TDD Integration tests for conditional field DOM structure
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FormFieldBuilder } from '../../../assets/js/form-handlers/form-field-builder.js';

describe('Analysis Form Conditional Field DOM Behavior', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  /**
   * Test Suite: offenceType "Other" Conditional Structure
   *
   * When offenceType is set to "Other", the offenceTypeOther field should appear.
   * This tests the DOM structure that enables this behavior.
   */
  describe('offenceType "Other" Conditional DOM Structure', () => {
    describe('Select field structure', () => {
      it('should create offenceType select with "Other" option', () => {
        // This will FAIL because createCaseInformationSection() doesn't exist - that's TDD!
        const section = FormFieldBuilder.createCaseInformationSection();
        container.appendChild(section);

        const select = section.querySelector('#offenceType');
        expect(select).toBeTruthy();

        const otherOption = select.querySelector('option[value="Other"]');
        expect(otherOption).toBeTruthy();
      });

      it('should create offenceType select with correct ID for event binding', () => {
        const section = FormFieldBuilder.createCaseInformationSection();
        container.appendChild(section);

        const select = section.querySelector('#offenceType');
        expect(select.getAttribute('id')).toBe('offenceType');
      });
    });

    describe('Conditional group structure', () => {
      it('should create offenceTypeOtherGroup with correct ID', () => {
        const section = FormFieldBuilder.createCaseInformationSection();
        container.appendChild(section);

        const otherGroup = section.querySelector('#offenceTypeOtherGroup');
        expect(otherGroup).toBeTruthy();
      });

      it('should create offenceTypeOtherGroup with d-none class (hidden by default)', () => {
        const section = FormFieldBuilder.createCaseInformationSection();
        container.appendChild(section);

        const otherGroup = section.querySelector('#offenceTypeOtherGroup');
        expect(otherGroup.classList.contains('d-none')).toBe(true);
      });

      it('should create offenceTypeOther input inside the group', () => {
        const section = FormFieldBuilder.createCaseInformationSection();
        container.appendChild(section);

        const otherGroup = section.querySelector('#offenceTypeOtherGroup');
        const input = otherGroup.querySelector('#offenceTypeOther');
        expect(input).toBeTruthy();
      });

      it('should create offenceTypeOther input with correct name attribute', () => {
        const section = FormFieldBuilder.createCaseInformationSection();
        container.appendChild(section);

        const input = section.querySelector('#offenceTypeOther');
        expect(input.getAttribute('name')).toBe('offenceTypeOther');
      });

      it('should create offenceTypeOther WITHOUT required attribute initially', () => {
        const section = FormFieldBuilder.createCaseInformationSection();
        container.appendChild(section);

        // Required is added dynamically when "Other" is selected
        const input = section.querySelector('#offenceTypeOther');
        expect(input.hasAttribute('required')).toBe(false);
      });

      it('should create offenceTypeOther with form-control class', () => {
        const section = FormFieldBuilder.createCaseInformationSection();
        container.appendChild(section);

        const input = section.querySelector('#offenceTypeOther');
        expect(input.classList.contains('form-control')).toBe(true);
      });

      it('should create offenceTypeOther with .invalid-feedback sibling', () => {
        const section = FormFieldBuilder.createCaseInformationSection();
        container.appendChild(section);

        const otherGroup = section.querySelector('#offenceTypeOtherGroup');
        const feedback = otherGroup.querySelector('.invalid-feedback');
        expect(feedback).toBeTruthy();
      });
    });

    describe('Conditional behavior expectations', () => {
      it('should have select and group structured for ConditionalFieldHandler.setupOtherField()', () => {
        const section = FormFieldBuilder.createCaseInformationSection();
        container.appendChild(section);

        // The ConditionalFieldHandler.setupOtherField() expects:
        // - selectId: 'offenceType' (the trigger select)
        // - groupId: 'offenceTypeOtherGroup' (the group to show/hide)
        // - fieldId: 'offenceTypeOther' (the input inside the group)

        const select = section.querySelector('#offenceType');
        const group = section.querySelector('#offenceTypeOtherGroup');
        const field = section.querySelector('#offenceTypeOther');

        expect(select).toBeTruthy();
        expect(group).toBeTruthy();
        expect(field).toBeTruthy();

        // Field should be inside the group
        expect(group.contains(field)).toBe(true);
      });
    });
  });

  /**
   * Test Suite: videoLocation "Other" Conditional Structure
   *
   * When videoLocation is set to "Other", the videoLocationOther field should appear.
   */
  describe('videoLocation "Other" Conditional DOM Structure', () => {
    describe('Select field structure', () => {
      it('should create videoLocation select with "Other" option', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const select = section.querySelector('#videoLocation');
        expect(select).toBeTruthy();

        const otherOption = select.querySelector('option[value="Other"]');
        expect(otherOption).toBeTruthy();
      });

      it('should create videoLocation select with correct ID for event binding', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const select = section.querySelector('#videoLocation');
        expect(select.getAttribute('id')).toBe('videoLocation');
      });
    });

    describe('Conditional group structure', () => {
      it('should create videoLocationOtherGroup with correct ID', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const otherGroup = section.querySelector('#videoLocationOtherGroup');
        expect(otherGroup).toBeTruthy();
      });

      it('should create videoLocationOtherGroup with d-none class (hidden by default)', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const otherGroup = section.querySelector('#videoLocationOtherGroup');
        expect(otherGroup.classList.contains('d-none')).toBe(true);
      });

      it('should create videoLocationOther input inside the group', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const otherGroup = section.querySelector('#videoLocationOtherGroup');
        const input = otherGroup.querySelector('#videoLocationOther');
        expect(input).toBeTruthy();
      });

      it('should create videoLocationOther input with correct name attribute', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const input = section.querySelector('#videoLocationOther');
        expect(input.getAttribute('name')).toBe('videoLocationOther');
      });

      it('should create videoLocationOther WITHOUT required attribute initially', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const input = section.querySelector('#videoLocationOther');
        expect(input.hasAttribute('required')).toBe(false);
      });

      it('should create videoLocationOther with .invalid-feedback sibling', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const otherGroup = section.querySelector('#videoLocationOtherGroup');
        const feedback = otherGroup.querySelector('.invalid-feedback');
        expect(feedback).toBeTruthy();
      });
    });
  });

  /**
   * Test Suite: videoLocation "Locker" Conditional Structure
   *
   * When videoLocation is set to "Locker", the bagNumber and lockerNumber fields should appear.
   * CRITICAL: These fields are OPTIONAL (no required attribute).
   */
  describe('videoLocation "Locker" Conditional DOM Structure', () => {
    describe('Select field structure', () => {
      it('should create videoLocation select with "Locker" option', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const select = section.querySelector('#videoLocation');
        expect(select).toBeTruthy();

        const lockerOption = select.querySelector('option[value="Locker"]');
        expect(lockerOption).toBeTruthy();
      });
    });

    describe('Locker info group structure', () => {
      it('should create lockerInfoGroup with correct ID', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const lockerGroup = section.querySelector('#lockerInfoGroup');
        expect(lockerGroup).toBeTruthy();
      });

      it('should create lockerInfoGroup with d-none class (hidden by default)', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const lockerGroup = section.querySelector('#lockerInfoGroup');
        expect(lockerGroup.classList.contains('d-none')).toBe(true);
      });
    });

    describe('bagNumber field structure', () => {
      it('should create bagNumber input inside lockerInfoGroup', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const lockerGroup = section.querySelector('#lockerInfoGroup');
        const input = lockerGroup.querySelector('#bagNumber');
        expect(input).toBeTruthy();
      });

      it('should create bagNumber input with correct name attribute', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const input = section.querySelector('#bagNumber');
        expect(input.getAttribute('name')).toBe('bagNumber');
      });

      it('should create bagNumber WITHOUT required attribute (field is OPTIONAL)', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        // CRITICAL: bagNumber is OPTIONAL per requirements
        const input = section.querySelector('#bagNumber');
        expect(input.hasAttribute('required')).toBe(false);
      });

      it('should create bagNumber with form-control class', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const input = section.querySelector('#bagNumber');
        expect(input.classList.contains('form-control')).toBe(true);
      });

      it('should create bagNumber with .invalid-feedback sibling', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const input = section.querySelector('#bagNumber');
        const formGroup = input.closest('.form-group');
        const feedback = formGroup.querySelector('.invalid-feedback');
        expect(feedback).toBeTruthy();
      });
    });

    describe('lockerNumber field structure', () => {
      it('should create lockerNumber input inside lockerInfoGroup', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const lockerGroup = section.querySelector('#lockerInfoGroup');
        const input = lockerGroup.querySelector('#lockerNumber');
        expect(input).toBeTruthy();
      });

      it('should create lockerNumber input with correct name attribute', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const input = section.querySelector('#lockerNumber');
        expect(input.getAttribute('name')).toBe('lockerNumber');
      });

      it('should create lockerNumber WITHOUT required attribute (field is OPTIONAL)', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        // CRITICAL: lockerNumber is OPTIONAL per requirements
        const input = section.querySelector('#lockerNumber');
        expect(input.hasAttribute('required')).toBe(false);
      });

      it('should create lockerNumber as text input type', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        // Per requirements: text input, not number type
        const input = section.querySelector('#lockerNumber');
        expect(input.getAttribute('type')).toBe('text');
      });

      it('should create lockerNumber with inputmode="numeric"', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        // For mobile keyboard optimization
        const input = section.querySelector('#lockerNumber');
        expect(input.getAttribute('inputmode')).toBe('numeric');
      });

      it('should create lockerNumber with placeholder "1-28"', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const input = section.querySelector('#lockerNumber');
        expect(input.getAttribute('placeholder')).toBe('1-28');
      });

      it('should create lockerNumber with form-control class', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const input = section.querySelector('#lockerNumber');
        expect(input.classList.contains('form-control')).toBe(true);
      });

      it('should create lockerNumber with .invalid-feedback sibling', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const input = section.querySelector('#lockerNumber');
        const formGroup = input.closest('.form-group');
        const feedback = formGroup.querySelector('.invalid-feedback');
        expect(feedback).toBeTruthy();
      });
    });

    describe('Interaction between "Other" and "Locker" conditionals', () => {
      it('should have both videoLocationOtherGroup and lockerInfoGroup as separate elements', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const otherGroup = section.querySelector('#videoLocationOtherGroup');
        const lockerGroup = section.querySelector('#lockerInfoGroup');

        expect(otherGroup).toBeTruthy();
        expect(lockerGroup).toBeTruthy();

        // They should be different elements
        expect(otherGroup).not.toBe(lockerGroup);
      });

      it('should have both groups hidden by default (d-none)', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const otherGroup = section.querySelector('#videoLocationOtherGroup');
        const lockerGroup = section.querySelector('#lockerInfoGroup');

        expect(otherGroup.classList.contains('d-none')).toBe(true);
        expect(lockerGroup.classList.contains('d-none')).toBe(true);
      });

      it('should have videoLocationOther without lockerNumber/bagNumber inside', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const otherGroup = section.querySelector('#videoLocationOtherGroup');

        // Other group should NOT contain locker fields
        expect(otherGroup.querySelector('#bagNumber')).toBeNull();
        expect(otherGroup.querySelector('#lockerNumber')).toBeNull();
      });

      it('should have lockerInfoGroup without videoLocationOther inside', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const lockerGroup = section.querySelector('#lockerInfoGroup');

        // Locker group should NOT contain other field
        expect(lockerGroup.querySelector('#videoLocationOther')).toBeNull();
      });
    });
  });

  /**
   * Test Suite: serviceRequired "Other" Conditional Structure
   *
   * When serviceRequired is set to "Other", the serviceRequiredOther field should appear.
   */
  describe('serviceRequired "Other" Conditional DOM Structure', () => {
    describe('Select field structure', () => {
      it('should create serviceRequired select with "Other" option', () => {
        const section = FormFieldBuilder.createWorkRequestSection();
        container.appendChild(section);

        const select = section.querySelector('#serviceRequired');
        expect(select).toBeTruthy();

        const otherOption = select.querySelector('option[value="Other"]');
        expect(otherOption).toBeTruthy();
      });

      it('should create serviceRequired select with correct ID for event binding', () => {
        const section = FormFieldBuilder.createWorkRequestSection();
        container.appendChild(section);

        const select = section.querySelector('#serviceRequired');
        expect(select.getAttribute('id')).toBe('serviceRequired');
      });
    });

    describe('Conditional group structure', () => {
      it('should create serviceRequiredOtherGroup with correct ID', () => {
        const section = FormFieldBuilder.createWorkRequestSection();
        container.appendChild(section);

        const otherGroup = section.querySelector('#serviceRequiredOtherGroup');
        expect(otherGroup).toBeTruthy();
      });

      it('should create serviceRequiredOtherGroup with d-none class (hidden by default)', () => {
        const section = FormFieldBuilder.createWorkRequestSection();
        container.appendChild(section);

        const otherGroup = section.querySelector('#serviceRequiredOtherGroup');
        expect(otherGroup.classList.contains('d-none')).toBe(true);
      });

      it('should create serviceRequiredOther input inside the group', () => {
        const section = FormFieldBuilder.createWorkRequestSection();
        container.appendChild(section);

        const otherGroup = section.querySelector('#serviceRequiredOtherGroup');
        const input = otherGroup.querySelector('#serviceRequiredOther');
        expect(input).toBeTruthy();
      });

      it('should create serviceRequiredOther input with correct name attribute', () => {
        const section = FormFieldBuilder.createWorkRequestSection();
        container.appendChild(section);

        const input = section.querySelector('#serviceRequiredOther');
        expect(input.getAttribute('name')).toBe('serviceRequiredOther');
      });

      it('should create serviceRequiredOther WITHOUT required attribute initially', () => {
        const section = FormFieldBuilder.createWorkRequestSection();
        container.appendChild(section);

        const input = section.querySelector('#serviceRequiredOther');
        expect(input.hasAttribute('required')).toBe(false);
      });

      it('should create serviceRequiredOther with .invalid-feedback sibling', () => {
        const section = FormFieldBuilder.createWorkRequestSection();
        container.appendChild(section);

        const otherGroup = section.querySelector('#serviceRequiredOtherGroup');
        const feedback = otherGroup.querySelector('.invalid-feedback');
        expect(feedback).toBeTruthy();
      });
    });
  });

  /**
   * Test Suite: ConditionalFieldHandler Integration Requirements
   *
   * Documents the expected calls that AnalysisFormHandler should make
   * to ConditionalFieldHandler for setting up conditional fields.
   */
  describe('ConditionalFieldHandler Integration Requirements', () => {
    describe('setupOtherField() calls', () => {
      it('should support offenceType "Other" pattern: setupOtherField("offenceType", "offenceTypeOtherGroup", "offenceTypeOther")', () => {
        const section = FormFieldBuilder.createCaseInformationSection();
        container.appendChild(section);

        // Verify DOM structure supports this pattern
        const select = section.querySelector('#offenceType');
        const group = section.querySelector('#offenceTypeOtherGroup');
        const field = section.querySelector('#offenceTypeOther');

        expect(select).toBeTruthy();
        expect(group).toBeTruthy();
        expect(field).toBeTruthy();
        expect(select.querySelector('option[value="Other"]')).toBeTruthy();
      });

      it('should support videoLocation "Other" pattern: setupOtherField("videoLocation", "videoLocationOtherGroup", "videoLocationOther")', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        // Verify DOM structure supports this pattern
        const select = section.querySelector('#videoLocation');
        const group = section.querySelector('#videoLocationOtherGroup');
        const field = section.querySelector('#videoLocationOther');

        expect(select).toBeTruthy();
        expect(group).toBeTruthy();
        expect(field).toBeTruthy();
        expect(select.querySelector('option[value="Other"]')).toBeTruthy();
      });

      it('should support serviceRequired "Other" pattern: setupOtherField("serviceRequired", "serviceRequiredOtherGroup", "serviceRequiredOther")', () => {
        const section = FormFieldBuilder.createWorkRequestSection();
        container.appendChild(section);

        // Verify DOM structure supports this pattern
        const select = section.querySelector('#serviceRequired');
        const group = section.querySelector('#serviceRequiredOtherGroup');
        const field = section.querySelector('#serviceRequiredOther');

        expect(select).toBeTruthy();
        expect(group).toBeTruthy();
        expect(field).toBeTruthy();
        expect(select.querySelector('option[value="Other"]')).toBeTruthy();
      });
    });

    describe('Custom "Locker" conditional', () => {
      it('should support videoLocation "Locker" pattern with lockerInfoGroup', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        // The "Locker" conditional is handled by custom code, not setupOtherField()
        // It needs:
        // - videoLocation select with "Locker" option
        // - lockerInfoGroup containing bagNumber and lockerNumber

        const select = section.querySelector('#videoLocation');
        const lockerGroup = section.querySelector('#lockerInfoGroup');
        const bagNumber = section.querySelector('#bagNumber');
        const lockerNumber = section.querySelector('#lockerNumber');

        expect(select).toBeTruthy();
        expect(select.querySelector('option[value="Locker"]')).toBeTruthy();
        expect(lockerGroup).toBeTruthy();
        expect(bagNumber).toBeTruthy();
        expect(lockerNumber).toBeTruthy();

        // Both fields should be inside lockerInfoGroup
        expect(lockerGroup.contains(bagNumber)).toBe(true);
        expect(lockerGroup.contains(lockerNumber)).toBe(true);
      });
    });
  });

  /**
   * Test Suite: toggleElement Utility Usage
   *
   * Documents the expected behavior when toggleElement is called.
   */
  describe('toggleElement Utility Usage', () => {
    describe('CSS class-based hiding', () => {
      it('should use d-none class for hiding (not inline style)', () => {
        const section = FormFieldBuilder.createCaseInformationSection();
        container.appendChild(section);

        const otherGroup = section.querySelector('#offenceTypeOtherGroup');

        // Should use class-based hiding
        expect(otherGroup.classList.contains('d-none')).toBe(true);

        // Should NOT use inline display style for initial state
        expect(otherGroup.style.display).not.toBe('none');
      });

      it('should have consistent d-none usage across all conditional groups', () => {
        const caseSection = FormFieldBuilder.createCaseInformationSection();
        const videoSection = FormFieldBuilder.createVideoSourceSection();
        const workSection = FormFieldBuilder.createWorkRequestSection();

        container.appendChild(caseSection);
        container.appendChild(videoSection);
        container.appendChild(workSection);

        const conditionalGroups = [
          container.querySelector('#offenceTypeOtherGroup'),
          container.querySelector('#videoLocationOtherGroup'),
          container.querySelector('#lockerInfoGroup'),
          container.querySelector('#serviceRequiredOtherGroup')
        ];

        conditionalGroups.forEach(group => {
          expect(group).toBeTruthy();
          expect(group.classList.contains('d-none')).toBe(true);
        });
      });
    });
  });

  /**
   * Test Suite: Form Submission with Conditional Fields
   *
   * Tests that conditional fields have correct attributes for form submission.
   */
  describe('Form Submission with Conditional Fields', () => {
    describe('Field names for form serialization', () => {
      it('should have all conditional fields with correct name attributes', () => {
        const caseSection = FormFieldBuilder.createCaseInformationSection();
        const videoSection = FormFieldBuilder.createVideoSourceSection();
        const workSection = FormFieldBuilder.createWorkRequestSection();

        container.appendChild(caseSection);
        container.appendChild(videoSection);
        container.appendChild(workSection);

        // Verify all conditional fields have name attributes
        const conditionalFieldNames = [
          'offenceTypeOther',
          'videoLocationOther',
          'bagNumber',
          'lockerNumber',
          'serviceRequiredOther'
        ];

        conditionalFieldNames.forEach(name => {
          const field = container.querySelector(`[name="${name}"]`);
          expect(field, `Field with name="${name}" should exist`).toBeTruthy();
        });
      });
    });

    describe('Required attribute management', () => {
      it('should have all conditional text fields WITHOUT required initially', () => {
        const caseSection = FormFieldBuilder.createCaseInformationSection();
        const videoSection = FormFieldBuilder.createVideoSourceSection();
        const workSection = FormFieldBuilder.createWorkRequestSection();

        container.appendChild(caseSection);
        container.appendChild(videoSection);
        container.appendChild(workSection);

        // These fields should NOT have required initially
        // Required is added dynamically when the trigger condition is met
        const conditionalFields = [
          '#offenceTypeOther',
          '#videoLocationOther',
          '#serviceRequiredOther'
        ];

        conditionalFields.forEach(selector => {
          const field = container.querySelector(selector);
          expect(field.hasAttribute('required'), `${selector} should NOT have required initially`).toBe(false);
        });
      });

      it('should have bagNumber and lockerNumber NEVER have required (always optional)', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        // These fields are ALWAYS optional, even when visible
        const bagNumber = section.querySelector('#bagNumber');
        const lockerNumber = section.querySelector('#lockerNumber');

        expect(bagNumber.hasAttribute('required')).toBe(false);
        expect(lockerNumber.hasAttribute('required')).toBe(false);
      });
    });
  });
});

/**
 * Summary of Conditional Field Requirements
 *
 * offenceType "Other" Pattern:
 * - Trigger: #offenceType select with value "Other"
 * - Group: #offenceTypeOtherGroup (hidden by default with d-none)
 * - Field: #offenceTypeOther (name="offenceTypeOther", no initial required)
 * - Action: Show group, add required to field
 *
 * videoLocation "Other" Pattern:
 * - Trigger: #videoLocation select with value "Other"
 * - Group: #videoLocationOtherGroup (hidden by default with d-none)
 * - Field: #videoLocationOther (name="videoLocationOther", no initial required)
 * - Action: Show group, add required to field
 *
 * videoLocation "Locker" Pattern (SPECIAL):
 * - Trigger: #videoLocation select with value "Locker"
 * - Group: #lockerInfoGroup (hidden by default with d-none)
 * - Fields:
 *   - #bagNumber (name="bagNumber", ALWAYS optional - no required)
 *   - #lockerNumber (name="lockerNumber", ALWAYS optional - no required, type="text", inputmode="numeric", placeholder="1-28")
 * - Action: Show group only (DO NOT add required)
 *
 * serviceRequired "Other" Pattern:
 * - Trigger: #serviceRequired select with value "Other"
 * - Group: #serviceRequiredOtherGroup (hidden by default with d-none)
 * - Field: #serviceRequiredOther (name="serviceRequiredOther", no initial required)
 * - Action: Show group, add required to field
 *
 * ConditionalFieldHandler Calls (in AnalysisFormHandler.setupAnalysisSpecificListeners()):
 * ```javascript
 * conditionalHandler.setupOtherField('offenceType', 'offenceTypeOtherGroup', 'offenceTypeOther');
 * conditionalHandler.setupOtherField('videoLocation', 'videoLocationOtherGroup', 'videoLocationOther');
 * conditionalHandler.setupOtherField('serviceRequired', 'serviceRequiredOtherGroup', 'serviceRequiredOther');
 *
 * // Custom handler for "Locker" (NOT setupOtherField)
 * videoLocationSelect.addEventListener('change', (e) => {
 *   const showLocker = e.target.value === 'Locker';
 *   toggleElement(lockerInfoGroup, showLocker);
 *   // Note: DO NOT add required to bagNumber or lockerNumber
 * });
 * ```
 */
