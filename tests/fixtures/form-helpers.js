/**
 * Form Helper Functions for FVU Request System Tests
 * Provides reusable functions for filling forms and common test actions
 */

import { expect } from '@playwright/test';

/**
 * Fill officer information fields
 */
export async function fillOfficerInfo(page, data) {
  if (data.rName) await page.fill('[name="rName"]', data.rName);
  if (data.badge) await page.fill('[name="badge"]', data.badge);
  if (data.requestingEmail) await page.fill('[name="requestingEmail"]', data.requestingEmail);
  if (data.requestingPhone) await page.fill('[name="requestingPhone"]', data.requestingPhone);
}

/**
 * Fill occurrence information fields (common to most forms)
 */
export async function fillOccurrenceInfo(page, data) {
  if (data.occNumber) await page.fill('[name="occNumber"]', data.occNumber);
  if (data.occDate) await page.fill('[name="occDate"]', data.occDate);
  if (data.occType) await page.fill('[name="occType"]', data.occType);
}

/**
 * Fill upload form specific fields
 */
export async function fillUploadForm(page, data) {
  // Officer info
  if (data.rName) await page.fill('[name="rName"]', data.rName);
  if (data.badge) await page.fill('[name="badge"]', data.badge);
  if (data.requestingEmail) await page.fill('[name="requestingEmail"]', data.requestingEmail);
  if (data.requestingPhone) await page.fill('[name="requestingPhone"]', data.requestingPhone);

  // Evidence info
  if (data.occNumber) await page.fill('[name="occNumber"]', data.occNumber);
  if (data.evidenceBag) await page.fill('[name="evidenceBag"]', data.evidenceBag);

  // Media type
  if (data.mediaType) {
    await page.selectOption('[name="mediaType"]', data.mediaType);
    if (data.mediaType === 'Other' && data.mediaTypeOther) {
      await page.fill('[name="mediaTypeOther"]', data.mediaTypeOther);
    }
  }

  // Location info
  if (data.locationAddress) await page.fill('[name="locationAddress"]', data.locationAddress);

  // City dropdown
  if (data.city) {
    await page.selectOption('[name="city"]', data.city);
    if (data.city === 'Other' && data.cityOther) {
      await page.fill('[name="cityOther"]', data.cityOther);
    }
  }

  // Video time range
  if (data.videoStartTime) await page.fill('[name="videoStartTime"]', data.videoStartTime);
  if (data.videoEndTime) await page.fill('[name="videoEndTime"]', data.videoEndTime);

  // Time & Date Correct
  if (data.timeCorrect) {
    await page.click(`[value="${data.timeCorrect}"]`);
    if (data.timeCorrect === 'No' && data.timeOffset) {
      await page.fill('[name="timeOffset"]', data.timeOffset);
    }
  }

  // Locker number
  if (data.lockerNumber) await page.fill('[name="lockerNumber"]', data.lockerNumber);

  // File details
  if (data.fileDetails) await page.fill('[name="fileDetails"]', data.fileDetails);

  // DVR earliest retention (if present)
  if (data.dvrEarliestDate) await page.fill('[name="dvrEarliestDate"]', data.dvrEarliestDate);
}

/**
 * Fill analysis form specific fields
 */
export async function fillAnalysisForm(page, data) {
  // Officer info
  if (data.rName) await page.fill('[name="rName"]', data.rName);
  if (data.badge) await page.fill('[name="badge"]', data.badge);
  if (data.requestingEmail) await page.fill('[name="requestingEmail"]', data.requestingEmail);
  if (data.requestingPhone) await page.fill('[name="requestingPhone"]', data.requestingPhone);

  // Evidence info
  if (data.occNumber) await page.fill('[name="occNumber"]', data.occNumber);

  // Offence type
  if (data.offenceType) {
    await page.selectOption('[name="offenceType"]', data.offenceType);
    if (data.offenceType === 'Other' && data.offenceTypeOther) {
      await page.fill('[name="offenceTypeOther"]', data.offenceTypeOther);
    }
  }

  // Video location
  if (data.videoLocation) {
    await page.selectOption('[name="videoLocation"]', data.videoLocation);
    if (data.videoLocation === 'Other' && data.videoLocationOther) {
      await page.fill('[name="videoLocationOther"]', data.videoLocationOther);
    }
  }

  // Video seized from
  if (data.videoSeizedFrom) await page.fill('[name="videoSeizedFrom"]', data.videoSeizedFrom);

  // City
  if (data.city) {
    await page.selectOption('[name="city"]', data.city);
    if (data.city === 'Other' && data.cityOther) {
      await page.fill('[name="cityOther"]', data.cityOther);
    }
  }

  // Recording date
  if (data.recordingDate) await page.fill('[name="recordingDate"]', data.recordingDate);

  // Service required
  if (data.serviceRequired) {
    await page.selectOption('[name="serviceRequired"]', data.serviceRequired);
    if (data.serviceRequired === 'Other' && data.serviceRequiredOther) {
      await page.fill('[name="serviceRequiredOther"]', data.serviceRequiredOther);
    }
  }

  // File names
  if (data.fileNames) await page.fill('[name="fileNames"]', data.fileNames);

  // Request details
  if (data.rfsDetails) await page.fill('[name="requestDetails"]', data.rfsDetails);
}

