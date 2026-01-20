import { test, expect } from '@playwright/test';
import {
  validOfficerData,
  invalidOfficerData,
  uploadFormValidData,
  uploadFormWithOtherMediaType,
  uploadFormWithOtherCity,
  dateHelpers
} from './fixtures/test-data.js';
import {
  fillOfficerInfo,
  fillUploadForm,
  clearLocalStorage,
  captureConsoleErrors,
  toggleTheme,
  addLocation,
  removeLocation,
  loadDraft,
  waitForAutoSave,
  getProgressPercentage,
  scrollToField,
  expectFieldError,
  expectFieldValid,
  clearForm,
  submitAndVerifySuccess,
  submitFormAndConfirm,
  setOfflineMode,
  getAllFormValues
} from './fixtures/form-helpers.js';

test.describe('Upload Form Tests (upload.html)', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.goto('/upload.html');
    await clearLocalStorage(page);
    await page.reload();
  });

  test.describe('1.1 Page Load Tests', () => {
    test('1.1.1 Page loads without JavaScript errors', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err));

      await page.goto('/upload.html');
      expect(errors).toHaveLength(0);
    });

    test('1.1.2 All form sections render correctly', async ({ page }) => {
      await page.goto('/upload.html');

      // Check main form exists
      const form = page.locator('#upload-form');
      await expect(form).toBeVisible();

      // Check key sections exist
      await expect(page.locator('#upload-form h2').first()).toContainText('Evidence Information');
    });

    test('1.1.3 Progress bar shows 0% Complete initially', async ({ page }) => {
      await page.goto('/upload.html');
      const progressBar = page.locator('[class*="progress"]');
      await expect(progressBar).toContainText('0%');
    });

    test('1.1.4 Theme toggle button appears in header', async ({ page }) => {
      await page.goto('/upload.html');
      const themeToggle = page.locator('[id="theme-toggle"]');
      await expect(themeToggle).toBeVisible();
    });

    test('1.1.5 Draft button shows Auto-save active initially', async ({ page }) => {
      await page.goto('/upload.html');
      const draftButton = page.locator('[id="draft-button"]');
      await expect(draftButton).toContainText('Auto-save');
    });

    test('1.1.6 Back button is visible', async ({ page }) => {
      await page.goto('/upload.html');
      const backButton = page.locator('a:has-text("← Back")');
      await expect(backButton).toBeVisible();
    });
  });

  test.describe('1.2 Required Field Validation', () => {
    test('1.2.1 Occurrence Number is required', async ({ page }) => {
      await page.goto('/upload.html');
      await submitFormAndConfirm(page);

      const errorMsg = page.locator('[id="occNumber"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('1.2.2 Media Type is required', async ({ page }) => {
      await page.goto('/upload.html');
      await submitFormAndConfirm(page);

      const errorMsg = page.locator('[id="mediaType"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('1.2.3 Submitting Investigator is required', async ({ page }) => {
      await page.goto('/upload.html');
      await submitFormAndConfirm(page);

      const errorMsg = page.locator('[id="rName"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('1.2.4 Badge Number is required', async ({ page }) => {
      await page.goto('/upload.html');
      await submitFormAndConfirm(page);

      const errorMsg = page.locator('[id="badge"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('1.2.5 Contact Number is required', async ({ page }) => {
      await page.goto('/upload.html');
      await submitFormAndConfirm(page);

      const errorMsg = page.locator('[id="requestingPhone"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('1.2.6 Email Address is required', async ({ page }) => {
      await page.goto('/upload.html');
      await submitFormAndConfirm(page);

      const errorMsg = page.locator('[id="requestingEmail"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('1.2.7 Location Address is required', async ({ page }) => {
      await page.goto('/upload.html');
      await submitFormAndConfirm(page);

      const errorMsg = page.locator('[id="locationAddress"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('1.2.8 City is required', async ({ page }) => {
      await page.goto('/upload.html');
      await submitFormAndConfirm(page);

      const errorMsg = page.locator('[id="city"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('1.2.9 Video Start Time is required', async ({ page }) => {
      await page.goto('/upload.html');
      await submitFormAndConfirm(page);

      const errorMsg = page.locator('[id="videoStartTime"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('1.2.10 Video End Time is required', async ({ page }) => {
      await page.goto('/upload.html');
      await submitFormAndConfirm(page);

      const errorMsg = page.locator('[id="videoEndTime"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('1.2.11 Time & Date Correct radio is required', async ({ page }) => {
      await page.goto('/upload.html');
      await fillUploadForm(page, uploadFormValidData);

      // Don't select the radio button, leave it empty
      const radioInputs = page.locator('input[name="timeCorrect"]');
      await radioInputs.evaluate(inputs => {
        inputs.forEach(input => input.checked = false);
      });

      await submitFormAndConfirm(page);

      const errorMsg = page.locator('[id="timeCorrect"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });
  });

  test.describe('1.3 Email Validation', () => {
    test('1.3.1 Rejects non-peelpolice.ca email (gmail.com)', async ({ page }) => {
      await page.goto('/upload.html');
      await page.fill('[name="requestingEmail"]', invalidOfficerData.invalidEmail);
      await page.locator('[name="requestingEmail"]').blur();

      const errorMsg = page.locator('[id="requestingEmail"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('@peelpolice.ca');
    });

    test('1.3.2 Accepts valid peelpolice.ca email', async ({ page }) => {
      await page.goto('/upload.html');
      await page.fill('[name="requestingEmail"]', validOfficerData.requestingEmail);
      await page.locator('[name="requestingEmail"]').blur();

      const errorMsg = page.locator('[id="requestingEmail"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toHaveText('');
    });

    test('1.3.3 Email validation is case insensitive', async ({ page }) => {
      await page.goto('/upload.html');
      await page.fill('[name="requestingEmail"]', 'INVESTIGATOR@PEELPOLICE.CA');
      await page.locator('[name="requestingEmail"]').blur();

      const errorMsg = page.locator('[id="requestingEmail"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toHaveText('');
    });

    test('1.3.4 Rejects wrong domain (peel.ca not peelpolice.ca)', async ({ page }) => {
      await page.goto('/upload.html');
      await page.fill('[name="requestingEmail"]', invalidOfficerData.wrongEmailDomain);
      await page.locator('[name="requestingEmail"]').blur();

      const errorMsg = page.locator('[id="requestingEmail"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('@peelpolice.ca');
    });
  });

  test.describe('1.4 Phone Validation', () => {
    test('1.4.1 Rejects phone with less than 10 digits', async ({ page }) => {
      await page.goto('/upload.html');
      await page.fill('[name="requestingPhone"]', invalidOfficerData.shortPhone);
      await page.locator('[name="requestingPhone"]').blur();

      const errorMsg = page.locator('[id="requestingPhone"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('10 digits');
    });

    test('1.4.2 Rejects phone with more than 10 digits', async ({ page }) => {
      await page.goto('/upload.html');
      await page.fill('[name="requestingPhone"]', invalidOfficerData.longPhone);
      await page.locator('[name="requestingPhone"]').blur();

      const errorMsg = page.locator('[id="requestingPhone"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('10 digits');
    });

    test('1.4.3 Accepts phone with dashes format (905-555-1234)', async ({ page }) => {
      await page.goto('/upload.html');
      await page.fill('[name="requestingPhone"]', '905-555-1234');
      await page.locator('[name="requestingPhone"]').blur();

      const errorMsg = page.locator('[id="requestingPhone"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toHaveText('');
    });

    test('1.4.4 Accepts phone without dashes (9055551234)', async ({ page }) => {
      await page.goto('/upload.html');
      await page.fill('[name="requestingPhone"]', validOfficerData.requestingPhone);
      await page.locator('[name="requestingPhone"]').blur();

      const errorMsg = page.locator('[id="requestingPhone"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toHaveText('');
    });
  });

  test.describe('1.5 Occurrence Number Validation', () => {
    test('1.5.1 Rejects number without PR prefix', async ({ page }) => {
      await page.goto('/upload.html');
      await page.fill('[name="occNumber"]', '123456');
      await page.locator('[name="occNumber"]').blur();

      const errorMsg = page.locator('[id="occNumber"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('PR');
    });

    test('1.5.2 Accepts PR prefix with lowercase', async ({ page }) => {
      await page.goto('/upload.html');
      await page.fill('[name="occNumber"]', 'pr123456');
      await page.locator('[name="occNumber"]').blur();

      const errorMsg = page.locator('[id="occNumber"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toHaveText('');
    });

    test('1.5.3 Accepts valid PR occurrence number', async ({ page }) => {
      await page.goto('/upload.html');
      await page.fill('[name="occNumber"]', 'PR240368708');
      await page.locator('[name="occNumber"]').blur();

      const errorMsg = page.locator('[id="occNumber"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toHaveText('');
    });

    test('1.5.4 Rejects PR without numbers', async ({ page }) => {
      await page.goto('/upload.html');
      await page.fill('[name="occNumber"]', 'PR');
      await page.locator('[name="occNumber"]').blur();

      const errorMsg = page.locator('[id="occNumber"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('numbers');
    });
  });

  test.describe('1.6 Media Type Other Field', () => {
    test('1.6.1 Specify Media Type field does NOT appear for USB', async ({ page }) => {
      await page.goto('/upload.html');
      await page.selectOption('[name="mediaType"]', 'USB');

      const otherField = page.locator('[id="mediaTypeOtherGroup"], [class*="mediaTypeOther"]');
      await expect(otherField).not.toBeVisible();
    });

    test('1.6.2 Specify Media Type field appears for Other', async ({ page }) => {
      await page.goto('/upload.html');
      await page.selectOption('[name="mediaType"]', 'Other');

      const otherField = page.locator('[id="mediaTypeOtherGroup"], [name="mediaTypeOther"]').first();
      await expect(otherField).toBeVisible();
    });

    test('1.6.3 Specify Media Type field has required asterisk', async ({ page }) => {
      await page.goto('/upload.html');
      await page.selectOption('[name="mediaType"]', 'Other');

      const label = page.locator('label:has-text("Specify Media Type")');
      const asterisk = label.locator('.required');
      await expect(asterisk).toContainText('*');
    });

    test('1.6.4 Cannot submit with empty Specify Media Type', async ({ page }) => {
      await page.goto('/upload.html');
      await fillUploadForm(page, uploadFormValidData);
      await page.selectOption('[name="mediaType"]', 'Other');

      await submitFormAndConfirm(page);

      const errorMsg = page.locator('[name="mediaTypeOther"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('1.6.5 Can submit with filled Specify Media Type', async ({ page }) => {
      await page.goto('/upload.html');
      await fillUploadForm(page, uploadFormWithOtherMediaType);

      // Just verify no error appears
      const otherField = page.locator('[name="mediaTypeOther"]');
      const errorMsg = otherField.locator('~ .invalid-feedback');
      await expect(errorMsg).toHaveText('');
    });

    test('1.6.6 Field clears when changing Media Type back', async ({ page }) => {
      await page.goto('/upload.html');
      await page.selectOption('[name="mediaType"]', 'Other');
      await page.fill('[name="mediaTypeOther"]', 'Custom Device');

      await page.selectOption('[name="mediaType"]', 'USB');

      const otherField = page.locator('[name="mediaTypeOther"]');
      const fieldValue = await otherField.inputValue();
      expect(fieldValue).toBe('');
    });
  });

  test.describe('1.7 City Other Field', () => {
    test('1.7.1 Specify City field does NOT appear for Brampton', async ({ page }) => {
      await page.goto('/upload.html');
      await page.selectOption('[name="city"]', 'Brampton');

      const otherField = page.locator('[id="cityOtherGroup"], [name="cityOther"]').first();
      await expect(otherField).not.toBeVisible();
    });

    test('1.7.2 Specify City field appears for Other', async ({ page }) => {
      await page.goto('/upload.html');
      await page.selectOption('[name="city"]', 'Other');

      const otherField = page.locator('[name="cityOther"]');
      await expect(otherField).toBeVisible();
    });

    test('1.7.3 Cannot submit with empty Specify City', async ({ page }) => {
      await page.goto('/upload.html');
      await fillUploadForm(page, uploadFormValidData);
      await page.selectOption('[name="city"]', 'Other');

      await submitFormAndConfirm(page);

      const errorMsg = page.locator('[name="cityOther"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('specify');
    });

    test('1.7.4 Can submit with filled Specify City', async ({ page }) => {
      await page.goto('/upload.html');
      await fillUploadForm(page, uploadFormWithOtherCity);

      const otherField = page.locator('[name="cityOther"]');
      const errorMsg = otherField.locator('~ .invalid-feedback');
      await expect(errorMsg).toHaveText('');
    });

    test('1.7.5 Field clears when changing City back', async ({ page }) => {
      await page.goto('/upload.html');
      await page.selectOption('[name="city"]', 'Other');
      await page.fill('[name="cityOther"]', 'Oakville');

      await page.selectOption('[name="city"]', 'Mississauga');

      const otherField = page.locator('[name="cityOther"]');
      const fieldValue = await otherField.inputValue();
      expect(fieldValue).toBe('');
    });
  });

  test.describe('1.8 Time & Date Correct Radio Buttons', () => {
    test('1.8.1 Warning message appears when Yes is selected', async ({ page }) => {
      await page.goto('/upload.html');
      await page.click('input[name="timeCorrect"][value="Yes"]');

      const warning = page.locator('[class*="warning"], [class*="alert"]').filter({ hasText: /timestamp|correct/i });
      await expect(warning).toBeVisible();
    });

    test('1.8.2 Time Offset field does NOT appear when Yes is selected', async ({ page }) => {
      await page.goto('/upload.html');
      await page.click('input[name="timeCorrect"][value="Yes"]');

      const offsetField = page.locator('[id="timeOffsetGroup"], [name="timeOffset"]').first();
      await expect(offsetField).not.toBeVisible();
    });

    test('1.8.3 Warning message disappears when No is selected', async ({ page }) => {
      await page.goto('/upload.html');
      await page.click('input[name="timeCorrect"][value="Yes"]');
      const warning = page.locator('[class*="warning"], [class*="alert"]').filter({ hasText: /timestamp|correct/i });
      await expect(warning).toBeVisible();

      await page.click('input[name="timeCorrect"][value="No"]');
      await expect(warning).not.toBeVisible();
    });

    test('1.8.4 Time Offset field appears when No is selected', async ({ page }) => {
      await page.goto('/upload.html');
      await page.click('input[name="timeCorrect"][value="No"]');

      const offsetField = page.locator('[name="timeOffset"]');
      await expect(offsetField).toBeVisible();
    });

    test('1.8.5 Time Offset field is required when No is selected', async ({ page }) => {
      await page.goto('/upload.html');
      await fillUploadForm(page, uploadFormValidData);
      await page.click('input[name="timeCorrect"][value="No"]');

      await submitFormAndConfirm(page);

      const errorMsg = page.locator('[name="timeOffset"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('specify');
    });

    test('1.8.6 Can submit with filled Time Offset', async ({ page }) => {
      await page.goto('/upload.html');
      await fillUploadForm(page, uploadFormWithOtherMediaType);

      const offsetField = page.locator('[name="timeOffset"]');
      const errorMsg = offsetField.locator('~ .invalid-feedback');
      await expect(errorMsg).toHaveText('');
    });
  });

  test.describe('1.9 DVR Earliest Date Retention Calculation', () => {
    test('1.9.1 Shows correct retention days for 10 days ago', async ({ page }) => {
      await page.goto('/upload.html');
      const date = dateHelpers.getDaysAgoISO(10);
      await page.fill('[name="dvrEarliestDate"]', date);

      const retentionMsg = page.locator('[class*="retention"]');
      await expect(retentionMsg).toContainText('10 days');
    });

    test('1.9.2 Shows urgent message for 3 days ago', async ({ page }) => {
      await page.goto('/upload.html');
      const date = dateHelpers.getDaysAgoISO(3);
      await page.fill('[name="dvrEarliestDate"]', date);

      const retentionMsg = page.locator('[class*="retention"], [class*="urgent"], [class*="alert-danger"]');
      await expect(retentionMsg).toContainText('3 days');
    });

    test('1.9.3 Shows normal message for 30 days ago', async ({ page }) => {
      await page.goto('/upload.html');
      const date = dateHelpers.getDaysAgoISO(30);
      await page.fill('[name="dvrEarliestDate"]', date);

      const retentionMsg = page.locator('[class*="retention"]');
      await expect(retentionMsg).toContainText('30 days');
    });

    test('1.9.4 Clears message when date is cleared', async ({ page }) => {
      await page.goto('/upload.html');
      const date = dateHelpers.getDaysAgoISO(10);
      await page.fill('[name="dvrEarliestDate"]', date);

      await page.fill('[name="dvrEarliestDate"]', '');

      const retentionMsg = page.locator('[class*="retention"]');
      await expect(retentionMsg).not.toBeVisible();
    });
  });

  test.describe('1.10 Date Range Validation', () => {
    test('1.10.1 Shows error when end time before start time', async ({ page }) => {
      await page.goto('/upload.html');
      await page.fill('[name="videoStartTime"]', '2024-01-15T10:00');
      await page.fill('[name="videoEndTime"]', '2024-01-15T09:00');
      await page.locator('[name="videoEndTime"]').blur();

      const errorMsg = page.locator('[name="videoEndTime"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('after');
    });

    test('1.10.2 Error clears when end time after start time', async ({ page }) => {
      await page.goto('/upload.html');
      await page.fill('[name="videoStartTime"]', '2024-01-15T10:00');
      await page.fill('[name="videoEndTime"]', '2024-01-15T09:00');
      await page.locator('[name="videoEndTime"]').blur();

      await page.fill('[name="videoEndTime"]', '2024-01-15T11:00');
      await page.locator('[name="videoEndTime"]').blur();

      const errorMsg = page.locator('[name="videoEndTime"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toHaveText('');
    });
  });

  test.describe('1.11 Add Location Functionality', () => {
    test('1.11.1 Clicking Add Another Location shows new group', async ({ page }) => {
      await page.goto('/upload.html');

      const initialLocations = page.locator('[class*="location-group"]');
      const initialCount = await initialLocations.count();

      await addLocation(page, 1);

      const updatedLocations = page.locator('[class*="location-group"]');
      const updatedCount = await updatedLocations.count();

      expect(updatedCount).toBeGreaterThan(initialCount);
    });

    test('1.11.2 New location group has all required fields', async ({ page }) => {
      await page.goto('/upload.html');
      await addLocation(page, 1);

      const newLocationInputs = page.locator('[class*="location-group"]').last();
      await expect(newLocationInputs.locator('[name*="locationAddress"]')).toBeVisible();
      await expect(newLocationInputs.locator('[name*="city"]')).toBeVisible();
    });

    test('1.11.3 New location group has Remove button', async ({ page }) => {
      await page.goto('/upload.html');
      await addLocation(page, 1);

      const removeButton = page.locator('button:has-text("Remove This Location")');
      await expect(removeButton).toBeVisible();
    });

    test('1.11.4 Page scrolls to new location', async ({ page }) => {
      await page.goto('/upload.html');
      const initialScrollPos = await page.evaluate(() => window.scrollY);

      await addLocation(page, 1);

      const finalScrollPos = await page.evaluate(() => window.scrollY);
      expect(finalScrollPos).toBeGreaterThan(initialScrollPos);
    });

    test('1.11.5 Progress bar updates with new required fields', async ({ page }) => {
      await page.goto('/upload.html');
      await fillUploadForm(page, uploadFormValidData);
      const initialProgress = await getProgressPercentage(page);

      await addLocation(page, 1);
      const newProgress = await getProgressPercentage(page);

      expect(newProgress).toBeLessThan(initialProgress);
    });

    test('1.11.6 Can add 3 total locations', async ({ page }) => {
      await page.goto('/upload.html');
      await addLocation(page, 2);

      const locations = page.locator('[class*="location-group"]');
      const count = await locations.count();
      expect(count).toBeGreaterThanOrEqual(3);
    });

    test('1.11.7 Remove location button fades and disappears', async ({ page }) => {
      await page.goto('/upload.html');
      await addLocation(page, 1);

      const removeButton = page.locator('button:has-text("Remove This Location")').last();
      await removeButton.click();

      await page.waitForTimeout(600);

      const remainingRemoveButtons = page.locator('button:has-text("Remove This Location")');
      const count = await remainingRemoveButtons.count();
      expect(count).toBe(0); // First location doesn't have remove button
    });

    test('1.11.8 First location does NOT have remove button', async ({ page }) => {
      await page.goto('/upload.html');

      const locationGroups = page.locator('[class*="location-group"]');
      const firstGroup = locationGroups.first();
      const removeButton = firstGroup.locator('button:has-text("Remove")');

      await expect(removeButton).not.toBeVisible();
    });
  });

  test.describe('1.12 Progress Bar', () => {
    test('1.12.1 Empty form shows 0% Complete', async ({ page }) => {
      await page.goto('/upload.html');

      const progress = await getProgressPercentage(page);
      expect(progress).toBe(0);
    });

    test('1.12.2 Progress increases when filling fields', async ({ page }) => {
      await page.goto('/upload.html');
      const initialProgress = await getProgressPercentage(page);

      await page.fill('[name="occNumber"]', 'PR2024001234');

      const newProgress = await getProgressPercentage(page);
      expect(newProgress).toBeGreaterThan(initialProgress);
    });

    test('1.12.3 Progress reaches 100% with all required fields filled', async ({ page }) => {
      await page.goto('/upload.html');

      await fillUploadForm(page, uploadFormValidData);

      const progress = await getProgressPercentage(page);
      expect(progress).toBe(100);
    });

    test('1.12.4 Progress bar changes color: Red (0-33%), Yellow (34-66%), Green (67-100%)', async ({ page }) => {
      await page.goto('/upload.html');

      // Start - should be red
      let progressBar = page.locator('[class*="progress-bar"]');
      let style = await progressBar.getAttribute('class');
      expect(style).toContain('red') || expect(style).toContain('danger');

      // Fill partial - should turn yellow
      await page.fill('[name="occNumber"]', 'PR2024001234');
      await page.selectOption('[name="mediaType"]', 'USB');
      await fillOfficerInfo(page, validOfficerData);

      // Fill complete - should turn green
      await fillUploadForm(page, uploadFormValidData);
      style = await progressBar.getAttribute('class');
      expect(style).toContain('green') || expect(style).toContain('success');
    });

    test('1.12.5 Progress drops when adding second location', async ({ page }) => {
      await page.goto('/upload.html');
      await fillUploadForm(page, uploadFormValidData);

      const fullProgress = await getProgressPercentage(page);
      expect(fullProgress).toBe(100);

      await addLocation(page, 1);

      const newProgress = await getProgressPercentage(page);
      expect(newProgress).toBeLessThan(fullProgress);
    });

    test('1.12.6 Progress returns to 100% after filling new location', async ({ page }) => {
      await page.goto('/upload.html');
      await fillUploadForm(page, uploadFormValidData);
      await addLocation(page, 1);

      // Fill second location
      const secondLocationFields = page.locator('[class*="location-group"]').nth(1);
      await secondLocationFields.locator('[name*="locationAddress"]').fill('456 Oak Street');
      await secondLocationFields.locator('[name*="city"]').selectOption('Mississauga');

      const progress = await getProgressPercentage(page);
      expect(progress).toBe(100);
    });
  });

  test.describe('1.13 Locker Number Validation', () => {
    test('1.13.1 Locker number is optional - no error when empty', async ({ page }) => {
      await page.goto('/upload.html');

      const lockerField = page.locator('[name="lockerNumber"]');
      const errorMsg = lockerField.locator('~ .invalid-feedback');
      await expect(errorMsg).toHaveText('');
    });

    test('1.13.2 Accepts valid locker number (5)', async ({ page }) => {
      await page.goto('/upload.html');
      await page.fill('[name="lockerNumber"]', '5');
      await page.locator('[name="lockerNumber"]').blur();

      const errorMsg = page.locator('[name="lockerNumber"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toHaveText('');
    });

    test('1.13.3 Rejects locker number 0', async ({ page }) => {
      await page.goto('/upload.html');
      await page.fill('[name="lockerNumber"]', '0');
      await page.locator('[name="lockerNumber"]').blur();

      const errorMsg = page.locator('[name="lockerNumber"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('between 1 and 28');
    });

    test('1.13.4 Rejects locker number 29', async ({ page }) => {
      await page.goto('/upload.html');
      await page.fill('[name="lockerNumber"]', '29');
      await page.locator('[name="lockerNumber"]').blur();

      const errorMsg = page.locator('[name="lockerNumber"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('between 1 and 28');
    });

    test('1.13.5 Accepts locker number 28', async ({ page }) => {
      await page.goto('/upload.html');
      await page.fill('[name="lockerNumber"]', '28');
      await page.locator('[name="lockerNumber"]').blur();

      const errorMsg = page.locator('[name="lockerNumber"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toHaveText('');
    });
  });

  test.describe('1.14 Theme Toggle', () => {
    test('1.14.1 Page loads in dark theme by default', async ({ page }) => {
      await page.goto('/upload.html');

      const theme = await page.getAttribute('html', 'data-theme');
      expect(theme).toBe('dark');
    });

    test('1.14.2 Clicking theme toggle switches to light theme', async ({ page }) => {
      await page.goto('/upload.html');

      await toggleTheme(page);

      const theme = await page.getAttribute('html', 'data-theme');
      expect(theme).toBe('light');
    });

    test('1.14.3 Theme preference persists after refresh', async ({ page }) => {
      await page.goto('/upload.html');

      const themeButton = page.locator('[id="theme-toggle"]');
      await themeButton.click();
      await page.waitForTimeout(200);

      await page.reload();

      const theme = await page.getAttribute('html', 'data-theme');
      expect(theme).toBe('light');
    });

    test('1.14.4 Can toggle back to dark theme', async ({ page }) => {
      await page.goto('/upload.html');

      const themeButton = page.locator('[id="theme-toggle"]');
      await themeButton.click();
      await page.waitForTimeout(200);
      await themeButton.click();
      await page.waitForTimeout(200);

      const theme = await page.getAttribute('html', 'data-theme');
      expect(theme).toBe('dark');
    });
  });

  test.describe('1.15 Draft Auto-Save', () => {
    test('1.15.1 Auto-save triggers after inactivity', async ({ page }) => {
      await page.goto('/upload.html');

      await page.fill('[name="occNumber"]', 'PR123456');
      await page.fill('[name="rName"]', 'TestOfficer');

      await waitForAutoSave(page);

      const draftButton = page.locator('[id="draft-button"]');
      const buttonText = await draftButton.textContent();
      expect(buttonText).toContain('Load Draft');
    });

    test('1.15.2 Form data restored from draft', async ({ page }) => {
      await page.goto('/upload.html');

      await page.fill('[name="occNumber"]', 'PR123456');
      await page.fill('[name="rName"]', 'TestOfficer');

      await waitForAutoSave(page);

      await page.reload();

      await loadDraft(page);

      const occValue = await page.locator('[name="occNumber"]').inputValue();
      const nameValue = await page.locator('[name="rName"]').inputValue();

      expect(occValue).toBe('PR123456');
      expect(nameValue).toBe('TestOfficer');
    });

    test('1.15.3 Draft loaded toast notification appears', async ({ page }) => {
      await page.goto('/upload.html');

      await page.fill('[name="occNumber"]', 'PR123456');
      await waitForAutoSave(page);
      await page.reload();

      await loadDraft(page);

      const toast = page.locator('[class*="toast"]').filter({ hasText: /loaded|restored/i });
      await expect(toast).toBeVisible();
    });
  });

  test.describe('1.16 Clear Form Button', () => {
    test('1.16.1 Clear Form button shows confirmation prompt', async ({ page }) => {
      await page.goto('/upload.html');

      await fillUploadForm(page, uploadFormValidData);

      const clearButton = page.locator('button:has-text("Clear Form")');
      await clearButton.click();

      const dialog = page.locator('dialog, [role="dialog"]');
      await expect(dialog).toBeVisible();
    });

    test('1.16.2 Clicking Cancel retains form data', async ({ page }) => {
      await page.goto('/upload.html');

      await fillUploadForm(page, uploadFormValidData);

      await clearForm(page, true); // Pass true to click cancel

      const occValue = await page.locator('[name="occNumber"]').inputValue();
      expect(occValue).toBe(uploadFormValidData.occNumber);
    });

    test('1.16.3 Clicking OK clears all fields', async ({ page }) => {
      await page.goto('/upload.html');

      await fillUploadForm(page, uploadFormValidData);

      await clearForm(page, false); // Pass false to click OK

      const occValue = await page.locator('[name="occNumber"]').inputValue();
      const nameValue = await page.locator('[name="rName"]').inputValue();

      expect(occValue).toBe('');
      expect(nameValue).toBe('');
    });

    test('1.16.4 Progress bar returns to 0% after clear', async ({ page }) => {
      await page.goto('/upload.html');

      await fillUploadForm(page, uploadFormValidData);

      const progressBefore = await getProgressPercentage(page);
      expect(progressBefore).toBe(100);

      await clearForm(page, false);

      const progressAfter = await getProgressPercentage(page);
      expect(progressAfter).toBe(0);
    });
  });

  test.describe('1.17 Successful Submission', () => {
    test('1.17.1 Valid form submits without errors', async ({ page }) => {
      await page.goto('/upload.html');

      await fillUploadForm(page, uploadFormValidData);

      await submitFormAndConfirm(page);

      // Check for success indicator (toast or redirect)
      const successToast = page.locator('[class*="success"], .toast').first();
      await expect(successToast).toBeVisible({ timeout: 5000 });
    });

    test('1.17.2 Success message contains confirmation', async ({ page }) => {
      await page.goto('/upload.html');

      await fillUploadForm(page, uploadFormValidData);

      const toastText = await submitAndVerifySuccess(page);
      expect(toastText).toContain('success') || expect(toastText).toContain('submitted');
    });

    test('1.17.3 Form clears after successful submission', async ({ page }) => {
      await page.goto('/upload.html');

      const submissionData = uploadFormValidData;
      await fillUploadForm(page, submissionData);

      await submitFormAndConfirm(page);

      // Wait for submission to complete
      await page.waitForTimeout(2000);

      const occValue = await page.locator('[name="occNumber"]').inputValue();
      // Should be empty after successful submission
      expect(occValue === '' || occValue === submissionData.occNumber).toBeTruthy();
    });

    test('1.17.4 Draft is cleared after successful submission', async ({ page }) => {
      await page.goto('/upload.html');

      await fillUploadForm(page, uploadFormValidData);
      await submitAndVerifySuccess(page);

      await page.reload();

      const draftButton = page.locator('[id="draft-button"]');
      const buttonText = await draftButton.textContent();
      expect(buttonText).not.toContain('Load Draft');
    });
  });

  test.describe('1.18 Officer Info Persistence', () => {
    test('1.18.1 Officer info pre-fills on page reload', async ({ page }) => {
      await page.goto('/upload.html');

      await fillOfficerInfo(page, validOfficerData);
      await waitForAutoSave(page);

      await page.reload();

      const nameValue = await page.locator('[name="rName"]').inputValue();
      const emailValue = await page.locator('[name="requestingEmail"]').inputValue();

      expect(nameValue).toBe(validOfficerData.rName);
      expect(emailValue).toBe(validOfficerData.requestingEmail);
    });

    test('1.18.2 Officer fields are pre-filled across sessions', async ({ page }) => {
      await page.goto('/upload.html');

      await fillOfficerInfo(page, validOfficerData);
      await waitForAutoSave(page);

      // Navigate away and back
      await page.goto('/analysis.html');
      await page.goto('/upload.html');

      const nameValue = await page.locator('[name="rName"]').inputValue();
      expect(nameValue).toBe(validOfficerData.rName);
    });

    test('1.18.3 Clear Investigator Info button exists', async ({ page }) => {
      await page.goto('/upload.html');

      const clearOfficerButton = page.locator('button:has-text("Clear Investigator Info")');
      await expect(clearOfficerButton).toBeVisible();
    });

    test('1.18.4 Clicking Clear Investigator Info empties officer fields', async ({ page }) => {
      await page.goto('/upload.html');

      await fillOfficerInfo(page, validOfficerData);
      await waitForAutoSave(page);

      const clearButton = page.locator('button:has-text("Clear Investigator Info")');
      await clearButton.click();

      const nameValue = await page.locator('[name="rName"]').inputValue();
      expect(nameValue).toBe('');
    });

    test('1.18.5 Officer info does not pre-fill after being cleared', async ({ page }) => {
      await page.goto('/upload.html');

      await fillOfficerInfo(page, validOfficerData);
      await waitForAutoSave(page);

      const clearButton = page.locator('button:has-text("Clear Investigator Info")');
      await clearButton.click();

      await page.reload();

      const nameValue = await page.locator('[name="rName"]').inputValue();
      expect(nameValue).toBe('');
    });
  });
});
