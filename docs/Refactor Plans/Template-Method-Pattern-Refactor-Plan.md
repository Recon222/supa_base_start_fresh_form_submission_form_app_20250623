# Template Method Pattern Refactor Plan

## Executive Summary

This document provides a comprehensive phased implementation plan for refactoring the FormHandler class hierarchy to use the Template Method Pattern. The goal is to solve the initialization order issue where the base class `init()` method runs before subclass constructors can build dynamic fields.

**Current Problem**: The base class constructor calls `init()`, which sets up keyboard fixes and autofill configuration. But subclass constructors have not yet executed `buildInitialFields()` at this point, so dynamic fields do not exist when these setup methods run.

**Current Workaround**: Each subclass re-calls `setupKeyboardProgressBarFix()` and `applyAutofillPrevention()` after `buildInitialFields()`.

**Solution**: Refactor to Template Method Pattern where the base class orchestrates the entire initialization sequence and calls a `buildFields()` hook that subclasses implement.

---

## Code Analysis Summary

### Base Class: FormHandler (`form-handler-base.js`)

**Current Constructor (lines 21-33):**
```javascript
constructor(formId) {
  this.form = document.getElementById(formId);
  if (!this.form) {
    throw new Error(`Form with id "${formId}" not found`);
  }
  this.formType = this.form.id.replace('-form', '');
  this.isSubmitting = false;
  this.draftTimer = null;
  this.hasStartedWorking = false;
  this.init();  // <-- Called before subclass constructor runs
}
```

**Current init() method (lines 52-73):**
```javascript
init() {
  saveSessionStart();
  this.configureAutofill();        // <-- Runs before dynamic fields exist
  this.setupEventListeners();
  this.setupKeyboardProgressBarFix();  // <-- Runs before dynamic fields exist
  this.loadOfficerInfoIfExists();
  this.loadDraftIfExists();
  this.updateProgress();
}
```

### Subclass Pattern (All Three Handlers)

Each subclass follows the same pattern in their constructor:

```javascript
constructor(formId) {
  super(formId);  // <-- Base init() runs here
  this.flatpickrInstances = {};
  this.buildInitialFields();  // <-- Dynamic fields created here
  this.setupXxxSpecificListeners();
  this.initializeFlatpickrFields();
  window.addEventListener('beforeunload', () => this.destroy());
}
```

**Workaround in buildInitialFields() (all three forms):**
```javascript
buildInitialFields() {
  // ... build sections ...
  this.attachValidationListeners(this.form);
  this.setupKeyboardProgressBarFix();  // <-- Re-called after fields built
  if (CONFIG.FEATURES.BROWSER_AUTOFILL === false) {
    this.applyAutofillPrevention(this.form.querySelectorAll('.form-control'));
  }
}
```

### Methods That Need Reordering

| Method | Depends on Fields | Currently Called |
|--------|-------------------|------------------|
| `saveSessionStart()` | No | In base init() |
| `configureAutofill()` | YES | In base init() (too early) |
| `setupEventListeners()` | YES* | In base init() |
| `setupKeyboardProgressBarFix()` | YES | In base init() (too early) |
| `loadOfficerInfoIfExists()` | YES | In base init() |
| `loadDraftIfExists()` | No (just updates button) | In base init() |
| `updateProgress()` | YES | In base init() |

*Note: `setupEventListeners()` attaches to existing `.form-control` elements via `querySelectorAll`, so it only affects fields present at time of call.

---

## Phase 0: Test Preparation

### Objective
Add tests that verify initialization sequence behavior BEFORE making changes. These tests will confirm the refactor does not break existing behavior.

### Test Categories

#### 0.1 Initialization Sequence Tests

Create file: `tests/unit/base/form-handler-init-sequence.test.js`

```javascript
/**
 * FormHandler Initialization Sequence Tests
 *
 * These tests verify that initialization methods are called in the correct order
 * and that field-dependent setup happens AFTER fields are built.
 *
 * Test approach: Spy on method calls and verify call order/timing
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('FormHandler - Initialization Sequence', () => {
  // Test that buildFields() hook is called during initialization
  // Test that field-dependent methods run after buildFields()
  // Test that early setup (no field dependencies) runs before buildFields()
});
```