/**
 * Fill recovery form specific fields
 */
export async function fillRecoveryForm(page, data) {
  // Officer info
  if (data.rName) await page.fill('[name="rName"]', data.rName);
  if (data.badge) await page.fill('[name="badge"]', data.badge);
  if (data.requestingEmail) await page.fill('[name="requestingEmail"]', data.requestingEmail);
  if (data.requestingPhone) await page.fill('[name="requestingPhone"]', data.requestingPhone);

  // Evidence info
  if (data.occNumber) await page.fill('[name="occNumber"]', data.occNumber);

  // Offence type
  if (data.offenceType) {
    await page.selectOption('[name="occType"]', data.offenceType);
    if (data.offenceType === 'Other' && data.offenceTypeOther) {
      await page.fill('[name="offenceTypeOther"]', data.offenceTypeOther);
    }
  }

  // Location info
  if (data.locationAddress) await page.fill('[name="locationAddress"]', data.locationAddress);

  // City
  if (data.city) {
    await page.selectOption('[name="city"]', data.city);
    if (data.city === 'Other' && data.cityOther) {
      await page.fill('[name="cityOther"]', data.cityOther);
    }
  }

  // Location contact
  if (data.locationContact) await page.fill('[name="locationContact"]', data.locationContact);
  if (data.locationContactPhone) await page.fill('[name="locationContactPhone"]', data.locationContactPhone);

  // DVR info - for first DVR
  if (data.dvrMakeModel) await page.fill('[name="dvrMakeModel"]', data.dvrMakeModel);

  // DVR time correct
  if (data.dvrTimeCorrect) {
    const radioSelector = `input[name="dvrTimeCorrect"][value="${data.dvrTimeCorrect}"]`;
    await page.check(radioSelector);
    if (data.dvrTimeCorrect === 'No' && data.dvrTimeOffset) {
      await page.fill('[name="dvrTimeOffset"]', data.dvrTimeOffset);
    }
  }

  // DVR retention
  if (data.dvrRetentionDate) await page.fill('[name="dvrRetentionDate"]', data.dvrRetentionDate);

  // Has video monitor
  if (data.hasVideoMonitor) {
    const monitorSelector = `input[name="hasVideoMonitor"][value="${data.hasVideoMonitor}"]`;
    await page.check(monitorSelector);
  }

  // Time period
  if (data.timePeriodFrom) await page.fill('[name="timePeriodFrom"]', data.timePeriodFrom);
  if (data.timePeriodTo) await page.fill('[name="timePeriodTo"]', data.timePeriodTo);

  // Time period type
  if (data.timePeriodType) {
    const typeSelectorText = data.timePeriodType === 'DVR Time' ? 'DVR Time' : 'Actual Time';
    const typeSelector = `input[name="timePeriodType"][value="${typeSelectorText}"]`;
    await page.check(typeSelector);
  }

  // Camera details
  if (data.cameraDetails) await page.fill('[name="cameraDetails"]', data.cameraDetails);

  // DVR credentials
  if (data.dvrUsername) await page.fill('[name="dvrUsername"]', data.dvrUsername);
  if (data.dvrPassword) await page.fill('[name="dvrPassword"]', data.dvrPassword);

  // Incident description
  if (data.incidentDescription) await page.fill('[name="incidentDescription"]', data.incidentDescription);
}

/**
 * Validate field shows error message
 */
export async function expectFieldError(page, fieldSelector, expectedError) {
  const field = page.locator(fieldSelector);
  await expect(field).toHaveClass(/is-invalid/);

  // Find the error message
  const errorElement = page.locator(fieldSelector).evaluate((el) => {
    const nextElement = el.nextElementSibling;
    return nextElement?.textContent || '';
  });

  // Check if error matches
  if (expectedError) {
    expect(await errorElement).toContain(expectedError);
  }
}

/**
 * Validate field has no error
 */
export async function expectFieldValid(page, fieldSelector) {
  const field = page.locator(fieldSelector);
  await expect(field).not.toHaveClass(/is-invalid/);
}

/**
 * Clear form by clicking clear button and confirming
 */
export async function clearForm(page, clickCancel = false) {
  await page.click('button:has-text("Clear Form")');

  if (clickCancel) {
    // Look for cancel button in confirmation dialog
    const dialogs = page.locator('dialog, [role="dialog"]');
    if (await dialogs.count() > 0) {
      const dialog = dialogs.first();
      const cancelBtn = dialog.locator('button:has-text("Cancel")');
      await cancelBtn.click();
    }
  } else {
    // Confirm clear
    const dialogs = page.locator('dialog, [role="dialog"]');
    if (await dialogs.count() > 0) {
      const dialog = dialogs.first();
      const confirmBtn = dialog.locator('button:has-text("OK"), button:has-text("Yes"), button:not(:has-text("Cancel"))').first();
      await confirmBtn.click();
    }
  }
}

