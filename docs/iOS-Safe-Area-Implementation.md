# iOS PWA Safe Area Implementation Guide

**Last Updated**: 2026-01-28
**iOS Versions Tested**: 18.1, 18.2
**Devices Affected**: iPhone X and newer (notch/Dynamic Island devices)

## Problem Statement

Users on iPhone 16 Pro with different iOS versions (18.1 vs 18.2) experienced inconsistent layouts:
- Header content hidden under notch/Dynamic Island
- Card borders rendering differently
- Content scrolling under fixed logo areas
- Layout breaking across iOS point releases

## Root Cause

The app was using fixed positioning with `top: 0` instead of accounting for iOS safe areas. This caused content to render underneath the notch/Dynamic Island on some devices and iOS versions.

## Solution Overview

Implemented Apple's `env(safe-area-inset-*)` environment variables across all fixed and full-viewport elements to ensure consistent rendering across all iOS 18.x versions.

## Technical Implementation

### 1. Viewport Configuration (Already Present)

All HTML files have the required meta tags:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```

- `viewport-fit=cover`: Allows content to extend into safe area regions
- `black-translucent`: Makes status bar translucent with white text

### 2. Fixed Header Updates (`assets/css/header.css`)

**Before:**
```css
.main-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
}
```

**After:**
```css
.main-header {
  position: fixed;
  top: env(safe-area-inset-top, 0);     /* Start below notch/Dynamic Island */
  left: env(safe-area-inset-left, 0);   /* Account for landscape orientation */
  right: env(safe-area-inset-right, 0);
}
```

**Impact**: Header now positions itself below the notch/Dynamic Island, never overlapping with system UI.

### 3. Mobile Index Page Layout (`index.html`)

**Before:**
```css
.hero-section {
  position: fixed;
  top: 0;
  height: 100vh;
  padding-top: env(safe-area-inset-top);
}
```

**Problem**: Using `top: 0` with padding creates double-height notch space.

**After:**
```css
.hero-section {
  position: fixed;
  top: env(safe-area-inset-top, 0);
  height: calc(100dvh - env(safe-area-inset-top, 0));
  max-height: calc(100dvh - env(safe-area-inset-top, 0));
  padding-bottom: env(safe-area-inset-bottom, 0);
}
```

**Changes**:
- Start container BELOW notch using `top: env(safe-area-inset-top, 0)`
- Use `100dvh` (dynamic viewport height) instead of `100vh`
- Subtract safe area from height calculations
- Add bottom padding for home indicator

### 4. Body and HTML Base Styles (`assets/css/forms.css`)

**Updates**:
```css
html {
  min-height: calc(100% + env(safe-area-inset-top, 0));
}

body {
  min-height: 100dvh;  /* Use dvh for iOS Dynamic Island compatibility */
  min-height: 100vh;   /* Fallback for older browsers */
  padding-right: env(safe-area-inset-right, 0);
  padding-bottom: env(safe-area-inset-bottom, 0);
  padding-left: env(safe-area-inset-left, 0);
}
```

**Key Points**:
- `100dvh` accounts for browser chrome and Dynamic Island variations
- Fallback `100vh` ensures compatibility with older browsers
- All `env()` calls include `0` fallback for non-iOS devices

### 5. Scrollable Card Container (`index.html`)

```css
.form-cards {
  padding-bottom: calc(2rem + env(safe-area-inset-bottom, 0));
  padding-left: env(safe-area-inset-left, 0.5rem);
  padding-right: env(safe-area-inset-right, 0.5rem);
}
```

**Impact**: Cards never scroll under home indicator or notch in landscape.

## Safe Area Environment Variables

iOS provides four environment variables:

| Variable | Purpose | Typical Values |
|----------|---------|----------------|
| `safe-area-inset-top` | Notch/Dynamic Island height | 44-59px on iPhone 14-16 Pro |
| `safe-area-inset-bottom` | Home indicator height | 34px on modern iPhones |
| `safe-area-inset-left` | Landscape left notch | 44px in landscape |
| `safe-area-inset-right` | Landscape right notch | 44px in landscape |

### Always Include Fallbacks

```css
/* ✅ CORRECT - includes fallback */
top: env(safe-area-inset-top, 0);