**Tests to Add:**

1. **Hook Call Order Test**
   - Verify `buildFields()` is called during initialization
   - Verify field-dependent methods run AFTER `buildFields()` returns

2. **Default Hook Behavior Test**
   - Verify base class `buildFields()` returns without error (backward compatibility)
   - Verify subclasses that don't override `buildFields()` still work

3. **Field-Dependent Setup Timing Test**
   - Mock `buildFields()` to track when fields exist
   - Verify `setupKeyboardProgressBarFix()` sees dynamic fields
   - Verify `configureAutofill()` sees dynamic fields

#### 0.2 Subclass Initialization Tests

Create file: `tests/unit/base/form-handler-subclass-init.test.js`

**Tests to Add:**

1. **Upload Form Initialization**
   - Verify all sections built before field setup runs
   - Verify Flatpickr instances created on correct fields
   - Verify autofill prevention applied to ALL fields (including dynamic)

2. **Analysis Form Initialization**
   - Same verification as Upload

3. **Recovery Form Initialization**
   - Same verification as Upload
   - Verify DVR group fields included in setup

#### 0.3 Backward Compatibility Tests

**Tests to Add:**

1. **No buildFields() Override Test**
   - Create a minimal subclass that does NOT override `buildFields()`
   - Verify initialization completes without error
   - Verify existing static fields still get setup correctly

2. **Partial Dynamic Fields Test**
   - Verify forms with mix of static HTML and dynamic fields work correctly

### Test Implementation Checklist

- [ ] Create `tests/unit/base/form-handler-init-sequence.test.js`
- [ ] Add hook call order tests
- [ ] Add default hook behavior tests
- [ ] Add field-dependent setup timing tests
- [ ] Create `tests/unit/base/form-handler-subclass-init.test.js`
- [ ] Add Upload form initialization tests
- [ ] Add Analysis form initialization tests
- [ ] Add Recovery form initialization tests
- [ ] Add backward compatibility tests
- [ ] Run all tests and verify they PASS with current code (before refactor)

### Acceptance Criteria

- All new tests pass with current (pre-refactor) code
- Tests explicitly verify initialization order
- Tests will fail if field-dependent setup runs before fields exist

---

## Phase 1: Global Base Class Changes

### Objective
Modify `FormHandler` base class to use Template Method Pattern with proper initialization sequence.

### Changes Required

#### 1.1 Add buildFields() Hook Method

Add after line 73 (end of init()):

```javascript
/**
 * Hook for subclasses to build dynamic form fields
 * Called during initialization, BEFORE field-dependent setup runs
 *
 * Override this in subclasses that build fields dynamically via FormFieldBuilder.
 * The base implementation is empty for backward compatibility with forms
 * that use static HTML fields.
 *
 * @protected
 */
buildFields() {
  // Default: no-op for backward compatibility
  // Subclasses override to build dynamic fields
}
```

#### 1.2 Restructure init() Method

Replace the current init() method (lines 52-73) with:

```javascript
/**
 * Initialize the form handler using Template Method Pattern
 *
 * Initialization sequence:
 * 1. Pre-field setup (no field dependencies)
 * 2. Build fields via hook (subclasses implement)
 * 3. Post-field setup (field-dependent configuration)
 * 4. Load saved state
 * 5. Update UI
 */
init() {
  // ===== PHASE 1: Pre-field setup (no dependencies) =====
  saveSessionStart();

  // ===== PHASE 2: Build fields via Template Method hook =====
  // Subclasses override this to create dynamic fields
  this.buildFields();

  // ===== PHASE 3: Field-dependent setup =====
  // These methods require all fields to exist in the DOM
  this.configureAutofill();
  this.setupEventListeners();
  this.setupKeyboardProgressBarFix();

  // ===== PHASE 4: Load saved state =====
  this.loadOfficerInfoIfExists();
  this.loadDraftIfExists();

  // ===== PHASE 5: Update UI =====
  this.updateProgress();
}
```

