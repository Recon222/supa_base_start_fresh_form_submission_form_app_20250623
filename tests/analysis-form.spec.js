import { test, expect } from '@playwright/test';
import {
  validOfficerData,
  analysisFormValidData,
  analysisFormWithOtherOffence,
  analysisFormWithOtherCity,
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
  submitFormAndConfirm
} from './fixtures/form-helpers.js';

test.describe('Analysis Form Tests (analysis.html)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/analysis.html');
    await clearLocalStorage(page);
    await page.reload();
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
  });

  test.describe('2.2 Required Field Validation', () => {
    test('2.2.1 Occurrence Number is required', async ({ page }) => {
      await page.goto('/analysis.html');

      await submitFormAndConfirm(page);

      const errorMsg = page.locator('[id="occNumber"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('2.2.2 Type of Offence is required', async ({ page }) => {
      await page.goto('/analysis.html');

      await submitFormAndConfirm(page);

      const errorMsg = page.locator('[id="offenceType"], [name="offenceType"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('2.2.3 Location of Video is required', async ({ page }) => {
      await page.goto('/analysis.html');

      await submitFormAndConfirm(page);

      const errorMsg = page.locator('[name="videoLocation"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('2.2.4 Video Seized From is required', async ({ page }) => {
      await page.goto('/analysis.html');

      await submitFormAndConfirm(page);

      const errorMsg = page.locator('[name="videoSeizedFrom"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('2.2.5 City is required', async ({ page }) => {
      await page.goto('/analysis.html');

      await submitFormAndConfirm(page);

      const errorMsg = page.locator('[name="city"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('2.2.6 Recording Date is required', async ({ page }) => {
      await page.goto('/analysis.html');

      await submitFormAndConfirm(page);

      const errorMsg = page.locator('[name="recordingDate"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('2.2.7 Service Required is required', async ({ page }) => {
      await page.goto('/analysis.html');

      await submitFormAndConfirm(page);

      const errorMsg = page.locator('[name="serviceRequired"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('2.2.8 Submitting Investigator is required', async ({ page }) => {
      await page.goto('/analysis.html');

      await submitFormAndConfirm(page);

      const errorMsg = page.locator('[name="rName"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('2.2.9 Badge Number is required', async ({ page }) => {
      await page.goto('/analysis.html');

      await submitFormAndConfirm(page);

      const errorMsg = page.locator('[name="badge"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('2.2.10 Contact Number is required', async ({ page }) => {
      await page.goto('/analysis.html');

      await submitFormAndConfirm(page);

      const errorMsg = page.locator('[name="requestingPhone"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('2.2.11 Email Address is required', async ({ page }) => {
      await page.goto('/analysis.html');

      await submitFormAndConfirm(page);

      const errorMsg = page.locator('[name="requestingEmail"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });

    test('2.2.12 Request Details is required', async ({ page }) => {
      await page.goto('/analysis.html');

      await submitFormAndConfirm(page);

      const errorMsg = page.locator('[name="requestDetails"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('required');
    });
  });

  test.describe('2.3 Offence Type Other Field', () => {
    test('2.3.1 Specify Offence field does NOT appear for Homicide', async ({ page }) => {
      await page.goto('/analysis.html');

      await page.selectOption('[name="offenceType"]', 'Homicide');

      const otherField = page.locator('[name="offenceTypeOther"]');
      await expect(otherField).not.toBeVisible();
    });

    test('2.3.2 Specify Offence field appears for Other', async ({ page }) => {
      await page.goto('/analysis.html');

      await page.selectOption('[name="offenceType"]', 'Other');

      const otherField = page.locator('[name="offenceTypeOther"]');
      await expect(otherField).toBeVisible();
    });

    test('2.3.3 Cannot submit with empty Specify Offence', async ({ page }) => {
      await page.goto('/analysis.html');

      await fillAnalysisForm(page, analysisFormValidData);
      await page.selectOption('[name="offenceType"]', 'Other');

      await submitFormAndConfirm(page);

      const errorMsg = page.locator('[name="offenceTypeOther"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('specify');
    });

    test('2.3.4 Can submit with filled Specify Offence', async ({ page }) => {
      await page.goto('/analysis.html');

      await fillAnalysisForm(page, analysisFormWithOtherOffence);

      await submitFormAndConfirm(page);

      // Should not have error on this field
      const errorMsg = page.locator('[name="offenceTypeOther"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toHaveText('');
    });

    test('2.3.5 Field clears when changing back to standard offence', async ({ page }) => {
      await page.goto('/analysis.html');

      await page.selectOption('[name="offenceType"]', 'Other');
      await page.fill('[name="offenceTypeOther"]', 'Assault');

      await page.selectOption('[name="offenceType"]', 'Missing Person');

      const otherField = page.locator('[name="offenceTypeOther"]');
      const value = await otherField.inputValue();
      expect(value).toBe('');
    });
  });

  test.describe('2.4 Video Location Other Field', () => {
    test('2.4.1 Specify Storage Location does NOT appear for NAS Storage', async ({ page }) => {
      await page.goto('/analysis.html');

      await page.selectOption('[name="videoLocation"]', 'NAS Storage');

      const otherField = page.locator('[name="videoLocationOther"]');
      await expect(otherField).not.toBeVisible();
    });

    test('2.4.2 Specify Storage Location appears for Other', async ({ page }) => {
      await page.goto('/analysis.html');

      await page.selectOption('[name="videoLocation"]', 'Other');

      const otherField = page.locator('[name="videoLocationOther"]');
      await expect(otherField).toBeVisible();
    });

    test('2.4.3 Cannot submit with empty Specify Storage Location', async ({ page }) => {
      await page.goto('/analysis.html');

      await fillAnalysisForm(page, analysisFormValidData);
      await page.selectOption('[name="videoLocation"]', 'Other');

      await submitFormAndConfirm(page);

      const errorMsg = page.locator('[name="videoLocationOther"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('specify');
    });

    test('2.4.4 Can submit with filled Specify Storage Location', async ({ page }) => {
      await page.goto('/analysis.html');

      await fillAnalysisForm(page, analysisFormWithOtherCity);

      // Check that this field doesn't have an error
      const errorMsg = page.locator('[name="videoLocationOther"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toHaveText('');
    });

    test('2.4.5 Field clears when changing to standard location', async ({ page }) => {
      await page.goto('/analysis.html');

      await page.selectOption('[name="videoLocation"]', 'Other');
      await page.fill('[name="videoLocationOther"]', 'Cloud Storage');

      await page.selectOption('[name="videoLocation"]', 'Evidence.com Locker');

      const otherField = page.locator('[name="videoLocationOther"]');
      const value = await otherField.inputValue();
      expect(value).toBe('');
    });
  });

  test.describe('2.5 City Other Field', () => {
    test('2.5.1 Specify City does NOT appear for Toronto', async ({ page }) => {
      await page.goto('/analysis.html');

      await page.selectOption('[name="city"]', 'Toronto');

      const otherField = page.locator('[name="cityOther"]');
      await expect(otherField).not.toBeVisible();
    });

    test('2.5.2 Specify City appears for Other', async ({ page }) => {
      await page.goto('/analysis.html');

      await page.selectOption('[name="city"]', 'Other');

      const otherField = page.locator('[name="cityOther"]');
      await expect(otherField).toBeVisible();
    });

    test('2.5.3 Cannot submit with empty Specify City', async ({ page }) => {
      await page.goto('/analysis.html');

      await fillAnalysisForm(page, analysisFormValidData);
      await page.selectOption('[name="city"]', 'Other');

      await submitFormAndConfirm(page);

      const errorMsg = page.locator('[name="cityOther"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('specify');
    });

    test('2.5.4 Can submit with filled Specify City', async ({ page }) => {
      await page.goto('/analysis.html');

      await fillAnalysisForm(page, analysisFormWithOtherCity);

      const errorMsg = page.locator('[name="cityOther"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toHaveText('');
    });
  });

  test.describe('2.6 Service Required Other Field', () => {
    test('2.6.1 Specify Service Required does NOT appear for Video/Image Clarification', async ({ page }) => {
      await page.goto('/analysis.html');

      await page.selectOption('[name="serviceRequired"]', 'Video/Image Clarification');

      const otherField = page.locator('[name="serviceRequiredOther"]');
      await expect(otherField).not.toBeVisible();
    });

    test('2.6.2 Specify Service Required appears for Other', async ({ page }) => {
      await page.goto('/analysis.html');

      await page.selectOption('[name="serviceRequired"]', 'Other');

      const otherField = page.locator('[name="serviceRequiredOther"]');
      await expect(otherField).toBeVisible();
    });

    test('2.6.3 Cannot submit with empty Specify Service Required', async ({ page }) => {
      await page.goto('/analysis.html');

      await fillAnalysisForm(page, analysisFormValidData);
      await page.selectOption('[name="serviceRequired"]', 'Other');

      await submitFormAndConfirm(page);

      const errorMsg = page.locator('[name="serviceRequiredOther"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('specify');
    });

    test('2.6.4 Can submit with filled Specify Service Required', async ({ page }) => {
      await page.goto('/analysis.html');

      await fillAnalysisForm(page, analysisFormWithOtherCity);

      const errorMsg = page.locator('[name="serviceRequiredOther"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toHaveText('');
    });

    test('2.6.5 Field clears when changing to standard service', async ({ page }) => {
      await page.goto('/analysis.html');

      await page.selectOption('[name="serviceRequired"]', 'Other');
      await page.fill('[name="serviceRequiredOther"]', 'Custom Service');

      await page.selectOption('[name="serviceRequired"]', 'Timeline');

      const otherField = page.locator('[name="serviceRequiredOther"]');
      const value = await otherField.inputValue();
      expect(value).toBe('');
    });
  });

  test.describe('2.7 Recording Date Validation', () => {
    test('2.7.1 Accepts todays date', async ({ page }) => {
      await page.goto('/analysis.html');

      const today = dateHelpers.getTodayISO();
      await page.fill('[name="recordingDate"]', today);
      await page.locator('[name="recordingDate"]').blur();

      const errorMsg = page.locator('[name="recordingDate"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toHaveText('');
    });

    test('2.7.2 Accepts yesterdays date', async ({ page }) => {
      await page.goto('/analysis.html');

      const yesterday = dateHelpers.getYesterdayISO();
      await page.fill('[name="recordingDate"]', yesterday);
      await page.locator('[name="recordingDate"]').blur();

      const errorMsg = page.locator('[name="recordingDate"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toHaveText('');
    });

    test('2.7.3 Rejects future date', async ({ page }) => {
      await page.goto('/analysis.html');

      const tomorrow = dateHelpers.getTomorrowISO();
      await page.fill('[name="recordingDate"]', tomorrow);
      await page.locator('[name="recordingDate"]').blur();

      const errorMsg = page.locator('[name="recordingDate"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('future');
    });

    test('2.7.4 Accepts old date (from 2020)', async ({ page }) => {
      await page.goto('/analysis.html');

      await page.fill('[name="recordingDate"]', '2020-01-15');
      await page.locator('[name="recordingDate"]').blur();

      const errorMsg = page.locator('[name="recordingDate"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toHaveText('');
    });
  });

  test.describe('2.8 File Names Field (Optional)', () => {
    test('2.8.1 File Names field is optional', async ({ page }) => {
      await page.goto('/analysis.html');

      await fillAnalysisForm(page, analysisFormValidData);

      // Leave file names empty
      await page.fill('[name="fileNames"]', '');

      await submitFormAndConfirm(page);

      const errorMsg = page.locator('[name="fileNames"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toHaveText('');
    });

    test('2.8.2 Accepts multiple file names (one per line)', async ({ page }) => {
      await page.goto('/analysis.html');

      const fileNames = 'video1.mp4\nvideo2.avi\nvideo3.mov';
      await page.fill('[name="fileNames"]', fileNames);
      await page.locator('[name="fileNames"]').blur();

      const errorMsg = page.locator('[name="fileNames"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toHaveText('');
    });
  });

  test.describe('2.9 Progress Bar', () => {
    test('2.9.1 Empty form shows 0% progress', async ({ page }) => {
      await page.goto('/analysis.html');

      const progress = await getProgressPercentage(page);
      expect(progress).toBe(0);
    });

    test('2.9.2 Progress increases when filling required fields', async ({ page }) => {
      await page.goto('/analysis.html');

      const initialProgress = await getProgressPercentage(page);

      await page.fill('[name="occNumber"]', 'PR2024001234');

      const newProgress = await getProgressPercentage(page);
      expect(newProgress).toBeGreaterThan(initialProgress);
    });

    test('2.9.3 Progress reaches 100% with all required fields', async ({ page }) => {
      await page.goto('/analysis.html');

      await fillAnalysisForm(page, analysisFormValidData);

      const progress = await getProgressPercentage(page);
      expect(progress).toBe(100);
    });
  });

  test.describe('2.10 Draft Auto-Save', () => {
    test('2.10.1 Draft auto-saves and can be loaded', async ({ page }) => {
      await page.goto('/analysis.html');

      await fillAnalysisForm(page, analysisFormValidData);
      await waitForAutoSave(page);

      await page.reload();

      const draftButton = page.locator('[id="draft-button"]');
      const buttonText = await draftButton.textContent();
      expect(buttonText).toContain('Load Draft');

      await loadDraft(page);

      const occValue = await page.locator('[name="occNumber"]').inputValue();
      expect(occValue).toBe(analysisFormValidData.occNumber);
    });
  });

  test.describe('2.11 Officer Info Persistence', () => {
    test('2.11.1 Officer info pre-fills if saved from previous form', async ({ page }) => {
      // First fill officer info on upload form
      await page.goto('/upload.html');
      await fillOfficerInfo(page, validOfficerData);
      await waitForAutoSave(page);

      // Then go to analysis form
      await page.goto('/analysis.html');

      const nameValue = await page.locator('[name="rName"]').inputValue();
      expect(nameValue).toBe(validOfficerData.rName);
    });

    test('2.11.2 Officer fields remain empty if cleared', async ({ page }) => {
      await page.goto('/analysis.html');

      const nameValue = await page.locator('[name="rName"]').inputValue();
      expect(nameValue).toBe('');
    });
  });

  test.describe('2.12 Successful Submission', () => {
    test('2.12.1 Valid form can be submitted', async ({ page }) => {
      await page.goto('/analysis.html');

      await fillAnalysisForm(page, analysisFormValidData);

      await submitFormAndConfirm(page);

      // Wait for submission and check for success indicator
      const successToast = page.locator('[class*="success"], .toast').first();
      await expect(successToast).toBeVisible({ timeout: 5000 });
    });

    test('2.12.2 Success message appears after submission', async ({ page }) => {
      await page.goto('/analysis.html');

      await fillAnalysisForm(page, analysisFormValidData);

      await submitFormAndConfirm(page);

      const toast = page.locator('[class*="toast"]').filter({ hasText: /success|submitted/i });
      await expect(toast).toBeVisible({ timeout: 5000 });
    });
  });
});
