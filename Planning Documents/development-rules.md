# FVU Forms Project - Development Rules & Guidelines

## The Prime Directive
**Build exactly what's needed - no more, no less.** Every line of code should have a clear purpose. If you can't explain why something exists in one sentence, it shouldn't exist.

## 🚫 Things That Got Us Roasted - Never Again

### 1. **The 2000-Line CSS Monster**
- **Rule**: CSS files max out at 500 lines
- **Rule**: If you're copy-pasting styles, you're doing it wrong
- **Rule**: Use CSS variables for ANY value used more than twice
- **Exception**: Animation keyframes can be in a separate file

### 2. **God Objects**
- **Rule**: No class should do more than ONE thing well
- **Rule**: If a class has more than 200 lines, split it
- **Rule**: If you need "Manager" or "Handler" in the name, be suspicious
- **Good**: `PDFGenerator`, `FormValidator`, `APIClient`
- **Bad**: `FormHandler` (that does everything)

### 3. **Security Disasters**
- **Rule**: NEVER store sensitive data in localStorage
- **Rule**: DVR passwords are NOT sensitive (they're for on-site access)
- **Rule**: Always escape user input before DOM insertion
- **Rule**: Use `textContent`, not `innerHTML` for user data
- **Rule**: Clear forms after successful submission

### 4. **String Concatenation HTML**
```javascript
// 🚫 NEVER DO THIS
return `<div class="${userInput}">${moreUserInput}</div>`;

// ✅ DO THIS
const div = document.createElement('div');
div.className = sanitize(userInput);
div.textContent = moreUserInput;
return div;
```

## 📏 Code Style Rules

### JavaScript
```javascript
// 1. Use const by default, let when needed, never var
const API_ENDPOINT = 'rfs_request_process.php';
let retryCount = 0;

// 2. Async/await over callbacks
// 🚫 BAD
getData((data) => {
  processData(data, (result) => {
    // callback hell
  });
});

// ✅ GOOD
const data = await getData();
const result = await processData(data);

// 3. Early returns for clarity
function validatePhone(phone) {
  if (!phone) return 'Phone is required';
  if (!PHONE_PATTERN.test(phone)) return 'Invalid format';
  return null; // Valid
}

// 4. Destructure for cleaner code
const { name, email, phone } = formData;

// 5. Use optional chaining
const city = formData?.location?.city ?? 'Unknown';
```

### CSS Organization
```css
/* ALWAYS follow this order */

/* 1. Variables */
:root {
  --primary: #0066ff;
  --space-md: 1rem;
}

/* 2. Reset (minimal) */
*, *::before, *::after {
  box-sizing: border-box;
}

/* 3. Base elements */
body { }
h1, h2, h3 { }

/* 4. Components (alphabetical) */
.btn { }
.form-control { }
.toast { }

/* 5. Utilities (prefixed) */
.u-text-center { }
.u-mt-2 { }

/* 6. Animations (grouped) */
@keyframes slide-in { }

/* 7. Media queries (mobile-first) */
@media (min-width: 768px) { }
```

## 🏗️ Architecture Rules

### Separation of Concerns
```
config.js         → Constants only (no logic)
validators.js     → Pure validation functions (no DOM)
calculations.js   → Business logic (no UI)
form-handler.js   → Form lifecycle (no validation logic)
pdf-generator.js  → PDF creation (no form knowledge)
api-client.js     → API calls (no UI updates)
```

### Component Communication
```javascript
// ✅ GOOD: Clear data flow
const formData = collectFormData();
const validation = validateForm(formData);
if (validation.isValid) {
  const response = await submitForm(formData);
  handleResponse(response);
}

// 🚫 BAD: Hidden dependencies
formHandler.submit(); // What data? What happens? Who knows!
```

### File Size Limits
- JavaScript files: 400 lines max
- CSS files: 500 lines max
- If approaching limit, time to split

## 🎯 Validation Rules

### Required Field Validation
```javascript
// Be explicit about what's required
const REQUIRED_FIELDS = {
  'rName': 'Officer name is required',
  'requestingEmail': 'Email is required',
  'requestingPhone': 'Phone number is required'
};

// Non-required fields should NOT have green borders
if (field.required && field.value && isValid) {
  field.classList.add('is-valid');
}
```

### Pattern Validation
```javascript
// Store patterns in ONE place
export const PATTERNS = {
  PHONE: /^\d{3}-\d{3}-\d{4}$/,        // 905-555-1234
  CASE: /^\d{4}-\d{6}$/,               // 2024-123456
  BADGE: /^[A-Z0-9]{4,10}$/,           // AB1234
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // basic@email.com
};
```

## 🚀 Performance Rules

### Async Everything
```javascript
// 🚫 NEVER block the UI
function processLargeData(data) {
  for (let i = 0; i < 1000000; i++) {
    // UI is frozen
  }
}

// ✅ Keep UI responsive
async function processLargeData(data) {
  for (let i = 0; i < data.length; i++) {
    if (i % 1000 === 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    // Process chunk
  }
}
```

### DOM Updates
```javascript
// 🚫 BAD: Multiple reflows
items.forEach(item => {
  container.appendChild(createItem(item));
});

// ✅ GOOD: Single reflow
const fragment = document.createDocumentFragment();
items.forEach(item => {
  fragment.appendChild(createItem(item));
});
container.appendChild(fragment);
```

## ⚠️ Error Handling Rules

### User-Friendly Errors
```javascript
try {
  const result = await submitForm(data);
  showSuccess(`Ticket created: ${result.ticketNumber}`);
} catch (error) {
  // 🚫 BAD
  showError(error.toString());
  
  // ✅ GOOD
  if (error.message.includes('Network')) {
    showError('Connection lost. Please check your internet and try again.');
    saveDraft(data); // Don't lose their work!
  } else if (error.fields) {
    showError(`Please fix these fields: ${error.fields.join(', ')}`);
    highlightErrors(error.fields);
  } else {
    showError('Something went wrong. Your work has been saved.');
    saveDraft(data);
  }
}
```

## 🎨 CSS Specific Rules

### No Magic Numbers (CSS & JavaScript)

#### CSS Magic Numbers
```css
/* 🚫 BAD */
.container {
  width: 1127px; /* Why? */
  margin-top: 23px; /* Random */
}

/* ✅ GOOD */
.container {
  width: var(--container-width); /* Defined in :root */
  margin-top: var(--space-lg);   /* Consistent spacing */
}

/* ✅ ACCEPTABLE */
.modal {
  opacity: 0;        /* 0 = hidden */
  z-index: -1;       /* -1 = behind everything */
  border-radius: 0;  /* 0 = no rounding */
}
```

#### JavaScript Magic Numbers
```javascript
// 🚫 BAD - Unexplained numbers
if (retries > 3) { }           // Why 3?
if (password.length < 8) { }   // Why 8?
await delay(2000);             // Why 2000?

// ✅ GOOD - Use constants
const MAX_RETRIES = 3;
const MIN_PASSWORD_LENGTH = 8;
const SUBMIT_DELAY_MS = 2000;

if (retries > MAX_RETRIES) { }
if (password.length < MIN_PASSWORD_LENGTH) { }
await delay(SUBMIT_DELAY_MS);

// ✅ ACCEPTABLE - Universal meanings
if (array.length === 0) { }        // 0 = empty
if (count === 1) { }               // 1 = single item
if (array.indexOf(item) === -1) {} // -1 = not found
const percentage = (value / total) * 100; // 100 = percentage
const seconds = milliseconds / 1000;      // 1000 = ms to seconds
```

#### The Rule
**"No unexplained numbers"** - If someone would ask "why this number?", it needs a constant. Numbers with universal meanings (0, 1, -1, 100 for percentages, 1000 for ms) are acceptable when their context makes the meaning obvious.

### Animation Performance
```css
/* 🚫 BAD: Animating expensive properties */
@keyframes slide {
  from { left: 0; }
  to { left: 100px; }
}

/* ✅ GOOD: Only animate transform/opacity */
@keyframes slide {
  from { transform: translateX(0); }
  to { transform: translateX(100px); }
}
```

## 📋 Code Review Checklist

Before committing ANY code, check:

- [ ] No function over 50 lines
- [ ] No file over 400 lines (except CSS: 500 max)
- [ ] No duplicated code (DRY)
- [ ] All user input is sanitized
- [ ] Errors have user-friendly messages
- [ ] CSS uses variables for repeated values
- [ ] No magic strings/numbers
- [ ] Clear separation of concerns
- [ ] Async operations don't block UI
- [ ] Forms clear after submission
- [ ] Validation provides helpful feedback

## 🏁 Final Rules

1. **When in doubt, choose boring** - Boring code is maintainable code
2. **Make it work, then make it pretty** - Function before form
3. **Comment WHY, not WHAT** - Code should be self-documenting
4. **Test with real data** - "Smith" is not a real name, "test@test.com" is not a real email
5. **If you copy-paste more than twice, make a function**
6. **If a junior dev can't understand it, rewrite it**

## 🎯 The Goal

Build a tool that:
- Works reliably every time
- Looks professional and impressive
- Can be maintained by anyone
- Makes users' jobs easier
- Doesn't embarrass us in code review

**Remember**: We're building a professional forensic evidence system, not a startup's MVP. It should be solid, secure, and something we're proud to put our names on.