#### 1.3 Remove Tech Debt Comment

Delete the TODO comment block (lines 35-51) as the issue will be resolved.

### Line-by-Line Changes

| Line | Current | New |
|------|---------|-----|
| 35-51 | Tech debt TODO comment | DELETE |
| 52 | `init() {` | Keep as-is |
| 53-54 | `// Save session start` + `saveSessionStart();` | Keep as-is |
| 55-57 | `// Disable browser autofill...` + `this.configureAutofill();` | MOVE to Phase 3 |
| 59-60 | `// Set up event listeners` + `this.setupEventListeners();` | MOVE to Phase 3 |
| 62-63 | `// Set up iOS keyboard fix...` + `this.setupKeyboardProgressBarFix();` | MOVE to Phase 3 |
| 65-66 | `// Load officer info...` + `this.loadOfficerInfoIfExists();` | MOVE to Phase 4 |
| 68-69 | `// Load draft...` + `this.loadDraftIfExists();` | MOVE to Phase 4 |
| 71-72 | `// Initialize progress bar` + `this.updateProgress();` | MOVE to Phase 5 |
| After 73 | - | ADD `buildFields()` method |

### Full Replacement Code

```javascript
/**
 * Initialize the form handler using Template Method Pattern
 *
 * Initialization sequence:
 * 1. Pre-field setup (no field dependencies)
 * 2. Build fields via hook (subclasses implement)
 * 3. Post-field setup (field-dependent configuration)
 * 4. Load saved state
 * 5. Update UI
 */
init() {
  // ===== PHASE 1: Pre-field setup (no dependencies) =====
  saveSessionStart();

  // ===== PHASE 2: Build fields via Template Method hook =====
  // Subclasses override this to create dynamic fields
  this.buildFields();

  // ===== PHASE 3: Field-dependent setup =====
  // These methods require all fields to exist in the DOM
  this.configureAutofill();
  this.setupEventListeners();
  this.setupKeyboardProgressBarFix();

  // ===== PHASE 4: Load saved state =====
  this.loadOfficerInfoIfExists();
  this.loadDraftIfExists();

  // ===== PHASE 5: Update UI =====
  this.updateProgress();
}

/**
 * Hook for subclasses to build dynamic form fields
 * Called during initialization, BEFORE field-dependent setup runs
 *
 * Override this in subclasses that build fields dynamically via FormFieldBuilder.
 * The base implementation is empty for backward compatibility with forms
 * that use static HTML fields.
 *
 * @protected
 */
buildFields() {
  // Default: no-op for backward compatibility
  // Subclasses override to build dynamic fields
}
```

### Acceptance Criteria

- [ ] `init()` method restructured with 5-phase sequence
- [ ] `buildFields()` hook added with JSDoc
- [ ] Tech debt TODO comment removed
- [ ] All existing tests still pass
- [ ] Phase 0 initialization sequence tests pass

---

## Phase 2+: Form Handler Migration (Generic Template)

This template is REUSABLE for migrating any of the three form handlers (Upload, Analysis, Recovery). Follow this checklist for each handler.

### Pre-Migration Checklist

- [ ] Identify the form handler file: `form-handler-{type}.js`
- [ ] Confirm it extends `FormHandler`
- [ ] Identify the `buildInitialFields()` method (or equivalent)
- [ ] Identify workaround calls that need removal

### Step 1: Rename buildInitialFields() to buildFields()

**Current Pattern (all handlers):**
```javascript
buildInitialFields() {
  this.buildCaseSection();
  this.buildInvestigatorSection();
  // ... more section builds ...

  // WORKAROUND: Re-call setup methods
  this.attachValidationListeners(this.form);
  this.setupKeyboardProgressBarFix();  // <-- REMOVE
  if (CONFIG.FEATURES.BROWSER_AUTOFILL === false) {
    this.applyAutofillPrevention(...);  // <-- REMOVE
  }
}
```