/**
 * Load draft from saved data
 */
export async function loadDraft(page) {
  const draftButton = page.locator('[id="draft-button"], button:has-text("Load Draft")');
  await draftButton.click();

  // Check if a menu appears
  const loadDraftOption = page.locator('button:has-text("Load Draft")');
  if (await loadDraftOption.count() > 0) {
    await loadDraftOption.click();
  }
}

/**
 * Scroll to field and ensure it's visible
 */
export async function scrollToField(page, fieldSelector) {
  const field = page.locator(fieldSelector);
  await field.scrollIntoViewIfNeeded();
}

/**
 * Get all form input values
 */
export async function getAllFormValues(page) {
  return await page.evaluate(() => {
    const formData = {};
    const inputs = document.querySelectorAll('input[name], select[name], textarea[name]');
    inputs.forEach(input => {
      if (input.type === 'radio' || input.type === 'checkbox') {
        if (input.checked) {
          formData[input.name] = input.value;
        }
      } else {
        formData[input.name] = input.value;
      }
    });
    return formData;
  });
}

/**
 * Clear localStorage (for clearing drafts/officer info)
 */
export async function clearLocalStorage(page) {
  await page.evaluate(() => {
    localStorage.clear();
  });
}

/**
 * Get specific localStorage value
 */
export async function getLocalStorage(page, key) {
  return await page.evaluate((k) => localStorage.getItem(k), key);
}

/**
 * Submit form and check for success toast
 */
export async function submitAndVerifySuccess(page, timeoutMs = 10000) {
  const submitButton = page.locator('button[type="submit"]');
  await submitButton.click();

  // Look for success toast
  const successToast = page.locator('.toast.success, .toast-success, [class*="success"]').first();
  await expect(successToast).toBeVisible({ timeout: timeoutMs });

  // Get toast text
  const toastText = await successToast.textContent();
  return toastText;
}

/**
 * Check if console has JavaScript errors
 */
export async function captureConsoleErrors(page) {
  const errors = [];
  page.on('pageerror', err => errors.push(err.toString()));
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  return errors;
}

/**
 * Toggle theme and verify
 */
export async function toggleTheme(page) {
  const themeButton = page.locator('[id="theme-toggle"], button:has-text("🌓")');
  const currentTheme = await page.getAttribute('html', 'data-theme');

  await themeButton.click();

  // Wait for theme to change
  const newTheme = await page.getAttribute('html', 'data-theme');
  expect(newTheme).not.toBe(currentTheme);

  return { from: currentTheme, to: newTheme };
}

/**
 * Add another location (for Upload form)
 */
export async function addLocation(page, count = 1) {
  for (let i = 0; i < count; i++) {
    const addButton = page.locator('button:has-text("Add Another Location")').first();
    await addButton.click();
    // Wait for new location to appear
    await page.waitForTimeout(500);
  }
}

/**
 * Remove a location (for Upload form)
 */
export async function removeLocation(page, locationIndex) {
  const removeButtons = page.locator('button:has-text("Remove This Location")');
  if (await removeButtons.nth(locationIndex).isVisible()) {
    await removeButtons.nth(locationIndex).click();
    // Wait for removal animation
    await page.waitForTimeout(500);
  }
}

/**
 * Add another DVR system (for Recovery form)
 */
export async function addDVRSystem(page, count = 1) {
  for (let i = 0; i < count; i++) {
    const addButton = page.locator('button:has-text("Add Another DVR System")').first();
    await addButton.click();
    // Wait for new DVR to appear
    await page.waitForTimeout(500);
  }
}

/**
 * Add another time frame to DVR (for Recovery form)
 */
export async function addTimeFrame(page, dvrIndex = 0, count = 1) {
  for (let i = 0; i < count; i++) {
    const dvrSection = page.locator('[class*="dvr-section"], [class*="dvr"]').nth(dvrIndex);
    const addButton = dvrSection.locator('button:has-text("Add Additional Time Frame")').first();
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(500);
    }
  }
}

/**
 * Get progress bar percentage
 */
export async function getProgressPercentage(page) {
  const progressText = page.locator('[class*="progress"], .progress-text');
  const text = await progressText.textContent();
  const match = text?.match(/(\d+)%/);
  return match ? parseInt(match[1]) : 0;
}

/**
 * Wait for auto-save to complete
 */
export async function waitForAutoSave(page, timeoutMs = 3500) {
  // Default auto-save time is 2 seconds + buffer
  await page.waitForTimeout(timeoutMs);

  // Optionally check console for "Draft saved" message
  const saveLogs = [];
  page.on('console', msg => {
    if (msg.text().includes('Draft')) {
      saveLogs.push(msg.text());
    }
  });
  return saveLogs;
}

/**
 * Set offline mode
 */
export async function setOfflineMode(page, offline = true) {
  await page.context().setOffline(offline);
  await page.waitForTimeout(500);
}
