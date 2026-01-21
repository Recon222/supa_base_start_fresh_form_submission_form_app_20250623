/**
 * Analysis Form - Validation Tests
 *
 * TDD Tests for the DESIRED validation behavior in the Analysis form.
 * These tests define how field validation SHOULD work after the refactor.
 *
 * Key validations tested:
 * 1. Locker number validation (1-28 range, text input)
 * 2. Recording date must be in the past (not future)
 * 3. Email must be @peelpolice.ca
 * 4. Phone must be 10 digits
 * 5. Occurrence number must start with PR
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { validateField } from '../../../assets/js/validators.js';
import { CONFIG } from '../../../assets/js/config.js';

describe('Analysis Form Validation', () => {
  /**
   * Test Suite: Locker Number Validation
   *
   * Locker number is a text input (not number type) that accepts values 1-28.
   * It is an OPTIONAL field - empty values are valid.
   * Invalid ranges should produce an error message.
   */
  describe('Locker Number Validation', () => {
    const fieldName = CONFIG.FIELD_NAMES.LOCKER_NUMBER;

    describe('Valid locker numbers', () => {
      it('should accept empty locker number (optional field)', () => {
        const result = validateField('', fieldName, false);
        expect(result).toBeNull();
      });

      it('should accept locker number 1 (minimum)', () => {
        const result = validateField('1', fieldName, false);
        expect(result).toBeNull();
      });

      it('should accept locker number 28 (maximum)', () => {
        const result = validateField('28', fieldName, false);
        expect(result).toBeNull();
      });

      it('should accept locker number 15 (mid-range)', () => {
        const result = validateField('15', fieldName, false);
        expect(result).toBeNull();
      });

      it('should accept locker number with leading whitespace', () => {
        const result = validateField('  10', fieldName, false);
        expect(result).toBeNull();
      });

      it('should accept locker number with trailing whitespace', () => {
        const result = validateField('10  ', fieldName, false);
        expect(result).toBeNull();
      });
    });

    describe('Invalid locker numbers', () => {
      it('should reject locker number 0 (below minimum)', () => {
        const result = validateField('0', fieldName, false);
        expect(result).not.toBeNull();
        expect(result).toContain('1');
        expect(result).toContain('28');
      });

      it('should reject locker number 29 (above maximum)', () => {
        const result = validateField('29', fieldName, false);
        expect(result).not.toBeNull();
        expect(result).toContain('1');
        expect(result).toContain('28');
      });

      it('should reject negative locker number', () => {
        const result = validateField('-5', fieldName, false);
        expect(result).not.toBeNull();
      });

      it('should reject locker number 100 (far above maximum)', () => {
        const result = validateField('100', fieldName, false);
        expect(result).not.toBeNull();
      });

      it('should reject non-numeric locker number', () => {
        const result = validateField('abc', fieldName, false);
        expect(result).not.toBeNull();
        expect(result.toLowerCase()).toContain('number');
      });

      it('should reject mixed alphanumeric locker number', () => {
        const result = validateField('12a', fieldName, false);
        expect(result).not.toBeNull();
      });

      it('should reject decimal locker number', () => {
        const result = validateField('15.5', fieldName, false);
        expect(result).not.toBeNull();
      });

      it('should reject special characters in locker number', () => {
        const result = validateField('15!', fieldName, false);
        expect(result).not.toBeNull();
      });
    });

    describe('Edge cases', () => {
      it('should accept whitespace-only as empty (optional field)', () => {
        const result = validateField('   ', fieldName, false);
        expect(result).toBeNull();
      });

      it('should reject locker number with spaces between digits', () => {
        const result = validateField('1 5', fieldName, false);
        expect(result).not.toBeNull();
      });
    });
  });

  /**
   * Test Suite: Recording Date Validation (Past Date)
   *
   * The recordingDate field should only accept dates that are in the past
   * or today. Future dates should be rejected.
   */
  describe('Recording Date Validation (Past Date)', () => {
    const fieldName = CONFIG.FIELD_NAMES.RECORDING_DATE;

    beforeEach(() => {
      // Mock the current date to 2026-01-21 for consistent testing
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-21T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    describe('Valid recording dates', () => {
      it('should accept empty recording date (optional field)', () => {
        const result = validateField('', fieldName, false);
        expect(result).toBeNull();
      });

      it('should accept date from today', () => {
        const result = validateField('2026-01-21', fieldName, false);
        expect(result).toBeNull();
      });

      it('should accept date from yesterday', () => {
        const result = validateField('2026-01-20', fieldName, false);
        expect(result).toBeNull();
      });

      it('should accept date from last week', () => {
        const result = validateField('2026-01-14', fieldName, false);
        expect(result).toBeNull();
      });

      it('should accept date from last month', () => {
        const result = validateField('2025-12-15', fieldName, false);
        expect(result).toBeNull();
      });

      it('should accept date from last year', () => {
        const result = validateField('2025-01-21', fieldName, false);
        expect(result).toBeNull();
      });

      it('should accept very old date', () => {
        const result = validateField('2020-01-01', fieldName, false);
        expect(result).toBeNull();
      });
    });

    describe('Invalid recording dates (future)', () => {
      it('should reject date from tomorrow', () => {
        const result = validateField('2026-01-22', fieldName, false);
        expect(result).not.toBeNull();
        expect(result.toLowerCase()).toContain('future');
      });

      it('should reject date from next week', () => {
        const result = validateField('2026-01-28', fieldName, false);
        expect(result).not.toBeNull();
        expect(result.toLowerCase()).toContain('future');
      });

      it('should reject date from next month', () => {
        const result = validateField('2026-02-15', fieldName, false);
        expect(result).not.toBeNull();
        expect(result.toLowerCase()).toContain('future');
      });

      it('should reject date from next year', () => {
        const result = validateField('2027-01-21', fieldName, false);
        expect(result).not.toBeNull();
        expect(result.toLowerCase()).toContain('future');
      });
    });

    describe('Edge cases', () => {
      it('should handle invalid date format gracefully', () => {
        const result = validateField('not-a-date', fieldName, false);
        // Invalid format should either be rejected or accepted as empty
        // depending on how the validator handles it
        // The key is it should not throw an error
        expect(() => validateField('not-a-date', fieldName, false)).not.toThrow();
      });

      it('should accept required recording date when valid', () => {
        const result = validateField('2026-01-15', fieldName, true);
        expect(result).toBeNull();
      });

      it('should reject required recording date when empty', () => {
        const result = validateField('', fieldName, true);
        expect(result).toBe(CONFIG.MESSAGES.REQUIRED_FIELD);
      });
    });
  });

  /**
   * Test Suite: Email Validation (@peelpolice.ca)
   *
   * Email must be a valid @peelpolice.ca email address.
   * Other domains should be rejected.
   */
  describe('Email Validation (@peelpolice.ca)', () => {
    const fieldName = CONFIG.FIELD_NAMES.OFFICER_EMAIL;

    describe('Valid email addresses', () => {
      it('should accept standard @peelpolice.ca email', () => {
        const result = validateField('john.smith@peelpolice.ca', fieldName, true);
        expect(result).toBeNull();
      });

      it('should accept simple @peelpolice.ca email', () => {
        const result = validateField('jsmith@peelpolice.ca', fieldName, true);
        expect(result).toBeNull();
      });

      it('should accept email with numbers @peelpolice.ca', () => {
        const result = validateField('smith1234@peelpolice.ca', fieldName, true);
        expect(result).toBeNull();
      });

      it('should be case insensitive for domain', () => {
        const result = validateField('John.Smith@PEELPOLICE.CA', fieldName, true);
        expect(result).toBeNull();
      });

      it('should accept email with mixed case domain', () => {
        const result = validateField('test@PeelPolice.Ca', fieldName, true);
        expect(result).toBeNull();
      });

      it('should accept email with underscores', () => {
        const result = validateField('john_smith@peelpolice.ca', fieldName, true);
        expect(result).toBeNull();
      });

      it('should accept email with hyphens', () => {
        const result = validateField('john-smith@peelpolice.ca', fieldName, true);
        expect(result).toBeNull();
      });
    });

    describe('Invalid email addresses (wrong domain)', () => {
      it('should reject gmail.com email', () => {
        const result = validateField('john.smith@gmail.com', fieldName, true);
        expect(result).toBe(CONFIG.MESSAGES.INVALID_EMAIL);
      });

      it('should reject yahoo.com email', () => {
        const result = validateField('john.smith@yahoo.com', fieldName, true);
        expect(result).toBe(CONFIG.MESSAGES.INVALID_EMAIL);
      });

      it('should reject outlook.com email', () => {
        const result = validateField('john.smith@outlook.com', fieldName, true);
        expect(result).toBe(CONFIG.MESSAGES.INVALID_EMAIL);
      });

      it('should reject similar but incorrect domain', () => {
        const result = validateField('john.smith@peelpolice.com', fieldName, true);
        expect(result).toBe(CONFIG.MESSAGES.INVALID_EMAIL);
      });

      it('should reject subdomain variation', () => {
        const result = validateField('john.smith@mail.peelpolice.ca', fieldName, true);
        expect(result).toBe(CONFIG.MESSAGES.INVALID_EMAIL);
      });
    });

    describe('Invalid email format', () => {
      it('should reject email without @ symbol', () => {
        const result = validateField('john.smithpeelpolice.ca', fieldName, true);
        expect(result).toBe(CONFIG.MESSAGES.INVALID_EMAIL);
      });

      it('should reject email without domain', () => {
        const result = validateField('john.smith@', fieldName, true);
        expect(result).toBe(CONFIG.MESSAGES.INVALID_EMAIL);
      });

      it('should reject email without local part', () => {
        const result = validateField('@peelpolice.ca', fieldName, true);
        expect(result).toBe(CONFIG.MESSAGES.INVALID_EMAIL);
      });

      it('should reject email with spaces', () => {
        const result = validateField('john smith@peelpolice.ca', fieldName, true);
        expect(result).toBe(CONFIG.MESSAGES.INVALID_EMAIL);
      });
    });

    describe('Required field behavior', () => {
      it('should reject empty email when required', () => {
        const result = validateField('', fieldName, true);
        expect(result).toBe(CONFIG.MESSAGES.REQUIRED_FIELD);
      });

      it('should accept empty email when optional', () => {
        const result = validateField('', fieldName, false);
        expect(result).toBeNull();
      });
    });
  });

  /**
   * Test Suite: Phone Number Validation (10 digits)
   *
   * Phone must be exactly 10 digits.
   * Formatting (dashes, spaces) is handled separately.
   */
  describe('Phone Number Validation (10 digits)', () => {
    const fieldName = CONFIG.FIELD_NAMES.OFFICER_PHONE;

    describe('Valid phone numbers', () => {
      it('should accept 10-digit phone number without formatting', () => {
        const result = validateField('9051234567', fieldName, true);
        expect(result).toBeNull();
      });

      it('should accept phone number with dashes', () => {
        const result = validateField('905-123-4567', fieldName, true);
        expect(result).toBeNull();
      });

      it('should accept phone number with spaces', () => {
        const result = validateField('905 123 4567', fieldName, true);
        expect(result).toBeNull();
      });

      it('should accept phone number with dots', () => {
        const result = validateField('905.123.4567', fieldName, true);
        expect(result).toBeNull();
      });

      it('should accept phone number with parentheses', () => {
        const result = validateField('(905) 123-4567', fieldName, true);
        expect(result).toBeNull();
      });

      it('should accept phone number with mixed formatting', () => {
        const result = validateField('(905) 123 4567', fieldName, true);
        expect(result).toBeNull();
      });
    });

    describe('Invalid phone numbers', () => {
      it('should reject 9-digit phone number', () => {
        const result = validateField('905123456', fieldName, true);
        expect(result).toBe(CONFIG.MESSAGES.INVALID_PHONE);
      });

      it('should reject 11-digit phone number (with country code)', () => {
        const result = validateField('19051234567', fieldName, true);
        expect(result).toBe(CONFIG.MESSAGES.INVALID_PHONE);
      });

      it('should reject 7-digit phone number', () => {
        const result = validateField('1234567', fieldName, true);
        expect(result).toBe(CONFIG.MESSAGES.INVALID_PHONE);
      });

      it('should reject phone number with letters', () => {
        const result = validateField('905ABC4567', fieldName, true);
        expect(result).toBe(CONFIG.MESSAGES.INVALID_PHONE);
      });

      it('should reject empty phone when required', () => {
        const result = validateField('', fieldName, true);
        expect(result).toBe(CONFIG.MESSAGES.REQUIRED_FIELD);
      });
    });

    describe('Edge cases', () => {
      it('should accept empty phone when optional', () => {
        const result = validateField('', fieldName, false);
        expect(result).toBeNull();
      });

      it('should accept phone with leading/trailing whitespace', () => {
        const result = validateField('  9051234567  ', fieldName, true);
        expect(result).toBeNull();
      });
    });
  });

  /**
   * Test Suite: Occurrence Number Validation (PR format)
   *
   * Occurrence number must start with "PR" followed by numbers.
   * Case insensitive for "PR" prefix.
   */
  describe('Occurrence Number Validation (PR format)', () => {
    const fieldName = CONFIG.FIELD_NAMES.OCCURRENCE_NUMBER;

    describe('Valid occurrence numbers', () => {
      it('should accept uppercase PR followed by numbers', () => {
        const result = validateField('PR2024001234', fieldName, true);
        expect(result).toBeNull();
      });

      it('should accept lowercase pr followed by numbers', () => {
        const result = validateField('pr2024001234', fieldName, true);
        expect(result).toBeNull();
      });

      it('should accept mixed case Pr followed by numbers', () => {
        const result = validateField('Pr2024001234', fieldName, true);
        expect(result).toBeNull();
      });

      it('should accept PR with short number', () => {
        const result = validateField('PR123', fieldName, true);
        expect(result).toBeNull();
      });

      it('should accept PR with long number', () => {
        const result = validateField('PR20240012345678', fieldName, true);
        expect(result).toBeNull();
      });

      it('should accept PR with single digit', () => {
        const result = validateField('PR1', fieldName, true);
        expect(result).toBeNull();
      });
    });

    describe('Invalid occurrence numbers', () => {
      it('should reject number without PR prefix', () => {
        const result = validateField('2024001234', fieldName, true);
        expect(result).toBe(CONFIG.MESSAGES.INVALID_OCCURRENCE);
      });

      it('should reject wrong prefix (CC)', () => {
        const result = validateField('CC2024001234', fieldName, true);
        expect(result).toBe(CONFIG.MESSAGES.INVALID_OCCURRENCE);
      });

      it('should reject PR without numbers', () => {
        const result = validateField('PR', fieldName, true);
        expect(result).toBe(CONFIG.MESSAGES.INVALID_OCCURRENCE);
      });

      it('should reject PR followed by letters', () => {
        const result = validateField('PRABC', fieldName, true);
        expect(result).toBe(CONFIG.MESSAGES.INVALID_OCCURRENCE);
      });

      it('should reject PR with mixed alphanumeric', () => {
        const result = validateField('PR2024ABC', fieldName, true);
        expect(result).toBe(CONFIG.MESSAGES.INVALID_OCCURRENCE);
      });

      it('should reject empty when required', () => {
        const result = validateField('', fieldName, true);
        expect(result).toBe(CONFIG.MESSAGES.REQUIRED_FIELD);
      });

      it('should reject PR with special characters', () => {
        const result = validateField('PR2024-001', fieldName, true);
        expect(result).toBe(CONFIG.MESSAGES.INVALID_OCCURRENCE);
      });

      it('should reject PR with spaces', () => {
        const result = validateField('PR 2024001234', fieldName, true);
        expect(result).toBe(CONFIG.MESSAGES.INVALID_OCCURRENCE);
      });
    });

    describe('Edge cases', () => {
      it('should accept occurrence number with leading/trailing whitespace', () => {
        const result = validateField('  PR2024001234  ', fieldName, true);
        expect(result).toBeNull();
      });

      it('should accept empty when optional', () => {
        const result = validateField('', fieldName, false);
        expect(result).toBeNull();
      });
    });
  });

  /**
   * Test Suite: General validateField() behavior
   *
   * Tests for the general behavior of validateField() that applies
   * to all field types.
   */
  describe('General validateField() behavior', () => {
    it('should return CONFIG.MESSAGES.REQUIRED_FIELD for empty required field', () => {
      const result = validateField('', 'anyField', true);
      expect(result).toBe(CONFIG.MESSAGES.REQUIRED_FIELD);
    });

    it('should return null for empty optional field', () => {
      const result = validateField('', 'anyField', false);
      expect(result).toBeNull();
    });

    it('should return null for whitespace-only optional field', () => {
      const result = validateField('   ', 'anyField', false);
      expect(result).toBeNull();
    });

    it('should return CONFIG.MESSAGES.REQUIRED_FIELD for whitespace-only required field', () => {
      const result = validateField('   ', 'anyField', true);
      expect(result).toBe(CONFIG.MESSAGES.REQUIRED_FIELD);
    });

    it('should return null for unknown field name with value', () => {
      const result = validateField('some value', 'unknownField', false);
      expect(result).toBeNull();
    });

    it('should not throw on null value', () => {
      expect(() => validateField(null, 'anyField', false)).not.toThrow();
    });

    it('should not throw on undefined value', () => {
      expect(() => validateField(undefined, 'anyField', false)).not.toThrow();
    });
  });
});

/**
 * Summary of Validation Rules for Analysis Form
 *
 * 1. Locker Number (optional):
 *    - Empty: Valid
 *    - Range: 1-28 (inclusive)
 *    - Type: Text input with numeric validation
 *    - Error: "Locker number must be between 1 and 28"
 *
 * 2. Recording Date (optional/required depending on context):
 *    - Must be in the past or today
 *    - Cannot be a future date
 *    - Error: "Date cannot be in the future"
 *
 * 3. Email (required):
 *    - Must be @peelpolice.ca domain
 *    - Case insensitive for domain
 *    - Error: CONFIG.MESSAGES.INVALID_EMAIL
 *
 * 4. Phone (required):
 *    - Must be exactly 10 digits
 *    - Non-digit characters are stripped before validation
 *    - Error: CONFIG.MESSAGES.INVALID_PHONE
 *
 * 5. Occurrence Number (required):
 *    - Must start with "PR" (case insensitive)
 *    - Must be followed by digits only
 *    - Error: CONFIG.MESSAGES.INVALID_OCCURRENCE
 */