**New Pattern:**
```javascript
/**
 * Build all form fields dynamically via FormFieldBuilder
 * Implements the Template Method hook from FormHandler base class
 *
 * @override
 */
buildFields() {
  this.buildCaseSection();
  this.buildInvestigatorSection();
  // ... more section builds ...

  // Attach validation listeners to dynamically built fields
  this.attachValidationListeners(this.form);

  // NOTE: setupKeyboardProgressBarFix() and configureAutofill() are now
  // called by the base class init() AFTER this method returns
}
```

### Step 2: Remove Workaround Method Calls

Remove these lines from `buildFields()` (formerly `buildInitialFields()`):

```javascript
// DELETE THIS:
this.setupKeyboardProgressBarFix();

// DELETE THIS:
if (CONFIG.FEATURES.BROWSER_AUTOFILL === false) {
  this.applyAutofillPrevention(this.form.querySelectorAll('.form-control'));
}
```

### Step 3: Update Constructor

**Current Pattern:**
```javascript
constructor(formId) {
  super(formId);  // Base init() runs here
  this.flatpickrInstances = {};

  this.buildInitialFields();  // <-- REMOVE
  this.setupXxxSpecificListeners();
  this.initializeFlatpickrFields();
  window.addEventListener('beforeunload', () => this.destroy());
}
```

**New Pattern:**
```javascript
constructor(formId) {
  // Initialize instance properties BEFORE super() calls init()
  this.flatpickrInstances = {};

  // Call parent constructor - this triggers init() which calls buildFields()
  super(formId);

  // Post-initialization setup (things that need buildFields() to have run)
  this.setupXxxSpecificListeners();
  this.initializeFlatpickrFields();

  // Cleanup handler
  window.addEventListener('beforeunload', () => this.destroy());
}
```

**Important**: Instance properties like `this.flatpickrInstances = {}` must be initialized BEFORE `super(formId)` is called, because `super()` triggers `init()` which calls `buildFields()`.

### Step 4: Remove Redundant Workarounds from Dynamic Add Methods

For handlers with dynamic "Add" functionality (Upload: `addLocationVideo()`, Recovery: `addDVRGroup()`, `addTimeFrame()`), remove redundant workaround calls:

**Current Pattern:**
```javascript
addLocationVideo() {
  // ... create location video group ...
  this.applyAutofillPrevention(locationVideoGroup.querySelectorAll('input, select, textarea'));
  this.attachValidationListeners(locationVideoGroup);
  // ... initialize Flatpickr ...
  this.setupKeyboardProgressBarFix();  // <-- KEEP (for new fields only)
  // ...
}
```

**Keep These** (they apply to newly added dynamic fields):
```javascript
this.applyAutofillPrevention(newElement.querySelectorAll('input, select, textarea'));
this.attachValidationListeners(newElement);
this.setupKeyboardProgressBarFix();  // Still needed for dynamically added fields
```

**Note**: The workaround removal is only for `buildFields()`. Dynamic add methods still need to apply setup to newly created fields.

### Step 5: Update Method References

If there are any references to `buildInitialFields()` elsewhere in the code (unlikely), update them to `buildFields()`.

### Step 6: Verify Tests Pass

- [ ] Run form-specific unit tests
- [ ] Run form-specific integration tests
- [ ] Run Playwright e2e tests for the form
- [ ] Verify no console errors on page load
- [ ] Manually test form in browser

### Migration Checklist Template

