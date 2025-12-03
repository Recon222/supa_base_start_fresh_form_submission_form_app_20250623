import { test, expect } from '@playwright/test';
import {
  validOfficerData,
  uploadFormValidData,
  analysisFormValidData,
  recoveryFormValidData
} from './fixtures/test-data.js';
import {
  fillOfficerInfo,
  fillUploadForm,
  fillAnalysisForm,
  fillRecoveryForm,
  clearLocalStorage,
  toggleTheme,
  waitForAutoSave,
  loadDraft,
  setOfflineMode,
  getLocalStorage,
  submitFormAndConfirm
} from './fixtures/form-helpers.js';

test.describe('Cross-Form Tests', () => {
  test.beforeEach(async ({ page }) => {
    await clearLocalStorage(page);
  });

  test.describe('4.1 Officer Info Persistence Across Forms', () => {
    test('4.1.1 Officer info from Upload persists to Analysis', async ({ page }) => {
      // Fill and save officer info on Upload form
      await page.goto('/upload.html');
      await fillOfficerInfo(page, validOfficerData);
      await waitForAutoSave(page);

      // Navigate to Analysis
      await page.goto('/analysis.html');

      const nameValue = await page.locator('[name="rName"]').inputValue();
      const emailValue = await page.locator('[name="requestingEmail"]').inputValue();

      expect(nameValue).toBe(validOfficerData.rName);
      expect(emailValue).toBe(validOfficerData.requestingEmail);
    });

    test('4.1.2 Officer info persists to Recovery form', async ({ page }) => {
      // Fill officer info on Upload form
      await page.goto('/upload.html');
      await fillOfficerInfo(page, validOfficerData);
      await waitForAutoSave(page);

      // Navigate to Recovery
      await page.goto('/recovery.html');

      const nameValue = await page.locator('[name="rName"]').inputValue();
      const badgeValue = await page.locator('[name="badge"]').inputValue();

      expect(nameValue).toBe(validOfficerData.rName);
      expect(badgeValue).toBe(validOfficerData.badge);
    });

    test('4.1.3 Clearing officer info on one form clears across all forms', async ({ page }) => {
      // Fill officer info
      await page.goto('/upload.html');
      await fillOfficerInfo(page, validOfficerData);
      await waitForAutoSave(page);

      // Clear on Recovery form
      await page.goto('/recovery.html');
      const clearButton = page.locator('button:has-text("Clear Investigator Info")');
      if (await clearButton.isVisible()) {
        await clearButton.click();
      }

      // Check Upload form is now empty
      await page.goto('/upload.html');
      const nameValue = await page.locator('[name="rName"]').inputValue();
      expect(nameValue).toBe('');
    });

    test('4.1.4 Officer info is shared via localStorage', async ({ page }) => {
      await page.goto('/upload.html');
      await fillOfficerInfo(page, validOfficerData);
      await waitForAutoSave(page);

      // Check localStorage directly
      const officerInfo = await getLocalStorage(page, 'fvu_officer_info');
      expect(officerInfo).toBeTruthy();

      // Verify it contains the officer name
      const parsed = JSON.parse(officerInfo);
      expect(parsed.rName).toBe(validOfficerData.rName);
    });
  });

  test.describe('4.2 Draft Independence', () => {
    test('4.2.1 Each form maintains its own independent draft', async ({ page }) => {
      // Create Upload draft
      await page.goto('/upload.html');
      await fillUploadForm(page, uploadFormValidData);
      await waitForAutoSave(page);

      // Create Analysis draft with different data
      await page.goto('/analysis.html');
      await fillAnalysisForm(page, analysisFormValidData);
      await waitForAutoSave(page);

      // Create Recovery draft
      await page.goto('/recovery.html');
      await fillRecoveryForm(page, recoveryFormValidData);
      await waitForAutoSave(page);

      // Verify Upload draft is preserved
      await page.goto('/upload.html');
      const uploadOccValue = await page.locator('[name="occNumber"]').inputValue();
      expect(uploadOccValue).not.toBe(analysisFormValidData.occNumber);
      expect(uploadOccValue).not.toBe(recoveryFormValidData.occNumber);
    });

    test('4.2.2 Loading Upload draft does not show Analysis data', async ({ page }) => {
      // Create Upload draft
      await page.goto('/upload.html');
      const uploadOccurrence = 'PR2024001234';
      await page.fill('[name="occNumber"]', uploadOccurrence);
      await waitForAutoSave(page);

      // Create Analysis draft with different occurrence
      await page.goto('/analysis.html');
      const analysisOccurrence = 'PR2024005678';
      await page.fill('[name="occNumber"]', analysisOccurrence);
      await waitForAutoSave(page);

      // Go back to Upload and reload
      await page.goto('/upload.html');
      await page.reload();

      // Verify Upload still has its own occurrence
      const occValue = await page.locator('[name="occNumber"]').inputValue();
      expect(occValue).toBe(uploadOccurrence);
      expect(occValue).not.toBe(analysisOccurrence);
    });

    test('4.2.3 Clearing one form draft does not affect other forms', async ({ page }) => {
      // Create drafts on all forms
      await page.goto('/upload.html');
      await fillUploadForm(page, uploadFormValidData);
      await waitForAutoSave(page);

      await page.goto('/analysis.html');
      await fillAnalysisForm(page, analysisFormValidData);
      await waitForAutoSave(page);

      // Clear Upload draft
      await page.goto('/upload.html');
      const draftButton = page.locator('[id="draft-button"]');
      await draftButton.click();

      // Try to find and click clear draft if available
      const clearDraftButton = page.locator('button:has-text("Clear Draft"), button:has-text("Delete Draft")');
      if (await clearDraftButton.isVisible()) {
        await clearDraftButton.click();
      }

      // Verify Analysis draft still exists
      await page.goto('/analysis.html');
      const loadDraftButton = page.locator('[id="draft-button"]');
      const buttonText = await loadDraftButton.textContent();
      expect(buttonText).toContain('Load Draft');
    });
  });

  test.describe('4.3 Theme Persistence Across Forms', () => {
    test('4.3.1 Setting light theme on Upload persists to Analysis', async ({ page }) => {
      await page.goto('/upload.html');

      // Set to light theme
      const themeButton = page.locator('[id="theme-toggle"]');
      await themeButton.click();
      await page.waitForTimeout(300);

      const theme = await page.getAttribute('html', 'data-theme');
      expect(theme).toBe('light');

      // Navigate to Analysis
      await page.goto('/analysis.html');

      const analysisTheme = await page.getAttribute('html', 'data-theme');
      expect(analysisTheme).toBe('light');
    });

    test('4.3.2 Theme persists to Recovery form', async ({ page }) => {
      await page.goto('/upload.html');

      // Set to light
      const themeButton = page.locator('[id="theme-toggle"]');
      await themeButton.click();
      await page.waitForTimeout(300);

      // Navigate to Recovery
      await page.goto('/recovery.html');

      const recoveryTheme = await page.getAttribute('html', 'data-theme');
      expect(recoveryTheme).toBe('light');
    });

    test('4.3.3 Toggling theme on Recovery affects all forms', async ({ page }) => {
      // Set to light on Upload
      await page.goto('/upload.html');
      const themeButton = page.locator('[id="theme-toggle"]');
      await themeButton.click();
      await page.waitForTimeout(300);

      // Toggle back to dark on Recovery
      await page.goto('/recovery.html');
      const recoveryThemeButton = page.locator('[id="theme-toggle"]');
      await recoveryThemeButton.click();
      await page.waitForTimeout(300);

      // Verify all forms are dark now
      await page.goto('/upload.html');
      const uploadTheme = await page.getAttribute('html', 'data-theme');
      expect(uploadTheme).toBe('dark');
    });

    test('4.3.4 Theme preference persists after page refresh', async ({ page }) => {
      await page.goto('/upload.html');

      // Toggle to light
      const themeButton = page.locator('[id="theme-toggle"]');
      await themeButton.click();
      await page.waitForTimeout(300);

      // Refresh and check
      await page.reload();

      const theme = await page.getAttribute('html', 'data-theme');
      expect(theme).toBe('light');
    });
  });

  test.describe('4.4 Session and Storage Management', () => {
    test('4.4.1 Session start time is recorded', async ({ page }) => {
      await page.goto('/upload.html');

      const sessionStart = await getLocalStorage(page, 'fvu_session_start');
      expect(sessionStart).toBeTruthy();
    });

    test('4.4.2 Multiple form submissions accumulate without clearing previous officer info', async ({
      page
    }) => {
      // Fill and submit Upload form
      await page.goto('/upload.html');
      await fillUploadForm(page, uploadFormValidData);
      await waitForAutoSave(page);

      // Navigate to Analysis and fill
      await page.goto('/analysis.html');
      const analysisData = { ...analysisFormValidData };
      await fillAnalysisForm(page, analysisData);

      // Verify officer info persists
      const nameValue = await page.locator('[name="rName"]').inputValue();
      expect(nameValue).toBe(validOfficerData.rName);
    });
  });

  test.describe('4.5 Offline Behavior Across Forms', () => {
    test('4.5.1 Going offline on one form and returning online works', async ({ page }) => {
      await page.goto('/upload.html');
      await fillUploadForm(page, uploadFormValidData);

      // Go offline
      await setOfflineMode(page, true);

      await submitFormAndConfirm(page);

      // Should show offline message
      const offlineToast = page.locator('[class*="toast"]').filter({ hasText: /offline/i });
      await expect(offlineToast).toBeVisible({ timeout: 3000 });

      // Go back online
      await setOfflineMode(page, false);

      // Draft should be saved
      await page.reload();

      const draftButton = page.locator('[id="draft-button"]');
      const buttonText = await draftButton.textContent();
      expect(buttonText).toContain('Load Draft');
    });

    test('4.5.2 Can navigate between forms while offline', async ({ page }) => {
      await page.goto('/upload.html');

      // Go offline
      await setOfflineMode(page, true);

      // Navigate to Analysis - should work
      await page.goto('/analysis.html');

      const form = page.locator('#analysis-form');
      await expect(form).toBeVisible();

      // Go back online
      await setOfflineMode(page, false);
    });
  });

  test.describe('4.6 Form Field Cross-Validation', () => {
    test('4.6.1 Email validation is consistent across all forms', async ({ page }) => {
      const invalidEmail = 'test@gmail.com';

      // Test Upload form
      await page.goto('/upload.html');
      await page.fill('[name="requestingEmail"]', invalidEmail);
      await page.locator('[name="requestingEmail"]').blur();

      let errorMsg = page.locator('[name="requestingEmail"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('@peelpolice.ca');

      // Test Analysis form
      await page.goto('/analysis.html');
      await page.fill('[name="requestingEmail"]', invalidEmail);
      await page.locator('[name="requestingEmail"]').blur();

      errorMsg = page.locator('[name="requestingEmail"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('@peelpolice.ca');

      // Test Recovery form
      await page.goto('/recovery.html');
      await page.fill('[name="requestingEmail"]', invalidEmail);
      await page.locator('[name="requestingEmail"]').blur();

      errorMsg = page.locator('[name="requestingEmail"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('@peelpolice.ca');
    });

    test('4.6.2 Phone validation is consistent across all forms', async ({ page }) => {
      const invalidPhone = '123';

      // Test Upload form
      await page.goto('/upload.html');
      await page.fill('[name="requestingPhone"]', invalidPhone);
      await page.locator('[name="requestingPhone"]').blur();

      let errorMsg = page.locator('[name="requestingPhone"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('10 digits');

      // Test Analysis form
      await page.goto('/analysis.html');
      await page.fill('[name="requestingPhone"]', invalidPhone);
      await page.locator('[name="requestingPhone"]').blur();

      errorMsg = page.locator('[name="requestingPhone"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('10 digits');

      // Test Recovery form
      await page.goto('/recovery.html');
      await page.fill('[name="requestingPhone"]', invalidPhone);
      await page.locator('[name="requestingPhone"]').blur();

      errorMsg = page.locator('[name="requestingPhone"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('10 digits');
    });

    test('4.6.3 Occurrence number validation is consistent', async ({ page }) => {
      const invalidOccurrence = '123456'; // Missing PR

      // Test Upload form
      await page.goto('/upload.html');
      await page.fill('[name="occNumber"]', invalidOccurrence);
      await page.locator('[name="occNumber"]').blur();

      let errorMsg = page.locator('[name="occNumber"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('PR');

      // Test Analysis form
      await page.goto('/analysis.html');
      await page.fill('[name="occNumber"]', invalidOccurrence);
      await page.locator('[name="occNumber"]').blur();

      errorMsg = page.locator('[name="occNumber"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('PR');

      // Test Recovery form
      await page.goto('/recovery.html');
      await page.fill('[name="occNumber"]', invalidOccurrence);
      await page.locator('[name="occNumber"]').blur();

      errorMsg = page.locator('[name="occNumber"]').locator('~ .invalid-feedback');
      await expect(errorMsg).toContainText('PR');
    });
  });
});
