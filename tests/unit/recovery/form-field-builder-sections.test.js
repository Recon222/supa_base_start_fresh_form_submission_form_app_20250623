/**
 * FormFieldBuilder - Recovery Section Methods Unit Tests
 *
 * TDD Tests for Recovery-specific section builder methods in FormFieldBuilder.
 * These methods do NOT exist yet - tests define expected behavior.
 *
 * RED-LINE TESTS: All tests should FAIL until implementation is complete.
 *
 * Recovery form has unique requirements:
 * - Unit field in investigator section (not in Analysis/Upload)
 * - Location contact fields (not in Analysis)
 * - Free-text offenceType (not select like Analysis)
 * - Incident description section
 *
 * @fileoverview Unit tests for FormFieldBuilder Recovery section methods
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FormFieldBuilder } from '../../../assets/js/form-handlers/form-field-builder.js';

describe('FormFieldBuilder Recovery Section Methods', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  // ===========================================================================
  // createRecoveryCaseSection()
  // ===========================================================================
  describe('createRecoveryCaseSection()', () => {
    describe('Method existence', () => {
      it('should have createRecoveryCaseSection as a static method', () => {
        expect(typeof FormFieldBuilder.createRecoveryCaseSection).toBe('function');
      });
    });

    describe('Section structure', () => {
      it('should return a form-section element', () => {
        const section = FormFieldBuilder.createRecoveryCaseSection();
        expect(section).toBeTruthy();
        expect(section.classList.contains('form-section')).toBe(true);
      });

      it('should have a heading with "Case Information"', () => {
        const section = FormFieldBuilder.createRecoveryCaseSection();
        container.appendChild(section);

        const heading = section.querySelector('h2');
        expect(heading).toBeTruthy();
        expect(heading.textContent).toContain('Case Information');
      });
    });

    describe('Expected fields', () => {
      it('should create occNumber field', () => {
        const section = FormFieldBuilder.createRecoveryCaseSection();
        container.appendChild(section);

        const input = container.querySelector('#occNumber');
        expect(input).toBeTruthy();
        expect(input.getAttribute('name')).toBe('occNumber');
        expect(input.hasAttribute('required')).toBe(true);
      });

      it('should create offenceType as free-text field (not select)', () => {
        const section = FormFieldBuilder.createRecoveryCaseSection();
        container.appendChild(section);

        const input = container.querySelector('#offenceType');
        expect(input).toBeTruthy();
        expect(input.tagName.toLowerCase()).toBe('input');
        expect(input.getAttribute('type')).toBe('text');
        expect(input.getAttribute('name')).toBe('offenceType');
        expect(input.hasAttribute('required')).toBe(true);
      });

      it('should NOT have offenceType select dropdown (unlike Analysis form)', () => {
        const section = FormFieldBuilder.createRecoveryCaseSection();
        container.appendChild(section);

        const select = container.querySelector('select#offenceType');
        expect(select).toBeNull();
      });
    });
  });

  // ===========================================================================
  // createRecoveryInvestigatorSection()
  // ===========================================================================
  describe('createRecoveryInvestigatorSection()', () => {
    describe('Method existence', () => {
      it('should have createRecoveryInvestigatorSection as a static method', () => {
        expect(typeof FormFieldBuilder.createRecoveryInvestigatorSection).toBe('function');
      });
    });

    describe('Section structure', () => {
      it('should return a form-section element', () => {
        const section = FormFieldBuilder.createRecoveryInvestigatorSection();
        expect(section).toBeTruthy();
        expect(section.classList.contains('form-section')).toBe(true);
      });

      it('should have a heading with "Submitting Investigator Information"', () => {
        const section = FormFieldBuilder.createRecoveryInvestigatorSection();
        container.appendChild(section);

        const heading = section.querySelector('h2');
        expect(heading).toBeTruthy();
        expect(heading.textContent).toContain('Submitting Investigator Information');
      });
    });

    describe('Standard investigator fields', () => {
      it('should create rName field', () => {
        const section = FormFieldBuilder.createRecoveryInvestigatorSection();
        container.appendChild(section);

        const input = container.querySelector('#rName');
        expect(input).toBeTruthy();
        expect(input.getAttribute('name')).toBe('rName');
        expect(input.hasAttribute('required')).toBe(true);
      });

      it('should create badge field', () => {
        const section = FormFieldBuilder.createRecoveryInvestigatorSection();
        container.appendChild(section);

        const input = container.querySelector('#badge');
        expect(input).toBeTruthy();
        expect(input.getAttribute('name')).toBe('badge');
        expect(input.hasAttribute('required')).toBe(true);
      });

      it('should create requestingPhone field with type="tel"', () => {
        const section = FormFieldBuilder.createRecoveryInvestigatorSection();
        container.appendChild(section);

        const input = container.querySelector('#requestingPhone');
        expect(input).toBeTruthy();
        expect(input.getAttribute('type')).toBe('tel');
        expect(input.hasAttribute('required')).toBe(true);
      });

      it('should create requestingEmail field with type="email"', () => {
        const section = FormFieldBuilder.createRecoveryInvestigatorSection();
        container.appendChild(section);

        const input = container.querySelector('#requestingEmail');
        expect(input).toBeTruthy();
        expect(input.getAttribute('type')).toBe('email');
        expect(input.hasAttribute('required')).toBe(true);
      });
    });

    describe('Recovery-specific: Unit field', () => {
      it('should create unit field (unique to Recovery form)', () => {
        const section = FormFieldBuilder.createRecoveryInvestigatorSection();
        container.appendChild(section);

        const input = container.querySelector('#unit');
        expect(input).toBeTruthy();
        expect(input.getAttribute('name')).toBe('unit');
        expect(input.getAttribute('type')).toBe('text');
        expect(input.hasAttribute('required')).toBe(true);
      });
    });

    describe('Clear button', () => {
      it('should have clearOfficerInfo button', () => {
        const section = FormFieldBuilder.createRecoveryInvestigatorSection();
        container.appendChild(section);

        const button = container.querySelector('#clearOfficerInfo');
        expect(button).toBeTruthy();
        expect(button.getAttribute('type')).toBe('button');
      });
    });
  });

  // ===========================================================================
  // createRecoveryLocationSection()
  // ===========================================================================
  describe('createRecoveryLocationSection()', () => {
    describe('Method existence', () => {
      it('should have createRecoveryLocationSection as a static method', () => {
        expect(typeof FormFieldBuilder.createRecoveryLocationSection).toBe('function');
      });
    });

    describe('Section structure', () => {
      it('should return a form-section element', () => {
        const section = FormFieldBuilder.createRecoveryLocationSection();
        expect(section).toBeTruthy();
        expect(section.classList.contains('form-section')).toBe(true);
      });

      it('should have a heading with "Location Information"', () => {
        const section = FormFieldBuilder.createRecoveryLocationSection();
        container.appendChild(section);

        const heading = section.querySelector('h2');
        expect(heading).toBeTruthy();
        expect(heading.textContent).toContain('Location Information');
      });
    });

    describe('Standard location fields', () => {
      it('should create businessName field', () => {
        const section = FormFieldBuilder.createRecoveryLocationSection();
        container.appendChild(section);

        const input = container.querySelector('#businessName');
        expect(input).toBeTruthy();
        expect(input.getAttribute('name')).toBe('businessName');
        expect(input.hasAttribute('required')).toBe(true);
      });

      it('should create locationAddress field', () => {
        const section = FormFieldBuilder.createRecoveryLocationSection();
        container.appendChild(section);

        const input = container.querySelector('#locationAddress');
        expect(input).toBeTruthy();
        expect(input.getAttribute('name')).toBe('locationAddress');
        expect(input.hasAttribute('required')).toBe(true);
      });

      it('should create city select field', () => {
        const section = FormFieldBuilder.createRecoveryLocationSection();
        container.appendChild(section);

        const select = container.querySelector('#city');
        expect(select).toBeTruthy();
        expect(select.tagName.toLowerCase()).toBe('select');
        expect(select.getAttribute('name')).toBe('city');
        expect(select.hasAttribute('required')).toBe(true);
      });

      it('should create cityOther conditional field (hidden by default)', () => {
        const section = FormFieldBuilder.createRecoveryLocationSection();
        container.appendChild(section);

        const otherGroup = container.querySelector('#cityOtherGroup');
        expect(otherGroup).toBeTruthy();
        expect(otherGroup.classList.contains('d-none')).toBe(true);

        const input = container.querySelector('#cityOther');
        expect(input).toBeTruthy();
        expect(input.getAttribute('name')).toBe('cityOther');
      });
    });

    describe('Recovery-specific: Contact fields', () => {
      it('should create locationContact field (optional)', () => {
        const section = FormFieldBuilder.createRecoveryLocationSection();
        container.appendChild(section);

        const input = container.querySelector('#locationContact');
        expect(input).toBeTruthy();
        expect(input.getAttribute('name')).toBe('locationContact');
        expect(input.hasAttribute('required')).toBe(false);
      });

      it('should create locationContactPhone field (optional)', () => {
        const section = FormFieldBuilder.createRecoveryLocationSection();
        container.appendChild(section);

        const input = container.querySelector('#locationContactPhone');
        expect(input).toBeTruthy();
        expect(input.getAttribute('name')).toBe('locationContactPhone');
        expect(input.getAttribute('type')).toBe('tel');
        expect(input.hasAttribute('required')).toBe(false);
      });
    });
  });

  // ===========================================================================
  // createIncidentDescriptionSection()
  // ===========================================================================
  describe('createIncidentDescriptionSection()', () => {
    describe('Method existence', () => {
      it('should have createIncidentDescriptionSection as a static method', () => {
        expect(typeof FormFieldBuilder.createIncidentDescriptionSection).toBe('function');
      });
    });

    describe('Section structure', () => {
      it('should return a form-section element', () => {
        const section = FormFieldBuilder.createIncidentDescriptionSection();
        expect(section).toBeTruthy();
        expect(section.classList.contains('form-section')).toBe(true);
      });

      it('should have a heading with "Incident Description"', () => {
        const section = FormFieldBuilder.createIncidentDescriptionSection();
        container.appendChild(section);

        const heading = section.querySelector('h2');
        expect(heading).toBeTruthy();
        expect(heading.textContent).toContain('Incident Description');
      });
    });

    describe('Incident description field', () => {
      it('should create incidentDescription textarea', () => {
        const section = FormFieldBuilder.createIncidentDescriptionSection();
        container.appendChild(section);

        const textarea = container.querySelector('#incidentDescription');
        expect(textarea).toBeTruthy();
        expect(textarea.tagName.toLowerCase()).toBe('textarea');
        expect(textarea.getAttribute('name')).toBe('incidentDescription');
        expect(textarea.hasAttribute('required')).toBe(true);
      });

      it('should have label with required indicator', () => {
        const section = FormFieldBuilder.createIncidentDescriptionSection();
        container.appendChild(section);

        const label = container.querySelector('label[for="incidentDescription"]');
        expect(label).toBeTruthy();
        expect(label.querySelector('.required')).toBeTruthy();
      });
    });
  });

  // ===========================================================================
  // Validation UI Structure (all sections)
  // ===========================================================================
  describe('Validation UI Structure', () => {
    it('should have .invalid-feedback elements in all Recovery section outputs', () => {
      // These will FAIL until methods exist
      const caseSection = FormFieldBuilder.createRecoveryCaseSection();
      const investigatorSection = FormFieldBuilder.createRecoveryInvestigatorSection();
      const locationSection = FormFieldBuilder.createRecoveryLocationSection();
      const incidentSection = FormFieldBuilder.createIncidentDescriptionSection();

      container.appendChild(caseSection);
      container.appendChild(investigatorSection);
      container.appendChild(locationSection);
      container.appendChild(incidentSection);

      // Each section should have multiple .invalid-feedback elements
      const feedbacks = container.querySelectorAll('.invalid-feedback');
      expect(feedbacks.length).toBeGreaterThan(0);
    });

    it('should have .form-control on all inputs/selects/textareas', () => {
      const caseSection = FormFieldBuilder.createRecoveryCaseSection();
      const investigatorSection = FormFieldBuilder.createRecoveryInvestigatorSection();

      container.appendChild(caseSection);
      container.appendChild(investigatorSection);

      const formControls = container.querySelectorAll('.form-control');
      expect(formControls.length).toBeGreaterThan(0);

      formControls.forEach(control => {
        expect(['INPUT', 'SELECT', 'TEXTAREA']).toContain(control.tagName);
      });
    });
  });
});
