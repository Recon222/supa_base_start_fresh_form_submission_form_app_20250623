import { test, expect } from '@playwright/test';
import {
  validOfficerData,
  dateHelpers
} from './fixtures/test-data.js';
import {
  fillOfficerInfo,
  fillAnalysisForm,
  clearLocalStorage,
  toggleTheme,
  waitForAutoSave,
  getProgressPercentage,
  loadDraft,
  getAllFormValues,
  submitFormAndConfirm,
  dismissPWABanner
} from './fixtures/form-helpers.js';

/**
 * Analysis Form Test Data
 * Based on ACTUAL form structure from form-field-builder.js createVideoSourceSection,
 * createWorkRequestSection, createCaseInformationSection, createInvestigatorSection
 *
 * REQUIRED FIELDS:
 * - occNumber (Occurrence Number)
 * - occDate (Date of Occurrence)
 * - offenceType (Type of Offence)
 * - videoLocation (Where is the Video Currently Stored?)
 * - rName (Submitting Investigator)
 * - badge (Badge Number)
 * - requestingPhone (Contact Phone)
 * - requestingEmail (Email Address)
 * - jobRequired (What is the Job Required?)
 * - fileNames (File Name(s))
 * - serviceRequired (Service Required)
 * - requestDetails (Request Details)
 *
 * OPTIONAL FIELDS:
 * - videoSeizedFrom (Video Seized From)
 * - recordingDate (Original Recording Date)
 * - bagNumber (Evidence Bag Number - only when Locker selected)
 * - lockerNumber (FVU Locker # - only when Locker selected)
 * - additionalInfo (Additional Information)
 *
 * CONDITIONAL FIELDS:
 * - offenceTypeOther (when offenceType = "Other")
 * - videoLocationOther (when videoLocation = "Other")
 * - serviceRequiredOther (when serviceRequired = "Other")
 * - lockerInfoGroup containing bagNumber + lockerNumber (when videoLocation = "Locker")
 *
 * NOTE: NO CITY FIELDS exist in Analysis form
 */

const analysisFormValidData = {
  ...validOfficerData,
  occNumber: 'PR2024004234',
  occDate: '2024-01-10',
  offenceType: 'Homicide',
  videoLocation: 'Evidence.com',
  videoSeizedFrom: 'Scene Investigation',
  recordingDate: '2024-01-08',
  jobRequired: 'Need full analysis of the video footage',
  fileNames: 'evidence_video_1.mp4\nevidence_video_2.avi',
  serviceRequired: 'Video/Image Clarification',
  requestDetails: 'Need enhancement of vehicle registration plate',
  additionalInfo: ''
};

const analysisFormMinimalData = {
  ...validOfficerData,
  occNumber: 'PR2024004235',
  occDate: '2024-01-09',
  offenceType: 'Missing Person',
  videoLocation: 'NAS Storage',
  jobRequired: 'Review and enhance footage',
  fileNames: 'missing_person_01.mp4',
  serviceRequired: 'Video/Image Clarification',
  requestDetails: 'Looking for specific individual in footage'
};

const analysisFormWithOtherOffence = {
  ...validOfficerData,
  occNumber: 'PR2024005234',
  occDate: '2024-01-07',
  offenceType: 'Other',
  offenceTypeOther: 'Fraud Investigation',
  videoLocation: 'NAS Storage',
  videoSeizedFrom: 'Financial Crime Unit',
  recordingDate: '2024-01-05',
  jobRequired: 'Analyze transaction footage',
  fileNames: 'transaction_cam_01.mp4',
  serviceRequired: 'Timeline',
  requestDetails: 'Create detailed timeline of events'
};

const analysisFormWithOtherVideoLocation = {
  ...validOfficerData,
  occNumber: 'PR2024006234',
  occDate: '2024-01-05',
  offenceType: 'Homicide',
  videoLocation: 'Other',
  videoLocationOther: 'Cloud Storage Provider',
  videoSeizedFrom: 'Investigation Team',
  recordingDate: '2024-01-03',
  jobRequired: 'Extract and analyze video files',
  fileNames: 'cloud_video_01.mp4',
  serviceRequired: 'Make Playable',
  requestDetails: 'Convert video format for playback'
};

const analysisFormWithLockerSelected = {
  ...validOfficerData,
  occNumber: 'PR2024007234',
  occDate: '2024-01-12',
  offenceType: 'Homicide',
  videoLocation: 'Locker',
  bagNumber: '123456',
  lockerNumber: '15',
  videoSeizedFrom: 'Evidence Room',
  recordingDate: '2024-01-10',
  jobRequired: 'Analyze locker evidence',
  fileNames: 'locker_evidence.mp4',
  serviceRequired: 'Data Carving',
  requestDetails: 'Recover deleted footage'
};

const analysisFormWithOtherService = {
  ...validOfficerData,
  occNumber: 'PR2024008234',
  occDate: '2024-01-14',
  offenceType: 'Missing Person',
  videoLocation: 'USB',
  videoSeizedFrom: 'Witness',
  recordingDate: '2024-01-12',
  jobRequired: 'Custom analysis work',
  fileNames: 'witness_video.mov',
  serviceRequired: 'Other',
  serviceRequiredOther: 'Custom Frame-by-Frame Analysis',
  requestDetails: 'Need specialized analysis'
};

