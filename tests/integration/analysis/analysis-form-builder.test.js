/**
 * Analysis Form - FormFieldBuilder Integration Tests
 *
 * PROPER TDD Tests that call actual FormFieldBuilder methods and verify DOM output.
 * These tests will FAIL because the methods don't exist yet - that's the RED phase.
 *
 * Tests verify:
 * 1. createCaseInformationSection() generates correct DOM structure
 * 2. createVideoSourceSection() generates correct DOM structure
 * 3. createWorkRequestSection() generates correct DOM structure
 * 4. createInvestigatorSection() generates correct DOM structure
 * 5. All fields have correct IDs, names, required attributes
 * 6. All fields have .invalid-feedback sibling for validation UI
 *
 * @fileoverview TDD Integration tests for Analysis form section builders
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FormFieldBuilder } from '../../../assets/js/form-handlers/form-field-builder.js';
import { CONFIG } from '../../../assets/js/config.js';

describe('FormFieldBuilder - Analysis Form Sections', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  /**
   * Test Suite: createCaseInformationSection()
   *
   * This section should contain:
   * - Occurrence Number (occNumber) - required
   * - Type of Offence (offenceType) - required, with "Other" conditional
   * - Offence Type Other (offenceTypeOther) - conditional, hidden by default
   */
  describe('createCaseInformationSection()', () => {
    describe('Section structure', () => {
      it('should create a form section with correct class', () => {
        // This will FAIL because createCaseInformationSection() doesn't exist - that's TDD!
        const section = FormFieldBuilder.createCaseInformationSection();
        container.appendChild(section);

        expect(section).toBeTruthy();
        expect(section.classList.contains('form-section')).toBe(true);
      });

      it('should include section heading with text "Case Information"', () => {
        const section = FormFieldBuilder.createCaseInformationSection();
        container.appendChild(section);

        const heading = section.querySelector('h2');
        expect(heading).toBeTruthy();
        expect(heading.textContent).toContain('Case Information');
      });
    });

    describe('Occurrence Number field', () => {
      it('should create occNumber input with correct ID', () => {
        const section = FormFieldBuilder.createCaseInformationSection();
        container.appendChild(section);

        const input = section.querySelector('#occNumber');
        expect(input).toBeTruthy();
      });

      it('should create occNumber input with correct name attribute', () => {
        const section = FormFieldBuilder.createCaseInformationSection();
        container.appendChild(section);

        const input = section.querySelector('#occNumber');
        expect(input.getAttribute('name')).toBe('occNumber');
      });

      it('should create occNumber input with required attribute', () => {
        const section = FormFieldBuilder.createCaseInformationSection();
        container.appendChild(section);

        const input = section.querySelector('#occNumber');
        expect(input.hasAttribute('required')).toBe(true);
      });

      it('should create occNumber input with placeholder', () => {
        const section = FormFieldBuilder.createCaseInformationSection();
        container.appendChild(section);

        const input = section.querySelector('#occNumber');
        expect(input.getAttribute('placeholder')).toBeTruthy();
        // Placeholder should indicate PR format (e.g., "PR2024001234" or similar)
        expect(input.getAttribute('placeholder')).toMatch(/PR/i);
      });

      it('should create occNumber with .invalid-feedback sibling', () => {
        const section = FormFieldBuilder.createCaseInformationSection();
        container.appendChild(section);

        const input = section.querySelector('#occNumber');
        const formGroup = input.closest('.form-group');
        const feedback = formGroup.querySelector('.invalid-feedback');
        expect(feedback).toBeTruthy();
      });

      it('should create occNumber with label containing asterisk for required', () => {
        const section = FormFieldBuilder.createCaseInformationSection();
        container.appendChild(section);

        const label = section.querySelector('label[for="occNumber"]');
        expect(label).toBeTruthy();
        expect(label.innerHTML).toContain('<span class="required">*</span>');
      });

      it('should create occNumber input with form-control class', () => {
        const section = FormFieldBuilder.createCaseInformationSection();
        container.appendChild(section);

        const input = section.querySelector('#occNumber');
        expect(input.classList.contains('form-control')).toBe(true);
      });
    });

    describe('Offence Type field', () => {
      it('should create offenceType select with correct ID', () => {
        const section = FormFieldBuilder.createCaseInformationSection();
        container.appendChild(section);

        const select = section.querySelector('#offenceType');
        expect(select).toBeTruthy();
        expect(select.tagName.toLowerCase()).toBe('select');
      });

      it('should create offenceType select with correct name attribute', () => {
        const section = FormFieldBuilder.createCaseInformationSection();
        container.appendChild(section);

        const select = section.querySelector('#offenceType');
        expect(select.getAttribute('name')).toBe('offenceType');
      });

      it('should create offenceType select with required attribute', () => {
        const section = FormFieldBuilder.createCaseInformationSection();
        container.appendChild(section);

        const select = section.querySelector('#offenceType');
        expect(select.hasAttribute('required')).toBe(true);
      });

      it('should create offenceType select with correct options from CONFIG', () => {
        const section = FormFieldBuilder.createCaseInformationSection();
        container.appendChild(section);

        const select = section.querySelector('#offenceType');
        const options = Array.from(select.querySelectorAll('option'));

        // Should have options from CONFIG.OFFENCE_TYPE_OPTIONS
        expect(options.length).toBe(CONFIG.OFFENCE_TYPE_OPTIONS.length);

        // Verify specific options exist
        const optionValues = options.map(opt => opt.value);
        expect(optionValues).toContain('Homicide');
        expect(optionValues).toContain('Missing Person');
        expect(optionValues).toContain('Other');
      });

      it('should create offenceType with .invalid-feedback sibling', () => {
        const section = FormFieldBuilder.createCaseInformationSection();
        container.appendChild(section);

        const select = section.querySelector('#offenceType');
        const formGroup = select.closest('.form-group');
        const feedback = formGroup.querySelector('.invalid-feedback');
        expect(feedback).toBeTruthy();
      });

      it('should create offenceType select with form-control class', () => {
        const section = FormFieldBuilder.createCaseInformationSection();
        container.appendChild(section);

        const select = section.querySelector('#offenceType');
        expect(select.classList.contains('form-control')).toBe(true);
      });
    });

    describe('Offence Type Other field (conditional)', () => {
      it('should create offenceTypeOther group with correct ID', () => {
        const section = FormFieldBuilder.createCaseInformationSection();
        container.appendChild(section);

        const otherGroup = section.querySelector('#offenceTypeOtherGroup');
        expect(otherGroup).toBeTruthy();
      });

      it('should create offenceTypeOther group hidden by default (d-none class)', () => {
        const section = FormFieldBuilder.createCaseInformationSection();
        container.appendChild(section);

        const otherGroup = section.querySelector('#offenceTypeOtherGroup');
        expect(otherGroup.classList.contains('d-none')).toBe(true);
      });

      it('should create offenceTypeOther input with correct ID', () => {
        const section = FormFieldBuilder.createCaseInformationSection();
        container.appendChild(section);

        const input = section.querySelector('#offenceTypeOther');
        expect(input).toBeTruthy();
      });

      it('should create offenceTypeOther input with correct name attribute', () => {
        const section = FormFieldBuilder.createCaseInformationSection();
        container.appendChild(section);

        const input = section.querySelector('#offenceTypeOther');
        expect(input.getAttribute('name')).toBe('offenceTypeOther');
      });

      it('should create offenceTypeOther input WITHOUT required attribute initially', () => {
        const section = FormFieldBuilder.createCaseInformationSection();
        container.appendChild(section);

        // Required is added dynamically when "Other" is selected, not initially
        const input = section.querySelector('#offenceTypeOther');
        expect(input.hasAttribute('required')).toBe(false);
      });

      it('should create offenceTypeOther with .invalid-feedback sibling', () => {
        const section = FormFieldBuilder.createCaseInformationSection();
        container.appendChild(section);

        const input = section.querySelector('#offenceTypeOther');
        const formGroup = input.closest('.form-group') || input.closest('[id="offenceTypeOtherGroup"]');
        const feedback = formGroup.querySelector('.invalid-feedback');
        expect(feedback).toBeTruthy();
      });

      it('should create offenceTypeOther input with form-control class', () => {
        const section = FormFieldBuilder.createCaseInformationSection();
        container.appendChild(section);

        const input = section.querySelector('#offenceTypeOther');
        expect(input.classList.contains('form-control')).toBe(true);
      });
    });
  });

  /**
   * Test Suite: createVideoSourceSection()
   *
   * This section should contain:
   * - Video Location (videoLocation) - required, with "Other" and "Locker" conditionals
   * - Video Location Other (videoLocationOther) - conditional, hidden by default
   * - Locker Info Group (bagNumber, lockerNumber) - conditional, hidden by default, OPTIONAL fields
   * - Video Seized From (videoSeizedFrom) - optional
   * - Recording Date (recordingDate) - optional, past date validation
   */
  describe('createVideoSourceSection()', () => {
    describe('Section structure', () => {
      it('should create a form section with correct class', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        expect(section).toBeTruthy();
        expect(section.classList.contains('form-section')).toBe(true);
      });

      it('should include section heading with text "Video Source Information"', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const heading = section.querySelector('h2');
        expect(heading).toBeTruthy();
        expect(heading.textContent).toContain('Video Source Information');
      });
    });

    describe('Video Location field', () => {
      it('should create videoLocation select with correct ID', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const select = section.querySelector('#videoLocation');
        expect(select).toBeTruthy();
        expect(select.tagName.toLowerCase()).toBe('select');
      });

      it('should create videoLocation select with correct name attribute', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const select = section.querySelector('#videoLocation');
        expect(select.getAttribute('name')).toBe('videoLocation');
      });

      it('should create videoLocation select with required attribute', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const select = section.querySelector('#videoLocation');
        expect(select.hasAttribute('required')).toBe(true);
      });

      it('should create videoLocation select with correct options from CONFIG', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const select = section.querySelector('#videoLocation');
        const options = Array.from(select.querySelectorAll('option'));

        // Should have options from CONFIG.VIDEO_LOCATION_OPTIONS
        expect(options.length).toBe(CONFIG.VIDEO_LOCATION_OPTIONS.length);

        // Verify key options exist
        const optionValues = options.map(opt => opt.value);
        expect(optionValues).toContain('Locker');
        expect(optionValues).toContain('Other');
        expect(optionValues).toContain('NAS Storage');
      });

      it('should create videoLocation with .invalid-feedback sibling', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const select = section.querySelector('#videoLocation');
        const formGroup = select.closest('.form-group');
        const feedback = formGroup.querySelector('.invalid-feedback');
        expect(feedback).toBeTruthy();
      });

      it('should create videoLocation select with form-control class', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const select = section.querySelector('#videoLocation');
        expect(select.classList.contains('form-control')).toBe(true);
      });
    });

    describe('Video Location Other field (conditional)', () => {
      it('should create videoLocationOther group with correct ID', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const otherGroup = section.querySelector('#videoLocationOtherGroup');
        expect(otherGroup).toBeTruthy();
      });

      it('should create videoLocationOther group hidden by default (d-none class)', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const otherGroup = section.querySelector('#videoLocationOtherGroup');
        expect(otherGroup.classList.contains('d-none')).toBe(true);
      });

      it('should create videoLocationOther input with correct ID', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const input = section.querySelector('#videoLocationOther');
        expect(input).toBeTruthy();
      });

      it('should create videoLocationOther input with correct name attribute', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const input = section.querySelector('#videoLocationOther');
        expect(input.getAttribute('name')).toBe('videoLocationOther');
      });

      it('should create videoLocationOther with .invalid-feedback sibling', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const input = section.querySelector('#videoLocationOther');
        const formGroup = input.closest('.form-group') || input.closest('[id="videoLocationOtherGroup"]');
        const feedback = formGroup.querySelector('.invalid-feedback');
        expect(feedback).toBeTruthy();
      });
    });

    describe('Locker Info Group (conditional)', () => {
      it('should create lockerInfoGroup with correct ID', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const lockerGroup = section.querySelector('#lockerInfoGroup');
        expect(lockerGroup).toBeTruthy();
      });

      it('should create lockerInfoGroup hidden by default (d-none class)', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const lockerGroup = section.querySelector('#lockerInfoGroup');
        expect(lockerGroup.classList.contains('d-none')).toBe(true);
      });

      it('should create bagNumber input with correct ID', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const input = section.querySelector('#bagNumber');
        expect(input).toBeTruthy();
      });

      it('should create bagNumber input with correct name attribute', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const input = section.querySelector('#bagNumber');
        expect(input.getAttribute('name')).toBe('bagNumber');
      });

      it('should create bagNumber input WITHOUT required attribute (field is OPTIONAL)', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        // CRITICAL: bagNumber is OPTIONAL, must NOT have required attribute
        const input = section.querySelector('#bagNumber');
        expect(input.hasAttribute('required')).toBe(false);
      });

      it('should create lockerNumber input with correct ID', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const input = section.querySelector('#lockerNumber');
        expect(input).toBeTruthy();
      });

      it('should create lockerNumber input with correct name attribute', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const input = section.querySelector('#lockerNumber');
        expect(input.getAttribute('name')).toBe('lockerNumber');
      });

      it('should create lockerNumber input WITHOUT required attribute (field is OPTIONAL)', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        // CRITICAL: lockerNumber is OPTIONAL, must NOT have required attribute
        const input = section.querySelector('#lockerNumber');
        expect(input.hasAttribute('required')).toBe(false);
      });

      it('should create lockerNumber as text input (not number type)', () => {
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

      it('should create bagNumber with .invalid-feedback sibling', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const input = section.querySelector('#bagNumber');
        const formGroup = input.closest('.form-group');
        const feedback = formGroup.querySelector('.invalid-feedback');
        expect(feedback).toBeTruthy();
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

    describe('Video Seized From field', () => {
      it('should create videoSeizedFrom input with correct ID', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const input = section.querySelector('#videoSeizedFrom');
        expect(input).toBeTruthy();
      });

      it('should create videoSeizedFrom input with correct name attribute', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const input = section.querySelector('#videoSeizedFrom');
        expect(input.getAttribute('name')).toBe('videoSeizedFrom');
      });

      it('should create videoSeizedFrom WITHOUT required attribute (optional field)', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const input = section.querySelector('#videoSeizedFrom');
        expect(input.hasAttribute('required')).toBe(false);
      });
    });

    describe('Recording Date field', () => {
      it('should create recordingDate input with correct ID', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const input = section.querySelector('#recordingDate');
        expect(input).toBeTruthy();
      });

      it('should create recordingDate input with correct name attribute', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const input = section.querySelector('#recordingDate');
        expect(input.getAttribute('name')).toBe('recordingDate');
      });

      it('should create recordingDate as text input type for Flatpickr', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const input = section.querySelector('#recordingDate');
        expect(input.getAttribute('type')).toBe('text');
      });

      it('should create recordingDate WITHOUT required attribute (optional field)', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const input = section.querySelector('#recordingDate');
        expect(input.hasAttribute('required')).toBe(false);
      });

      it('should create recordingDate with .invalid-feedback sibling', () => {
        const section = FormFieldBuilder.createVideoSourceSection();
        container.appendChild(section);

        const input = section.querySelector('#recordingDate');
        const formGroup = input.closest('.form-group');
        const feedback = formGroup.querySelector('.invalid-feedback');
        expect(feedback).toBeTruthy();
      });
    });
  });

  /**
   * Test Suite: createWorkRequestSection()
   *
   * This section should contain:
   * - Job Required (jobRequired) - required, textarea
   * - File Names (fileNames) - required, textarea
   * - Service Required (serviceRequired) - required, with "Other" conditional
   * - Service Required Other (serviceRequiredOther) - conditional, hidden by default
   * - Request Details (requestDetails) - required, textarea
   * - Additional Information (additionalInfo) - optional, textarea
   */
  describe('createWorkRequestSection()', () => {
    describe('Section structure', () => {
      it('should create a form section with correct class', () => {
        const section = FormFieldBuilder.createWorkRequestSection();
        container.appendChild(section);

        expect(section).toBeTruthy();
        expect(section.classList.contains('form-section')).toBe(true);
      });

      it('should include section heading with text "Work Request"', () => {
        const section = FormFieldBuilder.createWorkRequestSection();
        container.appendChild(section);

        const heading = section.querySelector('h2');
        expect(heading).toBeTruthy();
        expect(heading.textContent).toContain('Work Request');
      });
    });

    describe('Job Required field', () => {
      it('should create jobRequired textarea with correct ID', () => {
        const section = FormFieldBuilder.createWorkRequestSection();
        container.appendChild(section);

        const textarea = section.querySelector('#jobRequired');
        expect(textarea).toBeTruthy();
        expect(textarea.tagName.toLowerCase()).toBe('textarea');
      });

      it('should create jobRequired textarea with correct name attribute', () => {
        const section = FormFieldBuilder.createWorkRequestSection();
        container.appendChild(section);

        const textarea = section.querySelector('#jobRequired');
        expect(textarea.getAttribute('name')).toBe('jobRequired');
      });

      it('should create jobRequired textarea with required attribute', () => {
        const section = FormFieldBuilder.createWorkRequestSection();
        container.appendChild(section);

        const textarea = section.querySelector('#jobRequired');
        expect(textarea.hasAttribute('required')).toBe(true);
      });

      it('should create jobRequired with .invalid-feedback sibling', () => {
        const section = FormFieldBuilder.createWorkRequestSection();
        container.appendChild(section);

        const textarea = section.querySelector('#jobRequired');
        const formGroup = textarea.closest('.form-group');
        const feedback = formGroup.querySelector('.invalid-feedback');
        expect(feedback).toBeTruthy();
      });

      it('should create jobRequired textarea with form-control class', () => {
        const section = FormFieldBuilder.createWorkRequestSection();
        container.appendChild(section);

        const textarea = section.querySelector('#jobRequired');
        expect(textarea.classList.contains('form-control')).toBe(true);
      });
    });

    describe('File Names field', () => {
      it('should create fileNames textarea with correct ID', () => {
        const section = FormFieldBuilder.createWorkRequestSection();
        container.appendChild(section);

        const textarea = section.querySelector('#fileNames');
        expect(textarea).toBeTruthy();
        expect(textarea.tagName.toLowerCase()).toBe('textarea');
      });

      it('should create fileNames textarea with correct name attribute', () => {
        const section = FormFieldBuilder.createWorkRequestSection();
        container.appendChild(section);

        const textarea = section.querySelector('#fileNames');
        expect(textarea.getAttribute('name')).toBe('fileNames');
      });

      it('should create fileNames textarea with required attribute', () => {
        const section = FormFieldBuilder.createWorkRequestSection();
        container.appendChild(section);

        const textarea = section.querySelector('#fileNames');
        expect(textarea.hasAttribute('required')).toBe(true);
      });

      it('should create fileNames with .invalid-feedback sibling', () => {
        const section = FormFieldBuilder.createWorkRequestSection();
        container.appendChild(section);

        const textarea = section.querySelector('#fileNames');
        const formGroup = textarea.closest('.form-group');
        const feedback = formGroup.querySelector('.invalid-feedback');
        expect(feedback).toBeTruthy();
      });
    });

    describe('Service Required field', () => {
      it('should create serviceRequired select with correct ID', () => {
        const section = FormFieldBuilder.createWorkRequestSection();
        container.appendChild(section);

        const select = section.querySelector('#serviceRequired');
        expect(select).toBeTruthy();
        expect(select.tagName.toLowerCase()).toBe('select');
      });

      it('should create serviceRequired select with correct name attribute', () => {
        const section = FormFieldBuilder.createWorkRequestSection();
        container.appendChild(section);

        const select = section.querySelector('#serviceRequired');
        expect(select.getAttribute('name')).toBe('serviceRequired');
      });

      it('should create serviceRequired select with required attribute', () => {
        const section = FormFieldBuilder.createWorkRequestSection();
        container.appendChild(section);

        const select = section.querySelector('#serviceRequired');
        expect(select.hasAttribute('required')).toBe(true);
      });

      it('should create serviceRequired select with correct options from CONFIG', () => {
        const section = FormFieldBuilder.createWorkRequestSection();
        container.appendChild(section);

        const select = section.querySelector('#serviceRequired');
        const options = Array.from(select.querySelectorAll('option'));

        // Should have options from CONFIG.SERVICE_REQUIRED_OPTIONS
        expect(options.length).toBe(CONFIG.SERVICE_REQUIRED_OPTIONS.length);

        // Verify key options exist
        const optionValues = options.map(opt => opt.value);
        expect(optionValues).toContain('Video/Image Clarification');
        expect(optionValues).toContain('Other');
      });

      it('should create serviceRequired with .invalid-feedback sibling', () => {
        const section = FormFieldBuilder.createWorkRequestSection();
        container.appendChild(section);

        const select = section.querySelector('#serviceRequired');
        const formGroup = select.closest('.form-group');
        const feedback = formGroup.querySelector('.invalid-feedback');
        expect(feedback).toBeTruthy();
      });
    });

    describe('Service Required Other field (conditional)', () => {
      it('should create serviceRequiredOther group with correct ID', () => {
        const section = FormFieldBuilder.createWorkRequestSection();
        container.appendChild(section);

        const otherGroup = section.querySelector('#serviceRequiredOtherGroup');
        expect(otherGroup).toBeTruthy();
      });

      it('should create serviceRequiredOther group hidden by default (d-none class)', () => {
        const section = FormFieldBuilder.createWorkRequestSection();
        container.appendChild(section);

        const otherGroup = section.querySelector('#serviceRequiredOtherGroup');
        expect(otherGroup.classList.contains('d-none')).toBe(true);
      });

      it('should create serviceRequiredOther input with correct ID', () => {
        const section = FormFieldBuilder.createWorkRequestSection();
        container.appendChild(section);

        const input = section.querySelector('#serviceRequiredOther');
        expect(input).toBeTruthy();
      });

      it('should create serviceRequiredOther input with correct name attribute', () => {
        const section = FormFieldBuilder.createWorkRequestSection();
        container.appendChild(section);

        const input = section.querySelector('#serviceRequiredOther');
        expect(input.getAttribute('name')).toBe('serviceRequiredOther');
      });

      it('should create serviceRequiredOther with .invalid-feedback sibling', () => {
        const section = FormFieldBuilder.createWorkRequestSection();
        container.appendChild(section);

        const input = section.querySelector('#serviceRequiredOther');
        const formGroup = input.closest('.form-group') || input.closest('[id="serviceRequiredOtherGroup"]');
        const feedback = formGroup.querySelector('.invalid-feedback');
        expect(feedback).toBeTruthy();
      });
    });

    describe('Request Details field', () => {
      it('should create requestDetails textarea with correct ID', () => {
        const section = FormFieldBuilder.createWorkRequestSection();
        container.appendChild(section);

        const textarea = section.querySelector('#requestDetails');
        expect(textarea).toBeTruthy();
        expect(textarea.tagName.toLowerCase()).toBe('textarea');
      });

      it('should create requestDetails textarea with correct name attribute', () => {
        const section = FormFieldBuilder.createWorkRequestSection();
        container.appendChild(section);

        const textarea = section.querySelector('#requestDetails');
        expect(textarea.getAttribute('name')).toBe('requestDetails');
      });

      it('should create requestDetails textarea with required attribute', () => {
        const section = FormFieldBuilder.createWorkRequestSection();
        container.appendChild(section);

        const textarea = section.querySelector('#requestDetails');
        expect(textarea.hasAttribute('required')).toBe(true);
      });

      it('should create requestDetails with .invalid-feedback sibling', () => {
        const section = FormFieldBuilder.createWorkRequestSection();
        container.appendChild(section);

        const textarea = section.querySelector('#requestDetails');
        const formGroup = textarea.closest('.form-group');
        const feedback = formGroup.querySelector('.invalid-feedback');
        expect(feedback).toBeTruthy();
      });
    });

    describe('Additional Information field', () => {
      it('should create additionalInfo textarea with correct ID', () => {
        const section = FormFieldBuilder.createWorkRequestSection();
        container.appendChild(section);

        const textarea = section.querySelector('#additionalInfo');
        expect(textarea).toBeTruthy();
        expect(textarea.tagName.toLowerCase()).toBe('textarea');
      });

      it('should create additionalInfo textarea with correct name attribute', () => {
        const section = FormFieldBuilder.createWorkRequestSection();
        container.appendChild(section);

        const textarea = section.querySelector('#additionalInfo');
        expect(textarea.getAttribute('name')).toBe('additionalInfo');
      });

      it('should create additionalInfo WITHOUT required attribute (optional field)', () => {
        const section = FormFieldBuilder.createWorkRequestSection();
        container.appendChild(section);

        const textarea = section.querySelector('#additionalInfo');
        expect(textarea.hasAttribute('required')).toBe(false);
      });

      it('should create additionalInfo with .invalid-feedback sibling', () => {
        const section = FormFieldBuilder.createWorkRequestSection();
        container.appendChild(section);

        const textarea = section.querySelector('#additionalInfo');
        const formGroup = textarea.closest('.form-group');
        const feedback = formGroup.querySelector('.invalid-feedback');
        expect(feedback).toBeTruthy();
      });
    });
  });

  /**
   * Test Suite: createInvestigatorSection()
   *
   * This section should contain:
   * - Investigator Name (rName) - required
   * - Badge Number (badge) - required
   * - Contact Phone (requestingPhone) - required, tel type
   * - Email Address (requestingEmail) - required, email type
   */
  describe('createInvestigatorSection()', () => {
    describe('Section structure', () => {
      it('should create a form section with correct class', () => {
        const section = FormFieldBuilder.createInvestigatorSection();
        container.appendChild(section);

        expect(section).toBeTruthy();
        expect(section.classList.contains('form-section')).toBe(true);
      });

      it('should include section heading with text containing "Investigator"', () => {
        const section = FormFieldBuilder.createInvestigatorSection();
        container.appendChild(section);

        const heading = section.querySelector('h2');
        expect(heading).toBeTruthy();
        expect(heading.textContent.toLowerCase()).toContain('investigator');
      });
    });

    describe('Investigator Name field', () => {
      it('should create rName input with correct ID', () => {
        const section = FormFieldBuilder.createInvestigatorSection();
        container.appendChild(section);

        const input = section.querySelector('#rName');
        expect(input).toBeTruthy();
      });

      it('should create rName input with correct name attribute', () => {
        const section = FormFieldBuilder.createInvestigatorSection();
        container.appendChild(section);

        const input = section.querySelector('#rName');
        expect(input.getAttribute('name')).toBe('rName');
      });

      it('should create rName input with required attribute', () => {
        const section = FormFieldBuilder.createInvestigatorSection();
        container.appendChild(section);

        const input = section.querySelector('#rName');
        expect(input.hasAttribute('required')).toBe(true);
      });

      it('should create rName with .invalid-feedback sibling', () => {
        const section = FormFieldBuilder.createInvestigatorSection();
        container.appendChild(section);

        const input = section.querySelector('#rName');
        const formGroup = input.closest('.form-group');
        const feedback = formGroup.querySelector('.invalid-feedback');
        expect(feedback).toBeTruthy();
      });
    });

    describe('Badge Number field', () => {
      it('should create badge input with correct ID', () => {
        const section = FormFieldBuilder.createInvestigatorSection();
        container.appendChild(section);

        const input = section.querySelector('#badge');
        expect(input).toBeTruthy();
      });

      it('should create badge input with correct name attribute', () => {
        const section = FormFieldBuilder.createInvestigatorSection();
        container.appendChild(section);

        const input = section.querySelector('#badge');
        expect(input.getAttribute('name')).toBe('badge');
      });

      it('should create badge input with required attribute', () => {
        const section = FormFieldBuilder.createInvestigatorSection();
        container.appendChild(section);

        const input = section.querySelector('#badge');
        expect(input.hasAttribute('required')).toBe(true);
      });

      it('should create badge with .invalid-feedback sibling', () => {
        const section = FormFieldBuilder.createInvestigatorSection();
        container.appendChild(section);

        const input = section.querySelector('#badge');
        const formGroup = input.closest('.form-group');
        const feedback = formGroup.querySelector('.invalid-feedback');
        expect(feedback).toBeTruthy();
      });
    });

    describe('Contact Phone field', () => {
      it('should create requestingPhone input with correct ID', () => {
        const section = FormFieldBuilder.createInvestigatorSection();
        container.appendChild(section);

        const input = section.querySelector('#requestingPhone');
        expect(input).toBeTruthy();
      });

      it('should create requestingPhone input with correct name attribute', () => {
        const section = FormFieldBuilder.createInvestigatorSection();
        container.appendChild(section);

        const input = section.querySelector('#requestingPhone');
        expect(input.getAttribute('name')).toBe('requestingPhone');
      });

      it('should create requestingPhone input with type="tel"', () => {
        const section = FormFieldBuilder.createInvestigatorSection();
        container.appendChild(section);

        const input = section.querySelector('#requestingPhone');
        expect(input.getAttribute('type')).toBe('tel');
      });

      it('should create requestingPhone input with required attribute', () => {
        const section = FormFieldBuilder.createInvestigatorSection();
        container.appendChild(section);

        const input = section.querySelector('#requestingPhone');
        expect(input.hasAttribute('required')).toBe(true);
      });

      it('should create requestingPhone with .invalid-feedback sibling', () => {
        const section = FormFieldBuilder.createInvestigatorSection();
        container.appendChild(section);

        const input = section.querySelector('#requestingPhone');
        const formGroup = input.closest('.form-group');
        const feedback = formGroup.querySelector('.invalid-feedback');
        expect(feedback).toBeTruthy();
      });
    });

    describe('Email Address field', () => {
      it('should create requestingEmail input with correct ID', () => {
        const section = FormFieldBuilder.createInvestigatorSection();
        container.appendChild(section);

        const input = section.querySelector('#requestingEmail');
        expect(input).toBeTruthy();
      });

      it('should create requestingEmail input with correct name attribute', () => {
        const section = FormFieldBuilder.createInvestigatorSection();
        container.appendChild(section);

        const input = section.querySelector('#requestingEmail');
        expect(input.getAttribute('name')).toBe('requestingEmail');
      });

      it('should create requestingEmail input with type="email"', () => {
        const section = FormFieldBuilder.createInvestigatorSection();
        container.appendChild(section);

        const input = section.querySelector('#requestingEmail');
        expect(input.getAttribute('type')).toBe('email');
      });

      it('should create requestingEmail input with required attribute', () => {
        const section = FormFieldBuilder.createInvestigatorSection();
        container.appendChild(section);

        const input = section.querySelector('#requestingEmail');
        expect(input.hasAttribute('required')).toBe(true);
      });

      it('should create requestingEmail with placeholder containing @peelpolice.ca', () => {
        const section = FormFieldBuilder.createInvestigatorSection();
        container.appendChild(section);

        const input = section.querySelector('#requestingEmail');
        expect(input.getAttribute('placeholder')).toContain('@peelpolice.ca');
      });

      it('should create requestingEmail with .invalid-feedback sibling', () => {
        const section = FormFieldBuilder.createInvestigatorSection();
        container.appendChild(section);

        const input = section.querySelector('#requestingEmail');
        const formGroup = input.closest('.form-group');
        const feedback = formGroup.querySelector('.invalid-feedback');
        expect(feedback).toBeTruthy();
      });
    });
  });

  /**
   * Test Suite: Field Naming Preservation
   *
   * CRITICAL: Field names are SACRED for PHP/PDF/JSON compatibility.
   * These tests verify that all field names match exactly as required.
   */
  describe('Field Naming Preservation (PHP/PDF/JSON compatibility)', () => {
    const requiredFieldNames = [
      // Case Information
      'occNumber',
      'offenceType',
      'offenceTypeOther',
      // Investigator Information
      'rName',
      'badge',
      'requestingPhone',
      'requestingEmail',
      // Video Source Information
      'videoLocation',
      'videoLocationOther',
      'bagNumber',
      'lockerNumber',
      'videoSeizedFrom',
      'recordingDate',
      // Work Request
      'jobRequired',
      'fileNames',
      'serviceRequired',
      'serviceRequiredOther',
      'requestDetails',
      'additionalInfo'
    ];

    it('should preserve all required field names across all sections', () => {
      // Build all sections
      const caseSection = FormFieldBuilder.createCaseInformationSection();
      const investigatorSection = FormFieldBuilder.createInvestigatorSection();
      const videoSection = FormFieldBuilder.createVideoSourceSection();
      const workSection = FormFieldBuilder.createWorkRequestSection();

      container.appendChild(caseSection);
      container.appendChild(investigatorSection);
      container.appendChild(videoSection);
      container.appendChild(workSection);

      // Verify each field exists with correct name
      requiredFieldNames.forEach(fieldName => {
        const field = container.querySelector(`[name="${fieldName}"]`);
        expect(field, `Field with name="${fieldName}" should exist`).toBeTruthy();
      });
    });

    it('should use index 0 pattern for single-instance fields (no _N suffix)', () => {
      // Analysis form has no dynamic fields, all are index 0
      // Field names should NOT have _1, _2, etc. suffixes
      const caseSection = FormFieldBuilder.createCaseInformationSection();
      const investigatorSection = FormFieldBuilder.createInvestigatorSection();
      const videoSection = FormFieldBuilder.createVideoSourceSection();
      const workSection = FormFieldBuilder.createWorkRequestSection();

      container.appendChild(caseSection);
      container.appendChild(investigatorSection);
      container.appendChild(videoSection);
      container.appendChild(workSection);

      const allFields = container.querySelectorAll('[name]');
      allFields.forEach(field => {
        const fieldName = field.getAttribute('name');
        expect(fieldName).not.toMatch(/_\d+$/);
      });
    });
  });

  /**
   * Test Suite: Validation UI Structure
   *
   * All fields must have proper structure for validation UI:
   * - .form-control class on input/select/textarea
   * - .invalid-feedback sibling for error messages
   */
  describe('Validation UI Structure', () => {
    const formControlFieldIds = [
      'occNumber', 'offenceType', 'offenceTypeOther',
      'rName', 'badge', 'requestingPhone', 'requestingEmail',
      'videoLocation', 'videoLocationOther', 'bagNumber', 'lockerNumber',
      'videoSeizedFrom', 'recordingDate', 'jobRequired', 'fileNames',
      'serviceRequired', 'serviceRequiredOther', 'requestDetails', 'additionalInfo'
    ];

    describe('All fields have .form-control class', () => {
      formControlFieldIds.forEach(fieldId => {
        it(`should have .form-control class on #${fieldId}`, () => {
          // Build all sections
          const caseSection = FormFieldBuilder.createCaseInformationSection();
          const investigatorSection = FormFieldBuilder.createInvestigatorSection();
          const videoSection = FormFieldBuilder.createVideoSourceSection();
          const workSection = FormFieldBuilder.createWorkRequestSection();

          container.appendChild(caseSection);
          container.appendChild(investigatorSection);
          container.appendChild(videoSection);
          container.appendChild(workSection);

          const field = container.querySelector(`#${fieldId}`);
          expect(field, `Field #${fieldId} should exist`).toBeTruthy();
          expect(field.classList.contains('form-control')).toBe(true);
        });
      });
    });

    describe('All fields have .invalid-feedback sibling', () => {
      formControlFieldIds.forEach(fieldId => {
        it(`should have .invalid-feedback sibling for #${fieldId}`, () => {
          // Build all sections
          const caseSection = FormFieldBuilder.createCaseInformationSection();
          const investigatorSection = FormFieldBuilder.createInvestigatorSection();
          const videoSection = FormFieldBuilder.createVideoSourceSection();
          const workSection = FormFieldBuilder.createWorkRequestSection();

          container.appendChild(caseSection);
          container.appendChild(investigatorSection);
          container.appendChild(videoSection);
          container.appendChild(workSection);

          const field = container.querySelector(`#${fieldId}`);
          expect(field, `Field #${fieldId} should exist`).toBeTruthy();

          // Find the form group containing this field
          const formGroup = field.closest('.form-group') || field.closest('[class*="Group"]');
          const feedback = formGroup?.querySelector('.invalid-feedback');
          expect(feedback, `Field #${fieldId} should have .invalid-feedback sibling`).toBeTruthy();
        });
      });
    });
  });
});