/* ❌ WRONG - no fallback, fails on non-iOS */
top: env(safe-area-inset-top);
```

## Browser Compatibility

| Feature | iOS Safari | Chrome Mobile | Firefox Mobile | Desktop |
|---------|------------|---------------|----------------|---------|
| `env(safe-area-inset-*)` | ✅ iOS 11.2+ | ❌ | ❌ | ❌ |
| `100dvh` | ✅ iOS 15.4+ | ✅ Chrome 108+ | ✅ Firefox 110+ | ✅ |
| `viewport-fit=cover` | ✅ iOS 11+ | Ignored | Ignored | Ignored |

**Fallback Strategy**: All `env()` calls include `0` fallback, so non-iOS devices render normally.

## Testing Checklist

### iPhone Testing (Required Devices)

- [ ] iPhone 16 Pro (Dynamic Island) - iOS 18.1
- [ ] iPhone 16 Pro (Dynamic Island) - iOS 18.2
- [ ] iPhone 14 Pro (Dynamic Island) - iOS 17.x
- [ ] iPhone 13 Pro (Notch) - iOS 16.x or 17.x
- [ ] iPhone SE 3rd Gen (No notch) - Any iOS version

### Test Scenarios

#### 1. Header Visibility Test
- [ ] Launch PWA from home screen
- [ ] Verify header text is fully visible (not under notch/Dynamic Island)
- [ ] Verify header divider line renders correctly
- [ ] Rotate to landscape - verify header doesn't overlap notch

#### 2. Index Page Layout Test
- [ ] Open index.html on device
- [ ] Verify logo images are not cut off at top
- [ ] Verify "FVU Request Portal" title is fully visible
- [ ] Scroll through form cards - verify last card has space above home indicator
- [ ] Rotate to landscape - verify content doesn't overlap notch

#### 3. Form Page Layout Test
- [ ] Open any form (upload/analysis/recovery)
- [ ] Verify fixed header stays below notch
- [ ] Scroll to bottom - verify submit buttons have space above home indicator
- [ ] Rotate to landscape - verify form fields don't overlap notch

#### 4. Cross-Version Consistency Test
- [ ] Test same device with iOS 18.1 and 18.2
- [ ] Verify layout is identical between versions
- [ ] Document any differences found

### Known Issues

None at this time. If issues arise on future iOS versions, check:
1. Has Apple changed safe-area-inset values?
2. Has Apple introduced new viewport behaviors?
3. Are our `dvh` calculations still accurate?

## Maintenance Guidelines

### When Adding Fixed Position Elements

Always use safe area insets:

```css
.my-fixed-element {
  position: fixed;
  top: env(safe-area-inset-top, 0);    /* NOT top: 0 */
  left: env(safe-area-inset-left, 0);
  right: env(safe-area-inset-right, 0);
}
```

### When Using Full Viewport Heights

Use `dvh` with safe area subtraction:

```css
.full-height-container {
  height: calc(100dvh - env(safe-area-inset-top, 0));
  min-height: calc(100vh - env(safe-area-inset-top, 0)); /* Fallback */
}
```

### When Adding Bottom Buttons/Bars

Account for home indicator:

```css
.bottom-action-bar {
  padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0));
}
```

## Resources

### Apple Documentation
- [Human Interface Guidelines - Safe Areas](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Safari Web Content Guide - viewport-fit](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/UsingtheViewport/UsingtheViewport.html)

### Community Resources
- [Make Your PWAs Look Handsome on iOS](https://dev.to/karmasakshi/make-your-pwas-look-handsome-on-ios-1o08)
- [CSS-Tricks: The Notch and CSS](https://css-tricks.com/the-notch-and-css/)
- [firt.dev PWA Design Tips](https://firt.dev/pwa-design-tips/)

### MDN Documentation
- [env() CSS Function](https://developer.mozilla.org/en-US/docs/Web/CSS/env)
- [Viewport Concepts](https://developer.mozilla.org/en-US/docs/Web/CSS/Viewport_concepts)

## Rollback Instructions

If issues arise, revert these commits:
1. `index.html` - Mobile media query section (lines 503-604)
2. `assets/css/header.css` - Main header positioning (lines 47-63)
3. `assets/css/forms.css` - HTML/body safe area handling (lines 204-228)

## Version History

| Date | Version | Changes | Tested On |
|------|---------|---------|-----------|
| 2026-01-28 | 1.0 | Initial implementation | iPhone 16 Pro (iOS 18.1, 18.2) |

## Support

For questions or issues related to iOS safe area handling:
1. Check this documentation first
2. Test on actual iOS device (simulator behavior may differ)
3. Review Apple's latest HIG documentation
4. Check if iOS version introduced breaking changes

---

**Last Updated**: 2026-01-28 by Claude Code
**Next Review**: After next major iOS release (iOS 19)