test.describe('Analysis Form Tests (analysis.html)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/analysis.html');
    await clearLocalStorage(page);
    await page.reload();
    // Dismiss PWA update banner if visible (it can intercept clicks)
    await dismissPWABanner(page);
  });

  test.describe('2.1 Page Load Tests', () => {
    test('2.1.1 Page loads without JavaScript errors', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err));

      await page.goto('/analysis.html');
      expect(errors).toHaveLength(0);
    });

    test('2.1.2 All form sections render correctly', async ({ page }) => {
      await page.goto('/analysis.html');

      const form = page.locator('#analysis-form');
      await expect(form).toBeVisible();

      // Verify all section containers are present and populated
      await expect(page.locator('#case-section-container')).toBeVisible();
      await expect(page.locator('#investigator-section-container')).toBeVisible();
      await expect(page.locator('#video-source-section-container')).toBeVisible();
      await expect(page.locator('#work-request-section-container')).toBeVisible();
    });

    test('2.1.3 Progress bar shows 0% Complete', async ({ page }) => {
      await page.goto('/analysis.html');

      const progress = await getProgressPercentage(page);
      expect(progress).toBe(0);
    });

    test('2.1.4 Theme toggle button appears', async ({ page }) => {
      await page.goto('/analysis.html');

      const themeToggle = page.locator('[id="theme-toggle"]');
      await expect(themeToggle).toBeVisible();
    });

    test('2.1.5 Draft button shows Auto-save active', async ({ page }) => {
      await page.goto('/analysis.html');

      const draftButton = page.locator('[id="draft-button"]');
      await expect(draftButton).toContainText('Auto-save');
    });

    test('2.1.6 Dynamic form fields are built via JavaScript', async ({ page }) => {
      await page.goto('/analysis.html');

      // Verify key fields exist (they are built dynamically)
      await expect(page.locator('#occNumber')).toBeVisible();
      // occDate uses Flatpickr with altInput, so check that the hidden input exists
      await expect(page.locator('#occDate')).toHaveCount(1);
      await expect(page.locator('#offenceType')).toBeVisible();
      await expect(page.locator('#videoLocation')).toBeVisible();
      await expect(page.locator('#rName')).toBeVisible();
      await expect(page.locator('#badge')).toBeVisible();
      await expect(page.locator('#requestingPhone')).toBeVisible();
      await expect(page.locator('#requestingEmail')).toBeVisible();
      await expect(page.locator('#jobRequired')).toBeVisible();
      await expect(page.locator('#fileNames')).toBeVisible();
      await expect(page.locator('#serviceRequired')).toBeVisible();
      await expect(page.locator('#requestDetails')).toBeVisible();
    });
  });

  test.describe('2.2 Required Field Validation', () => {
    test('2.2.1 Occurrence Number is required', async ({ page }) => {
      await page.goto('/analysis.html');

      await submitFormAndConfirm(page);

      const field = page.locator('#occNumber');
      await expect(field).toHaveClass(/is-invalid/);
    });

    test('2.2.1a Date of Occurrence is required', async ({ page }) => {
      await page.goto('/analysis.html');

      await submitFormAndConfirm(page);

      const field = page.locator('#occDate');
      await expect(field).toHaveClass(/is-invalid/);
    });

    test('2.2.2 Type of Offence is required', async ({ page }) => {
      await page.goto('/analysis.html');

      await submitFormAndConfirm(page);

      const field = page.locator('#offenceType');
      await expect(field).toHaveClass(/is-invalid/);
    });

    test('2.2.3 Video Location (Where is the Video Currently Stored?) is required', async ({ page }) => {
      await page.goto('/analysis.html');

      await submitFormAndConfirm(page);

      const field = page.locator('#videoLocation');
      await expect(field).toHaveClass(/is-invalid/);
    });

    test('2.2.4 Video Seized From is NOT required', async ({ page }) => {
      await page.goto('/analysis.html');

      // Fill all required fields except videoSeizedFrom
      await fillAnalysisForm(page, analysisFormMinimalData);

      // Submit the form
      await submitFormAndConfirm(page);

      // videoSeizedFrom should NOT have validation error
      const field = page.locator('#videoSeizedFrom');
      await expect(field).not.toHaveClass(/is-invalid/);
    });

    test('2.2.5 Recording Date is NOT required', async ({ page }) => {
      await page.goto('/analysis.html');

      // Fill all required fields but leave recordingDate empty
      await fillAnalysisForm(page, analysisFormMinimalData);

      // Submit the form
      await submitFormAndConfirm(page);

      // recordingDate should NOT have validation error
      const field = page.locator('#recordingDate');
      await expect(field).not.toHaveClass(/is-invalid/);
    });

    test('2.2.6 Submitting Investigator is required', async ({ page }) => {
      await page.goto('/analysis.html');

      await submitFormAndConfirm(page);

      const field = page.locator('#rName');
      await expect(field).toHaveClass(/is-invalid/);
    });

    test('2.2.7 Badge Number is required', async ({ page }) => {
      await page.goto('/analysis.html');

      await submitFormAndConfirm(page);

      const field = page.locator('#badge');
      await expect(field).toHaveClass(/is-invalid/);
    });

    test('2.2.8 Contact Phone is required', async ({ page }) => {
      await page.goto('/analysis.html');

      await submitFormAndConfirm(page);

      const field = page.locator('#requestingPhone');
      await expect(field).toHaveClass(/is-invalid/);
    });

    test('2.2.9 Email Address is required', async ({ page }) => {
      await page.goto('/analysis.html');

      await submitFormAndConfirm(page);

      const field = page.locator('#requestingEmail');
      await expect(field).toHaveClass(/is-invalid/);
    });

    test('2.2.10 Job Required (What is the Job Required?) is required', async ({ page }) => {
      await page.goto('/analysis.html');

      await submitFormAndConfirm(page);

      const field = page.locator('#jobRequired');
      await expect(field).toHaveClass(/is-invalid/);
    });

    test('2.2.11 File Names is required', async ({ page }) => {
      await page.goto('/analysis.html');

      await submitFormAndConfirm(page);

      const field = page.locator('#fileNames');
      await expect(field).toHaveClass(/is-invalid/);
    });

    test('2.2.12 Service Required is required', async ({ page }) => {
      await page.goto('/analysis.html');

      await submitFormAndConfirm(page);

      const field = page.locator('#serviceRequired');
      await expect(field).toHaveClass(/is-invalid/);
    });

    test('2.2.13 Request Details is required', async ({ page }) => {
      await page.goto('/analysis.html');

      await submitFormAndConfirm(page);

      const field = page.locator('#requestDetails');
      await expect(field).toHaveClass(/is-invalid/);
    });

    test('2.2.14 Additional Information is NOT required', async ({ page }) => {
      await page.goto('/analysis.html');

      // Fill all required fields but leave additionalInfo empty
      await fillAnalysisForm(page, analysisFormMinimalData);

      // Submit the form
      await submitFormAndConfirm(page);

      // additionalInfo should NOT have validation error
      const field = page.locator('#additionalInfo');
      await expect(field).not.toHaveClass(/is-invalid/);
    });
  });

  test.describe('2.3 Offence Type Conditional Field', () => {
    test('2.3.1 Specify Offence field is hidden by default', async ({ page }) => {
      await page.goto('/analysis.html');

      const otherGroup = page.locator('#offenceTypeOtherGroup');
      await expect(otherGroup).toHaveClass(/d-none/);
    });

    test('2.3.2 Specify Offence field does NOT appear for Homicide', async ({ page }) => {
      await page.goto('/analysis.html');

      await page.selectOption('#offenceType', 'Homicide');

      const otherGroup = page.locator('#offenceTypeOtherGroup');
      await expect(otherGroup).toHaveClass(/d-none/);
    });

    test('2.3.3 Specify Offence field does NOT appear for Missing Person', async ({ page }) => {
      await page.goto('/analysis.html');

      await page.selectOption('#offenceType', 'Missing Person');

      const otherGroup = page.locator('#offenceTypeOtherGroup');
      await expect(otherGroup).toHaveClass(/d-none/);
    });

    test('2.3.4 Specify Offence field appears when Other is selected', async ({ page }) => {
      await page.goto('/analysis.html');

      await page.selectOption('#offenceType', 'Other');

      const otherGroup = page.locator('#offenceTypeOtherGroup');
      await expect(otherGroup).not.toHaveClass(/d-none/);

      const otherField = page.locator('#offenceTypeOther');
      await expect(otherField).toBeVisible();
    });

    test('2.3.5 Specify Offence field becomes required when Other is selected', async ({ page }) => {
      await page.goto('/analysis.html');

      // Fill required fields
      await fillAnalysisForm(page, analysisFormMinimalData);

      // Select Other but leave the other field empty
      await page.selectOption('#offenceType', 'Other');

      await submitFormAndConfirm(page);

      const otherField = page.locator('#offenceTypeOther');
      await expect(otherField).toHaveClass(/is-invalid/);
    });

    test('2.3.6 Can submit with filled Specify Offence field', async ({ page }) => {
      await page.goto('/analysis.html');

      await fillAnalysisForm(page, analysisFormWithOtherOffence);

      await submitFormAndConfirm(page);

      // Check for success or no validation error on the offenceTypeOther field
      const otherField = page.locator('#offenceTypeOther');
      await expect(otherField).not.toHaveClass(/is-invalid/);
    });

    test('2.3.7 Specify Offence field clears when changing back to standard offence', async ({ page }) => {
      await page.goto('/analysis.html');

      await page.selectOption('#offenceType', 'Other');
      // Click field first to remove readonly (autofill prevention)
      const otherField = page.locator('#offenceTypeOther');
      await otherField.click();
      await otherField.fill('Assault');

      await page.selectOption('#offenceType', 'Missing Person');

      const value = await otherField.inputValue();
      expect(value).toBe('');
    });

    test('2.3.8 Validation clears when switching away from Other', async ({ page }) => {
      await page.goto('/analysis.html');

      await page.selectOption('#offenceType', 'Other');
      // Trigger validation on empty field
      await page.locator('#offenceTypeOther').focus();
      await page.locator('#offenceTypeOther').blur();

      // Now switch to a standard option
      await page.selectOption('#offenceType', 'Homicide');

      const otherGroup = page.locator('#offenceTypeOtherGroup');
      await expect(otherGroup).toHaveClass(/d-none/);
    });
  });

  test.describe('2.4 Video Location Conditional Fields', () => {
    test('2.4.1 Specify Storage Location field is hidden by default', async ({ page }) => {
      await page.goto('/analysis.html');

      const otherGroup = page.locator('#videoLocationOtherGroup');
      await expect(otherGroup).toHaveClass(/d-none/);
    });

    test('2.4.2 Specify Storage Location does NOT appear for NAS Storage', async ({ page }) => {
      await page.goto('/analysis.html');

      await page.selectOption('#videoLocation', 'NAS Storage');

      const otherGroup = page.locator('#videoLocationOtherGroup');
      await expect(otherGroup).toHaveClass(/d-none/);
    });

    test('2.4.3 Specify Storage Location does NOT appear for Evidence.com', async ({ page }) => {
      await page.goto('/analysis.html');

      await page.selectOption('#videoLocation', 'Evidence.com');

      const otherGroup = page.locator('#videoLocationOtherGroup');
      await expect(otherGroup).toHaveClass(/d-none/);
    });

    test('2.4.4 Specify Storage Location appears when Other is selected', async ({ page }) => {
      await page.goto('/analysis.html');

      await page.selectOption('#videoLocation', 'Other');

      const otherGroup = page.locator('#videoLocationOtherGroup');
      await expect(otherGroup).not.toHaveClass(/d-none/);

      const otherField = page.locator('#videoLocationOther');
      await expect(otherField).toBeVisible();
    });

    test('2.4.5 Cannot submit with empty Specify Storage Location when Other selected', async ({ page }) => {
      await page.goto('/analysis.html');

      await fillAnalysisForm(page, analysisFormMinimalData);
      await page.selectOption('#videoLocation', 'Other');

      await submitFormAndConfirm(page);

      const otherField = page.locator('#videoLocationOther');
      await expect(otherField).toHaveClass(/is-invalid/);
    });

    test('2.4.6 Can submit with filled Specify Storage Location', async ({ page }) => {
      await page.goto('/analysis.html');

      await fillAnalysisForm(page, analysisFormWithOtherVideoLocation);

      await submitFormAndConfirm(page);

      const otherField = page.locator('#videoLocationOther');
      await expect(otherField).not.toHaveClass(/is-invalid/);
    });

    test('2.4.7 Field clears when changing to standard location', async ({ page }) => {
      await page.goto('/analysis.html');

      await page.selectOption('#videoLocation', 'Other');
      // Click field first to remove readonly (autofill prevention)
      const otherField = page.locator('#videoLocationOther');
      await otherField.click();
      await otherField.fill('Cloud Storage');

      await page.selectOption('#videoLocation', 'Evidence.com');

      const value = await otherField.inputValue();
      expect(value).toBe('');
    });
  });

  test.describe('2.5 Locker Selection Shows Bag and Locker Number Fields', () => {
    test('2.5.1 Locker info group is hidden by default', async ({ page }) => {
      await page.goto('/analysis.html');

      const lockerGroup = page.locator('#lockerInfoGroup');
      await expect(lockerGroup).toHaveClass(/d-none/);
    });

    test('2.5.2 Locker info group does NOT appear for NAS Storage', async ({ page }) => {
      await page.goto('/analysis.html');

      await page.selectOption('#videoLocation', 'NAS Storage');

      const lockerGroup = page.locator('#lockerInfoGroup');
      await expect(lockerGroup).toHaveClass(/d-none/);
    });

    test('2.5.3 Locker info group appears when Locker is selected', async ({ page }) => {
      await page.goto('/analysis.html');

      await page.selectOption('#videoLocation', 'Locker');

      const lockerGroup = page.locator('#lockerInfoGroup');
      await expect(lockerGroup).not.toHaveClass(/d-none/);

      // Both fields should be visible
      await expect(page.locator('#bagNumber')).toBeVisible();
      await expect(page.locator('#lockerNumber')).toBeVisible();
    });

    test('2.5.4 Bag Number is OPTIONAL even when Locker is selected', async ({ page }) => {
      await page.goto('/analysis.html');

      await fillAnalysisForm(page, analysisFormMinimalData);
      await page.selectOption('#videoLocation', 'Locker');
      // Leave bagNumber empty

      await submitFormAndConfirm(page);

      // bagNumber should NOT have validation error
      const bagField = page.locator('#bagNumber');
      await expect(bagField).not.toHaveClass(/is-invalid/);
    });

    test('2.5.5 Locker Number is OPTIONAL even when Locker is selected', async ({ page }) => {
      await page.goto('/analysis.html');

      await fillAnalysisForm(page, analysisFormMinimalData);
      await page.selectOption('#videoLocation', 'Locker');
      // Leave lockerNumber empty

      await submitFormAndConfirm(page);

      // lockerNumber should NOT have validation error
      const lockerField = page.locator('#lockerNumber');
      await expect(lockerField).not.toHaveClass(/is-invalid/);
    });

    test('2.5.6 Locker Number validates range 1-28 when filled', async ({ page }) => {
      await page.goto('/analysis.html');

      await page.selectOption('#videoLocation', 'Locker');
      // Click field first to remove readonly (autofill prevention)
      const lockerField = page.locator('#lockerNumber');
      await lockerField.click();
      await lockerField.fill('29');
      await lockerField.blur();

      await expect(lockerField).toHaveClass(/is-invalid/);
    });

    test('2.5.7 Locker Number accepts valid values 1-28', async ({ page }) => {
      await page.goto('/analysis.html');

      await page.selectOption('#videoLocation', 'Locker');
      // Click field first to remove readonly (autofill prevention)
      const lockerField = page.locator('#lockerNumber');
      await lockerField.click();
      await lockerField.fill('15');
      await lockerField.blur();

      await expect(lockerField).not.toHaveClass(/is-invalid/);
    });

    test('2.5.8 Locker Number rejects non-numeric input', async ({ page }) => {
      await page.goto('/analysis.html');

      await page.selectOption('#videoLocation', 'Locker');
      // Click field first to remove readonly (autofill prevention)
      const lockerField = page.locator('#lockerNumber');
      await lockerField.click();
      await lockerField.fill('abc');
      await lockerField.blur();

      await expect(lockerField).toHaveClass(/is-invalid/);
    });

    test('2.5.9 Locker info fields clear when changing to different location', async ({ page }) => {
      await page.goto('/analysis.html');

      await page.selectOption('#videoLocation', 'Locker');
      // Click fields first to remove readonly (autofill prevention)
      const bagField = page.locator('#bagNumber');
      await bagField.click();
      await bagField.fill('123456');

      const lockerField = page.locator('#lockerNumber');
      await lockerField.click();
      await lockerField.fill('10');

      await page.selectOption('#videoLocation', 'NAS Storage');

      expect(await bagField.inputValue()).toBe('');
      expect(await lockerField.inputValue()).toBe('');
    });

    test('2.5.10 Can submit with both locker fields filled', async ({ page }) => {
      await page.goto('/analysis.html');

      await fillAnalysisForm(page, analysisFormWithLockerSelected);

      await submitFormAndConfirm(page);

      // Check for success (no validation errors on locker fields)
      const bagField = page.locator('#bagNumber');
      const lockerField = page.locator('#lockerNumber');
      await expect(bagField).not.toHaveClass(/is-invalid/);
      await expect(lockerField).not.toHaveClass(/is-invalid/);
    });
  });

  test.describe('2.6 Service Required Conditional Field', () => {
    test('2.6.1 Specify Service Required field is hidden by default', async ({ page }) => {
      await page.goto('/analysis.html');

      const otherGroup = page.locator('#serviceRequiredOtherGroup');
      await expect(otherGroup).toHaveClass(/d-none/);
    });

    test('2.6.2 Specify Service Required does NOT appear for Video/Image Clarification', async ({ page }) => {
      await page.goto('/analysis.html');

      await page.selectOption('#serviceRequired', 'Video/Image Clarification');

      const otherGroup = page.locator('#serviceRequiredOtherGroup');
      await expect(otherGroup).toHaveClass(/d-none/);
    });

    test('2.6.3 Specify Service Required appears when Other is selected', async ({ page }) => {
      await page.goto('/analysis.html');

      await page.selectOption('#serviceRequired', 'Other');

      const otherGroup = page.locator('#serviceRequiredOtherGroup');
      await expect(otherGroup).not.toHaveClass(/d-none/);

      const otherField = page.locator('#serviceRequiredOther');
      await expect(otherField).toBeVisible();
    });

    test('2.6.4 Cannot submit with empty Specify Service Required when Other selected', async ({ page }) => {
      await page.goto('/analysis.html');

      await fillAnalysisForm(page, analysisFormMinimalData);
      await page.selectOption('#serviceRequired', 'Other');

      await submitFormAndConfirm(page);

      const otherField = page.locator('#serviceRequiredOther');
      await expect(otherField).toHaveClass(/is-invalid/);
    });

    test('2.6.5 Can submit with filled Specify Service Required', async ({ page }) => {
      await page.goto('/analysis.html');

      await fillAnalysisForm(page, analysisFormWithOtherService);

      await submitFormAndConfirm(page);

      const otherField = page.locator('#serviceRequiredOther');
      await expect(otherField).not.toHaveClass(/is-invalid/);
    });

    test('2.6.6 Field clears when changing to standard service', async ({ page }) => {
      await page.goto('/analysis.html');

      await page.selectOption('#serviceRequired', 'Other');
      // Click field first to remove readonly (autofill prevention)
      const otherField = page.locator('#serviceRequiredOther');
      await otherField.click();
      await otherField.fill('Custom Service');

      await page.selectOption('#serviceRequired', 'Timeline');

      const value = await otherField.inputValue();
      expect(value).toBe('');
    });
  });

  test.describe('2.7 Recording Date Validation (Optional Field)', () => {
    test('2.7.1 Recording Date is optional - empty is valid', async ({ page }) => {
      await page.goto('/analysis.html');

      await fillAnalysisForm(page, analysisFormMinimalData);
      // recordingDate is not filled in analysisFormMinimalData

      await submitFormAndConfirm(page);

      const field = page.locator('#recordingDate');
      await expect(field).not.toHaveClass(/is-invalid/);
    });

    test('2.7.2 Accepts todays date', async ({ page }) => {
      await page.goto('/analysis.html');

      // For Flatpickr fields, we use evaluate to set the value directly
      const today = dateHelpers.getTodayISO();
      await page.evaluate((dateValue) => {
        const field = document.querySelector('#recordingDate');
        field._flatpickr?.setDate(dateValue, true);
      }, today);
      await page.locator('#recordingDate').blur();

      const field = page.locator('#recordingDate');
      await expect(field).not.toHaveClass(/is-invalid/);
    });

    test('2.7.3 Accepts yesterdays date', async ({ page }) => {
      await page.goto('/analysis.html');

      // For Flatpickr fields, we use evaluate to set the value directly
      const yesterday = dateHelpers.getYesterdayISO();
      await page.evaluate((dateValue) => {
        const field = document.querySelector('#recordingDate');
        field._flatpickr?.setDate(dateValue, true);
      }, yesterday);
      await page.locator('#recordingDate').blur();

      const field = page.locator('#recordingDate');
      await expect(field).not.toHaveClass(/is-invalid/);
    });

    test('2.7.4 Accepts old date (from 2020)', async ({ page }) => {
      await page.goto('/analysis.html');

      // For Flatpickr fields, we use evaluate to set the value directly
      await page.evaluate(() => {
        const field = document.querySelector('#recordingDate');
        field._flatpickr?.setDate('2020-01-15', true);
      });
      await page.locator('#recordingDate').blur();

      const field = page.locator('#recordingDate');
      await expect(field).not.toHaveClass(/is-invalid/);
    });

    test('2.7.5 Rejects future date', async ({ page }) => {
      await page.goto('/analysis.html');

      // For Flatpickr fields, we use evaluate to set the value directly
      const tomorrow = dateHelpers.getTomorrowISO();
      await page.evaluate((dateValue) => {
        const field = document.querySelector('#recordingDate');
        field._flatpickr?.setDate(dateValue, true);
      }, tomorrow);
      await page.locator('#recordingDate').blur();

      const field = page.locator('#recordingDate');
      await expect(field).toHaveClass(/is-invalid/);
    });

    test('2.7.6 Uses Flatpickr for date input', async ({ page }) => {
      await page.goto('/analysis.html');

      // Click on the date field and check for Flatpickr calendar
      await page.click('#recordingDate');

      // Flatpickr creates a calendar element with class .flatpickr-calendar
      // and adds the .open class when active
      const flatpickrCalendar = page.locator('.flatpickr-calendar.open');
      await expect(flatpickrCalendar).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('2.8 Email Validation', () => {
    test('2.8.1 Accepts valid @peelpolice.ca email', async ({ page }) => {
      await page.goto('/analysis.html');

      // Click field first to remove readonly (autofill prevention)
      const field = page.locator('#requestingEmail');
      await field.click();
      await field.fill('test.officer@peelpolice.ca');
      await field.blur();

      await expect(field).not.toHaveClass(/is-invalid/);
    });

    test('2.8.2 Rejects non-peelpolice.ca email', async ({ page }) => {
      await page.goto('/analysis.html');

      // Click field first to remove readonly (autofill prevention)
      const field = page.locator('#requestingEmail');
      await field.click();
      await field.fill('test@gmail.com');
      await field.blur();

      await expect(field).toHaveClass(/is-invalid/);
    });

    test('2.8.3 Rejects email without @ symbol', async ({ page }) => {
      await page.goto('/analysis.html');

      // Click field first to remove readonly (autofill prevention)
      const field = page.locator('#requestingEmail');
      await field.click();
      await field.fill('testofficerpeelpolice.ca');
      await field.blur();

      await expect(field).toHaveClass(/is-invalid/);
    });
  });

  test.describe('2.9 Phone Validation', () => {
    test('2.9.1 Accepts 10 digit phone number', async ({ page }) => {
      await page.goto('/analysis.html');

      // Click field first to remove readonly (autofill prevention)
      const field = page.locator('#requestingPhone');
      await field.click();
      await field.fill('9051234567');
      await field.blur();

      await expect(field).not.toHaveClass(/is-invalid/);
    });

    test('2.9.2 Rejects phone number with less than 10 digits', async ({ page }) => {
      await page.goto('/analysis.html');

      // Click field first to remove readonly (autofill prevention)
      const field = page.locator('#requestingPhone');
      await field.click();
      await field.fill('123');
      await field.blur();

      await expect(field).toHaveClass(/is-invalid/);
    });

    test('2.9.3 Rejects phone number with more than 10 digits', async ({ page }) => {
      await page.goto('/analysis.html');

      // Click field first to remove readonly (autofill prevention)
      const field = page.locator('#requestingPhone');
      await field.click();
      await field.fill('12345678901');
      await field.blur();

      await expect(field).toHaveClass(/is-invalid/);
    });
  });

  test.describe('2.10 Occurrence Number Validation', () => {
    test('2.10.1 Accepts valid PR format occurrence number', async ({ page }) => {
      await page.goto('/analysis.html');

      // Click field first to remove readonly (autofill prevention)
      const field = page.locator('#occNumber');
      await field.click();
      await field.fill('PR2024123456');
      await field.blur();

      await expect(field).not.toHaveClass(/is-invalid/);
    });

    test('2.10.2 Rejects occurrence number without PR prefix', async ({ page }) => {
      await page.goto('/analysis.html');

      // Click field first to remove readonly (autofill prevention)
      const field = page.locator('#occNumber');
      await field.click();
      await field.fill('2024123456');
      await field.blur();

      await expect(field).toHaveClass(/is-invalid/);
    });

    test('2.10.3 Rejects PR without numbers', async ({ page }) => {
      await page.goto('/analysis.html');

      // Click field first to remove readonly (autofill prevention)
      const field = page.locator('#occNumber');
      await field.click();
      await field.fill('PR');
      await field.blur();

      await expect(field).toHaveClass(/is-invalid/);
    });
  });

  test.describe('2.11 Progress Bar', () => {
    test('2.11.1 Empty form shows 0% progress', async ({ page }) => {
      await page.goto('/analysis.html');

      const progress = await getProgressPercentage(page);
      expect(progress).toBe(0);
    });

    test('2.11.2 Progress increases when filling required fields', async ({ page }) => {
      await page.goto('/analysis.html');

      const initialProgress = await getProgressPercentage(page);

      // Click field first to remove readonly (autofill prevention)
      const field = page.locator('#occNumber');
      await field.click();
      await field.fill('PR2024001234');

      const newProgress = await getProgressPercentage(page);
      expect(newProgress).toBeGreaterThan(initialProgress);
    });

    test('2.11.3 Progress reaches 100% with all required fields filled', async ({ page }) => {
      await page.goto('/analysis.html');

      await fillAnalysisForm(page, analysisFormMinimalData);

      const progress = await getProgressPercentage(page);
      expect(progress).toBe(100);
    });

    test('2.11.4 Progress bar color changes based on completion percentage', async ({ page }) => {
      await page.goto('/analysis.html');

      // At 0% - should be red (danger color)
      const progressBar = page.locator('#form-progress');
      const initialColor = await progressBar.evaluate(el => getComputedStyle(el).backgroundColor);

      // Fill a few fields to get to medium progress
      await fillAnalysisForm(page, analysisFormMinimalData);

      // At 100% - should be green (success color)
      const finalColor = await progressBar.evaluate(el => getComputedStyle(el).backgroundColor);

      // Colors should be different (exact values depend on CSS variables)
      expect(initialColor).not.toBe(finalColor);
    });
  });

  test.describe('2.12 Draft Auto-Save', () => {
    test('2.12.1 Draft auto-saves and can be loaded', async ({ page }) => {
      await page.goto('/analysis.html');

      await fillAnalysisForm(page, analysisFormValidData);
      await waitForAutoSave(page);

      await page.reload();

      const draftButton = page.locator('[id="draft-button"]');
      const buttonText = await draftButton.textContent();
      expect(buttonText).toContain('Load Draft');

      await loadDraft(page);

      const occValue = await page.locator('#occNumber').inputValue();
      expect(occValue).toBe(analysisFormValidData.occNumber);
    });

    test('2.12.2 Draft preserves all form field values', async ({ page }) => {
      await page.goto('/analysis.html');

      await fillAnalysisForm(page, analysisFormValidData);
      await waitForAutoSave(page);

      await page.reload();
      await loadDraft(page);

      // Check multiple fields are restored
      expect(await page.locator('#occNumber').inputValue()).toBe(analysisFormValidData.occNumber);
      expect(await page.locator('#rName').inputValue()).toBe(analysisFormValidData.rName);
      expect(await page.locator('#badge').inputValue()).toBe(analysisFormValidData.badge);
      expect(await page.locator('#requestingEmail').inputValue()).toBe(analysisFormValidData.requestingEmail);
    });

    test('2.12.3 Draft preserves select field values', async ({ page }) => {
      await page.goto('/analysis.html');

      await fillAnalysisForm(page, analysisFormValidData);
      await waitForAutoSave(page);

      await page.reload();
      await loadDraft(page);

      expect(await page.locator('#offenceType').inputValue()).toBe(analysisFormValidData.offenceType);
      expect(await page.locator('#videoLocation').inputValue()).toBe(analysisFormValidData.videoLocation);
      expect(await page.locator('#serviceRequired').inputValue()).toBe(analysisFormValidData.serviceRequired);
    });
  });

  test.describe('2.13 Officer Info Persistence', () => {
    test('2.13.1 Officer info pre-fills if saved from previous form', async ({ page }) => {
      // First fill officer info on upload form
      await page.goto('/upload.html');
      await fillOfficerInfo(page, validOfficerData);
      await waitForAutoSave(page);

      // Then go to analysis form
      await page.goto('/analysis.html');

      const nameValue = await page.locator('#rName').inputValue();
      expect(nameValue).toBe(validOfficerData.rName);
    });

    test('2.13.2 Officer fields remain empty if cleared', async ({ page }) => {
      await page.goto('/analysis.html');

      const nameValue = await page.locator('#rName').inputValue();
      expect(nameValue).toBe('');
    });

    test('2.13.3 All officer fields pre-fill from storage', async ({ page }) => {
      // First fill officer info on upload form
      await page.goto('/upload.html');
      await fillOfficerInfo(page, validOfficerData);
      await waitForAutoSave(page);

      // Then go to analysis form
      await page.goto('/analysis.html');

      expect(await page.locator('#rName').inputValue()).toBe(validOfficerData.rName);
      expect(await page.locator('#badge').inputValue()).toBe(validOfficerData.badge);
      expect(await page.locator('#requestingEmail').inputValue()).toBe(validOfficerData.requestingEmail);
      expect(await page.locator('#requestingPhone').inputValue()).toBe(validOfficerData.requestingPhone);
    });
  });

  test.describe('2.14 Theme Toggle', () => {
    test('2.14.1 Theme toggle switches between dark and light', async ({ page }) => {
      await page.goto('/analysis.html');

      const initialTheme = await page.getAttribute('html', 'data-theme');
      await toggleTheme(page);
      const newTheme = await page.getAttribute('html', 'data-theme');

      expect(newTheme).not.toBe(initialTheme);
    });

    test('2.14.2 Theme persists across page reload', async ({ page }) => {
      await page.goto('/analysis.html');

      await toggleTheme(page);
      const themeAfterToggle = await page.getAttribute('html', 'data-theme');

      await page.reload();
      const themeAfterReload = await page.getAttribute('html', 'data-theme');

      expect(themeAfterReload).toBe(themeAfterToggle);
    });
  });

  test.describe('2.15 Form Clear/Reset', () => {
    test('2.15.1 Clear button resets all form fields', async ({ page }) => {
      await page.goto('/analysis.html');

      await fillAnalysisForm(page, analysisFormValidData);

      // Click clear/reset button
      await page.click('button[type="reset"]');

      // All fields should be empty or at default
      expect(await page.locator('#occNumber').inputValue()).toBe('');
      expect(await page.locator('#rName').inputValue()).toBe('');
      expect(await page.locator('#jobRequired').inputValue()).toBe('');
    });

    test('2.15.2 Clear button resets select fields to default', async ({ page }) => {
      await page.goto('/analysis.html');

      await fillAnalysisForm(page, analysisFormValidData);
      await page.click('button[type="reset"]');

      // Select fields should be at default (empty value)
      expect(await page.locator('#offenceType').inputValue()).toBe('');
      expect(await page.locator('#videoLocation').inputValue()).toBe('');
      expect(await page.locator('#serviceRequired').inputValue()).toBe('');
    });

    test('2.15.3 Clear hides conditional fields', async ({ page }) => {
      await page.goto('/analysis.html');

      // Show conditional fields
      await page.selectOption('#offenceType', 'Other');
      await page.selectOption('#videoLocation', 'Locker');
      await page.selectOption('#serviceRequired', 'Other');

      // Reset form
      await page.click('button[type="reset"]');

      // Conditional fields should be hidden
      await expect(page.locator('#offenceTypeOtherGroup')).toHaveClass(/d-none/);
      await expect(page.locator('#lockerInfoGroup')).toHaveClass(/d-none/);
      await expect(page.locator('#serviceRequiredOtherGroup')).toHaveClass(/d-none/);
    });
  });

  test.describe('2.16 Successful Submission', () => {
    test('2.16.1 Valid form can be submitted', async ({ page }) => {
      // beforeEach already loads the page - no need for another goto
      await fillAnalysisForm(page, analysisFormMinimalData);

      await submitFormAndConfirm(page);

      // Wait for submission and check for success indicator
      // Toast uses class: toast-message toast-success
      const successToast = page.locator('.toast-message.toast-success, .toast-success');
      await expect(successToast).toBeVisible({ timeout: 15000 });
    });

    test('2.16.2 Success message appears after submission', async ({ page }) => {
      // beforeEach already loads the page - no need for another goto
      await fillAnalysisForm(page, analysisFormMinimalData);

      await submitFormAndConfirm(page);

      // Toast uses class: toast-message toast-success
      const toast = page.locator('.toast-message');
      await expect(toast).toBeVisible({ timeout: 15000 });
    });

    test('2.16.3 Form with optional fields can be submitted', async ({ page }) => {
      // beforeEach already loads the page - no need for another goto
      await fillAnalysisForm(page, analysisFormValidData);

      await submitFormAndConfirm(page);

      const successToast = page.locator('.toast-message.toast-success, .toast-success');
      await expect(successToast).toBeVisible({ timeout: 15000 });
    });

    test('2.16.4 Form with Other fields can be submitted', async ({ page }) => {
      // beforeEach already loads the page - no need for another goto
      await fillAnalysisForm(page, analysisFormWithOtherService);

      await submitFormAndConfirm(page);

      const successToast = page.locator('.toast-message.toast-success, .toast-success');
      await expect(successToast).toBeVisible({ timeout: 15000 });
    });

    test('2.16.5 Form with Locker selected can be submitted', async ({ page }) => {
      // beforeEach already loads the page - no need for another goto
      await fillAnalysisForm(page, analysisFormWithLockerSelected);

      await submitFormAndConfirm(page);

      const successToast = page.locator('.toast-message.toast-success, .toast-success');
      await expect(successToast).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe('2.17 No City Field Tests (Removed from Analysis Form)', () => {
    test('2.17.1 City field does NOT exist in Analysis form', async ({ page }) => {
      await page.goto('/analysis.html');

      // City field should NOT exist
      const cityField = page.locator('#city, [name="city"]');
      await expect(cityField).toHaveCount(0);
    });

    test('2.17.2 City Other field does NOT exist in Analysis form', async ({ page }) => {
      await page.goto('/analysis.html');

      // City Other field should NOT exist
      const cityOtherField = page.locator('#cityOther, [name="cityOther"]');
      await expect(cityOtherField).toHaveCount(0);
    });
  });
});
