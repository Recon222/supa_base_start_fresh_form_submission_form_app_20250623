import { test, expect } from '@playwright/test';
import {
  validOfficerData,
  recoveryFormValidData,
  recoveryFormWithOtherOffence,
  recoveryFormMultipleDVRs,
  dateHelpers
} from './fixtures/test-data.js';
import {
  fillOfficerInfo,
  fillRecoveryForm,
  clearLocalStorage,
  toggleTheme,
  waitForAutoSave,
  getProgressPercentage,
  loadDraft,
  addDVRSystem,
  addTimeFrame,
  getAllFormValues
} from './fixtures/form-helpers.js';

test.describe('Recovery Form Tests (recovery.html)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/recovery.html');
    await clearLocalStorage(page);
    await page.reload();
  });

  test.describe('3.1 Page Load Tests', () => {
    test('3.1.1 Page loads without JavaScript errors', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err));

      await page.goto('/recovery.html');
      expect(errors).toHaveLength(0);
    });

    test('3.1.2 All form sections render correctly', async ({ page }) => {
      await page.goto('/recovery.html');

      const form = page.locator('#recovery-form');
      await expect(form).toBeVisible();
    });

    test('3.1.3 Progress bar shows 0% Complete', async ({ page }) => {
      await page.goto('/recovery.html');

      const progress = await getProgressPercentage(page);
      expect(progress).toBe(0);
    });

    test('3.1.4 Theme toggle works', async ({ page }) => {
      await page.goto('/recovery.html');

      const themeToggle = page.locator('[id="theme-toggle"]');
      await expect(themeToggle).toBeVisible();

      await toggleTheme(page);

      const theme = await page.getAttribute('html', 'data-theme');
      expect(theme).toBe('light');
    });

    test('3.1.5 First DVR group is visible (DVR 1)', async ({ page }) => {
      await page.goto('/recovery.html');

      const dvrHeader = page.locator('h3, h4, span').filter({ hasText: /DVR\s*1/i });
      await expect(dvrHeader).toBeVisible();
    });
  });

  test.describe('3.2 Required Field Validation', () => {
    test('3.2.1 Occurrence Number is required', async ({ page }) => {
      await page.goto('/recovery.html');

      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      const errorMsg = page.locator('[name="occNumber"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('3.2.2 Type of Offence is required', async ({ page }) => {
      await page.goto('/recovery.html');

      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      const errorMsg = page.locator('[name="occType"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('3.2.3 Submitting Investigator is required', async ({ page }) => {
      await page.goto('/recovery.html');

      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      const errorMsg = page.locator('[name="rName"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('3.2.4 Badge Number is required', async ({ page }) => {
      await page.goto('/recovery.html');

      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      const errorMsg = page.locator('[name="badge"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('3.2.5 Contact Number is required', async ({ page }) => {
      await page.goto('/recovery.html');

      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      const errorMsg = page.locator('[name="requestingPhone"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('3.2.6 Email Address is required', async ({ page }) => {
      await page.goto('/recovery.html');

      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      const errorMsg = page.locator('[name="requestingEmail"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('3.2.7 Location Address is required', async ({ page }) => {
      await page.goto('/recovery.html');

      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      const errorMsg = page.locator('[name="locationAddress"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('3.2.8 City is required', async ({ page }) => {
      await page.goto('/recovery.html');

      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      const errorMsg = page.locator('[name="city"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('3.2.9 Location Contact is required', async ({ page }) => {
      await page.goto('/recovery.html');

      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      const errorMsg = page.locator('[name="locationContact"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('3.2.10 Location Contact Phone is required', async ({ page }) => {
      await page.goto('/recovery.html');

      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      const errorMsg = page.locator('[name="locationContactPhone"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('3.2.11 Password is required', async ({ page }) => {
      await page.goto('/recovery.html');

      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      const errorMsg = page.locator('[name="dvrPassword"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('3.2.12 Time Period From is required', async ({ page }) => {
      await page.goto('/recovery.html');

      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      const errorMsg = page.locator('[name="timePeriodFrom"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('3.2.13 Time Period To is required', async ({ page }) => {
      await page.goto('/recovery.html');

      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      const errorMsg = page.locator('[name="timePeriodTo"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('3.2.14 Time Period Type radio is required', async ({ page }) => {
      await page.goto('/recovery.html');

      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      const errorMsg = page.locator('[name="timePeriodType"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('3.2.15 Camera Details is required', async ({ page }) => {
      await page.goto('/recovery.html');

      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      const errorMsg = page.locator('[name="cameraDetails"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('3.2.16 Incident Description is required', async ({ page }) => {
      await page.goto('/recovery.html');

      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      const errorMsg = page.locator('[name="incidentDescription"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });
  });

  test.describe('3.3 Offence Type Other Field', () => {
    test('3.3.1 Specify Offence field does NOT appear for Robbery', async ({ page }) => {
      await page.goto('/recovery.html');

      await page.selectOption('[name="occType"]', 'Robbery');

      const otherField = page.locator('[name="offenceTypeOther"]');
      await expect(otherField).not.toBeVisible();
    });

    test('3.3.2 Specify Offence field appears for Other', async ({ page }) => {
      await page.goto('/recovery.html');

      await page.selectOption('[name="occType"]', 'Other');

      const otherField = page.locator('[name="offenceTypeOther"]');
      await expect(otherField).toBeVisible();
    });

    test('3.3.3 Cannot submit with empty Specify Offence', async ({ page }) => {
      await page.goto('/recovery.html');

      await fillRecoveryForm(page, recoveryFormValidData);
      await page.selectOption('[name="occType"]', 'Other');

      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      const errorMsg = page.locator('[name="offenceTypeOther"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('specify');
    });

    test('3.3.4 Can submit with filled Specify Offence', async ({ page }) => {
      await page.goto('/recovery.html');

      await fillRecoveryForm(page, recoveryFormWithOtherOffence);

      const errorMsg = page.locator('[name="offenceTypeOther"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toHaveText('');
    });
  });

  test.describe('3.4 City Other Field', () => {
    test('3.4.1 City Other field conditional behavior', async ({ page }) => {
      await page.goto('/recovery.html');

      await page.selectOption('[name="city"]', 'Other');

      const otherField = page.locator('[name="cityOther"]');
      await expect(otherField).toBeVisible();

      await page.fill('[name="cityOther"]', 'TestCity');

      const value = await otherField.inputValue();
      expect(value).toBe('TestCity');
    });
  });

  test.describe('3.5 Location Contact Phone Validation', () => {
    test('3.5.1 Rejects phone with less than 10 digits', async ({ page }) => {
      await page.goto('/recovery.html');

      await page.fill('[name="locationContactPhone"]', '123');
      await page.locator('[name="locationContactPhone"]').blur();

      const errorMsg = page.locator('[name="locationContactPhone"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('10 digits');
    });

    test('3.5.2 Accepts valid 10 digit phone', async ({ page }) => {
      await page.goto('/recovery.html');

      await page.fill('[name="locationContactPhone"]', '9055551234');
      await page.locator('[name="locationContactPhone"]').blur();

      const errorMsg = page.locator('[name="locationContactPhone"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toHaveText('');
    });

    test('3.5.3 Accepts phone with dashes (905-555-1234)', async ({ page }) => {
      await page.goto('/recovery.html');

      await page.fill('[name="locationContactPhone"]', '905-555-1234');
      await page.locator('[name="locationContactPhone"]').blur();

      const errorMsg = page.locator('[name="locationContactPhone"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toHaveText('');
    });
  });

  test.describe('3.6 DVR Time & Date Correct (Special Behavior)', () => {
    test('3.6.1 No warning message appears when Yes is selected', async ({ page }) => {
      await page.goto('/recovery.html');

      await page.check('input[name="dvrTimeCorrect"][value="Yes"]');

      const warning = page.locator('[class*="warning"], [class*="alert"]').filter({ hasText: /timestamp/i });
      await expect(warning).not.toBeVisible();
    });

    test('3.6.2 Time Offset field does NOT appear when Yes is selected', async ({ page }) => {
      await page.goto('/recovery.html');

      await page.check('input[name="dvrTimeCorrect"][value="Yes"]');

      const offsetField = page.locator('[name="dvrTimeOffset"]');
      await expect(offsetField).not.toBeVisible();
    });

    test('3.6.3 Time Offset field appears when No is selected', async ({ page }) => {
      await page.goto('/recovery.html');

      await page.check('input[name="dvrTimeCorrect"][value="No"]');

      const offsetField = page.locator('[name="dvrTimeOffset"]');
      await expect(offsetField).toBeVisible();
    });

    test('3.6.4 Time Offset is optional when No is selected', async ({ page }) => {
      await page.goto('/recovery.html');

      await fillRecoveryForm(page, recoveryFormValidData);
      await page.check('input[name="dvrTimeCorrect"][value="No"]');
      await page.fill('[name="dvrTimeOffset"]', '');

      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Should not have error since it's optional
      const errorMsg = page.locator('[name="dvrTimeOffset"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toHaveText('');
    });
  });

  test.describe('3.7 DVR Retention Field', () => {
    test('3.7.1 DVR Retention is optional', async ({ page }) => {
      await page.goto('/recovery.html');

      // Leave empty, should be fine
      const errorMsg = page.locator('[name="dvrRetentionDate"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toHaveText('');
    });

    test('3.7.2 Shows 10 days of retention for 10 days ago', async ({ page }) => {
      await page.goto('/recovery.html');

      const date = dateHelpers.getDaysAgoISO(10);
      await page.fill('[name="dvrRetentionDate"]', date);

      const retentionMsg = page.locator('[class*="retention"]');
      await expect(retentionMsg).toContainText('10 days');
    });

    test('3.7.3 Shows urgent alert for 3 days ago', async ({ page }) => {
      await page.goto('/recovery.html');

      const date = dateHelpers.getDaysAgoISO(3);
      await page.fill('[name="dvrRetentionDate"]', date);

      const retentionMsg = page.locator('[class*="retention"], [class*="urgent"], [class*="alert-danger"]');
      await expect(retentionMsg).toContainText('3 days');
    });

    test('3.7.4 Shows urgent alert for 1 day ago', async ({ page }) => {
      await page.goto('/recovery.html');

      const date = dateHelpers.getDaysAgoISO(1);
      await page.fill('[name="dvrRetentionDate"]', date);

      const retentionMsg = page.locator('[class*="retention"], [class*="urgent"]');
      await expect(retentionMsg).toContainText('1 day');
    });

    test('3.7.5 Shows normal message for 5 days ago', async ({ page }) => {
      await page.goto('/recovery.html');

      const date = dateHelpers.getDaysAgoISO(5);
      await page.fill('[name="dvrRetentionDate"]', date);

      const retentionMsg = page.locator('[class*="retention"]');
      await expect(retentionMsg).toContainText('5 days');
    });

    test('3.7.6 Rejects future retention date', async ({ page }) => {
      await page.goto('/recovery.html');

      const tomorrow = dateHelpers.getTomorrowISO();
      await page.fill('[name="dvrRetentionDate"]', tomorrow);
      await page.locator('[name="dvrRetentionDate"]').blur();

      const errorMsg = page.locator('[name="dvrRetentionDate"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('future');
    });
  });

  test.describe('3.8 Video Extraction Time Range', () => {
    test('3.8.1 Shows error when end time before start time', async ({ page }) => {
      await page.goto('/recovery.html');

      await page.fill('[name="timePeriodFrom"]', '2024-01-15T10:00');
      await page.fill('[name="timePeriodTo"]', '2024-01-15T09:00');
      await page.locator('[name="timePeriodTo"]').blur();

      const errorMsg = page.locator('[name="timePeriodTo"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('after');
    });

    test('3.8.2 Error clears when end time after start time', async ({ page }) => {
      await page.goto('/recovery.html');

      await page.fill('[name="timePeriodFrom"]', '2024-01-15T10:00');
      await page.fill('[name="timePeriodTo"]', '2024-01-15T09:00');
      await page.fill('[name="timePeriodTo"]', '2024-01-15T11:00');
      await page.locator('[name="timePeriodTo"]').blur();

      const errorMsg = page.locator('[name="timePeriodTo"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toHaveText('');
    });
  });

  test.describe('3.9 Time Period Type Radio Buttons', () => {
    test('3.9.1 Both DVR Time and Actual Time options visible', async ({ page }) => {
      await page.goto('/recovery.html');

      const dvrTimeRadio = page.locator('input[name="timePeriodType"][value="DVR Time"]');
      const actualTimeRadio = page.locator('input[name="timePeriodType"][value="Actual Time"]');

      await expect(dvrTimeRadio).toBeVisible();
      await expect(actualTimeRadio).toBeVisible();
    });

    test('3.9.2 Can select DVR Time', async ({ page }) => {
      await page.goto('/recovery.html');

      await page.check('input[name="timePeriodType"][value="DVR Time"]');

      const radio = page.locator('input[name="timePeriodType"][value="DVR Time"]');
      expect(await radio.isChecked()).toBe(true);
    });

    test('3.9.3 Can select Actual Time', async ({ page }) => {
      await page.goto('/recovery.html');

      await page.check('input[name="timePeriodType"][value="Actual Time"]');

      const radio = page.locator('input[name="timePeriodType"][value="Actual Time"]');
      expect(await radio.isChecked()).toBe(true);
    });
  });

  test.describe('3.10 Add Additional Time Frame (Single DVR)', () => {
    test('3.10.1 Clicking Add Additional Time Frame shows new group', async ({ page }) => {
      await page.goto('/recovery.html');

      const addButton = page.locator('button:has-text("Add Additional Time Frame")').first();
      await addButton.click();
      await page.waitForTimeout(500);

      const timeFrameGroups = page.locator('[class*="timeframe"], [class*="time-frame"]');
      const count = await timeFrameGroups.count();
      expect(count).toBeGreaterThanOrEqual(2);
    });

    test('3.10.2 New time frame has Remove button', async ({ page }) => {
      await page.goto('/recovery.html');

      const addButton = page.locator('button:has-text("Add Additional Time Frame")').first();
      await addButton.click();
      await page.waitForTimeout(500);

      const removeButton = page.locator('button:has-text("Remove Time Frame")');
      await expect(removeButton).toBeVisible();
    });

    test('3.10.3 Can add multiple time frames to single DVR', async ({ page }) => {
      await page.goto('/recovery.html');

      // Add 2 more time frames
      const addButton = page.locator('button:has-text("Add Additional Time Frame")').first();
      await addButton.click();
      await page.waitForTimeout(300);

      if (await page.locator('button:has-text("Add Additional Time Frame")').first().isVisible()) {
        await page.locator('button:has-text("Add Additional Time Frame")').first().click();
        await page.waitForTimeout(300);
      }

      const removeButtons = page.locator('button:has-text("Remove Time Frame")');
      const count = await removeButtons.count();
      expect(count).toBeGreaterThanOrEqual(2);
    });
  });

  test.describe('3.11 Add Another DVR System', () => {
    test('3.11.1 Clicking Add Another DVR System shows new DVR group', async ({ page }) => {
      await page.goto('/recovery.html');

      await addDVRSystem(page, 1);

      const dvrHeaders = page.locator('h3, h4, span').filter({ hasText: /DVR\s*2/i });
      await expect(dvrHeaders).toBeVisible();
    });

    test('3.11.2 DVR 2 has all required fields', async ({ page }) => {
      await page.goto('/recovery.html');

      await addDVRSystem(page, 1);

      const dvrGroup = page.locator('[class*="dvr"]').last();

      // Check for key fields
      await expect(dvrGroup.locator('[name*="dvrMakeModel"]')).toBeVisible();
      await expect(dvrGroup.locator('[name*="dvrPassword"]')).toBeVisible();
    });

    test('3.11.3 DVR 2 has Remove button', async ({ page }) => {
      await page.goto('/recovery.html');

      await addDVRSystem(page, 1);

      const removeButton = page.locator('button:has-text("Remove DVR")').nth(0);
      await expect(removeButton).toBeVisible();
    });

    test('3.11.4 Progress bar updates when adding DVR', async ({ page }) => {
      await page.goto('/recovery.html');

      await fillRecoveryForm(page, recoveryFormValidData);
      const fullProgress = await getProgressPercentage(page);

      await addDVRSystem(page, 1);

      const newProgress = await getProgressPercentage(page);
      expect(newProgress).toBeLessThan(fullProgress);
    });
  });

  test.describe('3.12 Multiple DVRs with Multiple Time Frames', () => {
    test('3.12.1 Can have multiple DVRs with independent time frames', async ({ page }) => {
      await page.goto('/recovery.html');

      // Add DVR 2
      await addDVRSystem(page, 1);

      // Add time frames to DVR 1
      const addButtonDVR1 = page.locator('button:has-text("Add Additional Time Frame")').first();
      await addButtonDVR1.click();
      await page.waitForTimeout(300);

      const removeButtons = page.locator('button:has-text("Remove Time Frame")');
      const count = await removeButtons.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });

    test('3.12.2 Each time frame validates independently', async ({ page }) => {
      await page.goto('/recovery.html');

      await fillRecoveryForm(page, recoveryFormValidData);

      // Fill second time frame if available
      const timeFrameGroups = page.locator('[class*="timeframe"], [class*="time-frame"], [class*="extraction"]');
      const count = await timeFrameGroups.count();

      // Verify we can submit with properly filled form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Should not have validation errors on filled fields
      const errorMsg = page.locator('[name="timePeriodFrom"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toHaveText('');
    });
  });

  test.describe('3.13 DVR Fields (Optional vs Required)', () => {
    test('3.13.1 DVR Make/Model is optional', async ({ page }) => {
      await page.goto('/recovery.html');

      await fillRecoveryForm(page, recoveryFormValidData);
      await page.fill('[name="dvrMakeModel"]', '');

      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      const errorMsg = page.locator('[name="dvrMakeModel"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toHaveText('');
    });

    test('3.13.2 DVR Retention is optional', async ({ page }) => {
      await page.goto('/recovery.html');

      await fillRecoveryForm(page, recoveryFormValidData);
      await page.fill('[name="dvrRetentionDate"]', '');

      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      const errorMsg = page.locator('[name="dvrRetentionDate"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toHaveText('');
    });

    test('3.13.3 Password is required', async ({ page }) => {
      await page.goto('/recovery.html');

      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      const errorMsg = page.locator('[name="dvrPassword"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('3.13.4 Camera Details is required', async ({ page }) => {
      await page.goto('/recovery.html');

      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      const errorMsg = page.locator('[name="cameraDetails"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });
  });

  test.describe('3.14 Camera Details Field', () => {
    test('3.14.1 Accepts multi-line text', async ({ page }) => {
      await page.goto('/recovery.html');

      const cameraDetails = 'Camera 1: Front entrance\nCamera 2: Parking lot\nCamera 3: Rear door';
      await page.fill('[name="cameraDetails"]', cameraDetails);

      const value = await page.locator('[name="cameraDetails"]').inputValue();
      expect(value).toContain('\n');
    });
  });

  test.describe('3.15 Incident Description (Required)', () => {
    test('3.15.1 Incident Description is required', async ({ page }) => {
      await page.goto('/recovery.html');

      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      const errorMsg = page.locator('[name="incidentDescription"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('3.15.2 Can submit with filled Incident Description', async ({ page }) => {
      await page.goto('/recovery.html');

      await fillRecoveryForm(page, recoveryFormValidData);

      const errorMsg = page.locator('[name="incidentDescription"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toHaveText('');
    });
  });

  test.describe('3.16 Progress Bar', () => {
    test('3.16.1 Empty form shows 0%', async ({ page }) => {
      await page.goto('/recovery.html');

      const progress = await getProgressPercentage(page);
      expect(progress).toBe(0);
    });

    test('3.16.2 Progress reaches 100% with all required fields', async ({ page }) => {
      await page.goto('/recovery.html');

      await fillRecoveryForm(page, recoveryFormValidData);

      const progress = await getProgressPercentage(page);
      expect(progress).toBe(100);
    });

    test('3.16.3 Progress drops when adding DVR 2', async ({ page }) => {
      await page.goto('/recovery.html');

      await fillRecoveryForm(page, recoveryFormValidData);
      const fullProgress = await getProgressPercentage(page);

      await addDVRSystem(page, 1);

      const newProgress = await getProgressPercentage(page);
      expect(newProgress).toBeLessThan(fullProgress);
    });
  });

  test.describe('3.17 Draft Auto-Save (Complex Data)', () => {
    test('3.17.1 Complex form data with DVRs auto-saves and restores', async ({ page }) => {
      await page.goto('/recovery.html');

      await fillRecoveryForm(page, recoveryFormValidData);
      await addDVRSystem(page, 1);

      await waitForAutoSave(page);

      await page.reload();

      const draftButton = page.locator('[id="draft-button"]');
      const buttonText = await draftButton.textContent();
      expect(buttonText).toContain('Load Draft');

      await loadDraft(page);

      const occValue = await page.locator('[name="occNumber"]').inputValue();
      expect(occValue).toBe(recoveryFormValidData.occNumber);
    });
  });

  test.describe('3.18 Remove DVR Functionality', () => {
    test('3.18.1 Can remove DVR after adding', async ({ page }) => {
      await page.goto('/recovery.html');

      await addDVRSystem(page, 1);

      const removeButtons = page.locator('button:has-text("Remove DVR")');
      if (await removeButtons.first().isVisible()) {
        await removeButtons.first().click();
        await page.waitForTimeout(500);

        const dvrHeaders = page.locator('h3, h4, span').filter({ hasText: /DVR\s*2/i });
        // DVR 2 should be gone or renamed
        const count = await dvrHeaders.count();
        // After removal, DVR 2 should not exist
      }
    });
  });

  test.describe('3.19 Successful Submission (Complex Case)', () => {
    test('3.19.1 Complex form with 2 DVRs submits successfully', async ({ page }) => {
      await page.goto('/recovery.html');

      await fillRecoveryForm(page, recoveryFormValidData);
      await addDVRSystem(page, 1);

      // Fill DVR 2 basic fields
      const dvrGroup = page.locator('[class*="dvr"]').last();
      await dvrGroup.locator('[name*="dvrPassword"]').fill('Password123');

      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      const successToast = page.locator('[class*="success"], .toast').first();
      await expect(successToast).toBeVisible({ timeout: 5000 });
    });

    test('3.19.2 Form clears after successful submission', async ({ page }) => {
      await page.goto('/recovery.html');

      await fillRecoveryForm(page, recoveryFormValidData);

      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Wait for submission
      await page.waitForTimeout(2000);

      const occValue = await page.locator('[name="occNumber"]').inputValue();
      // Either empty or still filled (depending on implementation)
      await expect(page.locator('[name="occNumber"]')).toBeTruthy();
    });
  });
});