```markdown
### [FORM_TYPE] Form Handler Migration

**File**: `assets/js/form-handlers/form-handler-[type].js`

#### Changes Made:
- [ ] Renamed `buildInitialFields()` to `buildFields()`
- [ ] Added `@override` JSDoc annotation
- [ ] Removed `this.setupKeyboardProgressBarFix()` workaround from buildFields()
- [ ] Removed `this.applyAutofillPrevention()` workaround from buildFields()
- [ ] Moved `this.flatpickrInstances = {}` before `super(formId)`
- [ ] Removed `this.buildInitialFields()` call from constructor

#### Verification:
- [ ] Unit tests pass: `npm test -- tests/unit/[type]`
- [ ] Integration tests pass: `npm test -- tests/integration/[type]`
- [ ] E2E tests pass: `npx playwright test tests/[type]-form.spec.js`
- [ ] Manual browser test: Form loads without errors
- [ ] Manual browser test: iOS keyboard fix works on dynamic fields
- [ ] Manual browser test: Autofill prevention works on all fields
- [ ] Manual browser test: Draft loading works
- [ ] Manual browser test: Progress bar updates correctly
```

### Common Pitfalls

1. **Instance Property Initialization Order**
   - Properties used by `buildFields()` MUST be initialized before `super()`
   - Example: `this.flatpickrInstances = {}` must come before `super(formId)`

2. **Keeping Dynamic Field Setup**
   - Do NOT remove setup calls from `addLocationVideo()`, `addDVRGroup()`, etc.
   - Those methods add fields AFTER initialization, so they need their own setup

3. **Testing with Static HTML**
   - Some forms may have mixed static/dynamic fields
   - The empty base `buildFields()` handles static-only cases

4. **Flatpickr Initialization Timing**
   - `initializeFlatpickrFields()` must run AFTER `buildFields()`
   - This is handled by keeping it in the constructor after `super()`

---

## Summary: File Changes by Phase

### Phase 0: Test Preparation
| Action | File |
|--------|------|
| CREATE | `tests/unit/base/form-handler-init-sequence.test.js` |
| CREATE | `tests/unit/base/form-handler-subclass-init.test.js` |

### Phase 1: Base Class Changes
| Action | File | Lines |
|--------|------|-------|
| DELETE | `form-handler-base.js` | 35-51 (TODO comment) |
| MODIFY | `form-handler-base.js` | 52-73 (restructure init()) |
| ADD | `form-handler-base.js` | After 73 (buildFields() hook) |

### Phase 2: Upload Form Migration
| Action | File | Lines |
|--------|------|-------|
| RENAME | `form-handler-upload.js` | `buildInitialFields` -> `buildFields` |
| MODIFY | `form-handler-upload.js` | Constructor - reorder property init |
| DELETE | `form-handler-upload.js` | Workaround calls in buildFields() |

### Phase 3: Analysis Form Migration
| Action | File | Lines |
|--------|------|-------|
| RENAME | `form-handler-analysis.js` | `buildInitialFields` -> `buildFields` |
| MODIFY | `form-handler-analysis.js` | Constructor - reorder property init |
| DELETE | `form-handler-analysis.js` | Workaround calls in buildFields() |

### Phase 4: Recovery Form Migration
| Action | File | Lines |
|--------|------|-------|
| RENAME | `form-handler-recovery.js` | `buildInitialFields` -> `buildFields` |
| MODIFY | `form-handler-recovery.js` | Constructor - reorder property init |
| DELETE | `form-handler-recovery.js` | Workaround calls in buildFields() |

---

## Rollback Plan

If issues arise during migration, each phase can be rolled back independently:

1. **Phase 1 Rollback**: Restore original `init()` method and remove `buildFields()` hook
2. **Phase 2-4 Rollback**: Restore `buildInitialFields()` name and add workaround calls back

The changes are additive and do not break backward compatibility, so partial rollback is possible.

---

## Success Metrics

After completing all phases:

1. **No Workaround Calls**: `setupKeyboardProgressBarFix()` and `applyAutofillPrevention()` appear only in:
   - Base class `init()` (called once)
   - Dynamic "Add" methods (for new fields only)

2. **Clean Constructor Pattern**: Subclass constructors follow this pattern:
   ```javascript
   constructor(formId) {
     this.instanceProperties = {};
     super(formId);
     this.postInitSetup();
   }
   ```

3. **All Tests Pass**: Unit, integration, and e2e tests pass

4. **No Console Errors**: Forms load without errors in browser

5. **Feature Parity**: All form functionality works identically to before refactor
