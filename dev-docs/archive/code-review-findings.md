# Code Review Findings

**Date:** January 2026
**Branch:** `feature/code-review-llm-friendly`

## Summary

This review analyzed all source files for:
- Files exceeding the 200-400 line guideline
- Dead or unused code
- Code duplication
- Opportunities for modularization

## File Size Analysis

### JavaScript (Target: 200-300 lines max)

| File | Lines | Status | Action |
|------|-------|--------|--------|
| `app.js` | 1077 | ❌ Too large | Split into 4 modules |
| `lightbox.js` | 956 | ❌ Too large | Split into 3 modules |
| `parser.js` | 109 | ✅ Good | Keep as-is |
| `search.js` | 85 | ✅ Good | Keep as-is |

### CSS (Target: 200-400 lines per file)

| File | Lines | Status | Action |
|------|-------|--------|--------|
| `style.css` | 1912 | ❌ Too large | Split into 8 modules |

### Python Scripts (Target: 200-400 lines)

| File | Lines | Status | Action |
|------|-------|--------|--------|
| `process_media.py` | 427 | ⚠️ Borderline | Consider splitting |
| `generate_summary.py` | 250 | ✅ Good | Keep as-is |
| `audit_last_updated.py` | 105 | ✅ Good | Keep as-is |

## Dead Code Found

### 1. `lightbox.js:939-941` - Empty function
```javascript
reorderSections(html) {
    return html;  // Does nothing
}
```
**Recommendation:** Remove entirely.

### 2. Backwards-compatibility aliases in `app.js`
- Line 8-9: `get aboutHashes() { return this.aboutSections; }` - Alias for `aboutSections`
- Lines 248-251: `handleInitialHash()` - Alias for `handleInitialRoute()`
- Lines 299-302: `openFromHash()` - Alias for `openFromRoute()`

**Recommendation:** Remove if no external code depends on them. If kept for external links, document why.

## Code Duplication

### Video Control Setup (High Priority)

The video player control setup code is duplicated between:
- `app.js:762-884` - `setupVideoCardControls()` for media gallery cards
- `lightbox.js:623-791` - `setupVideoControls()` for lightbox video

**Duplication includes:**
- Play/pause button handling
- Time slider dragging
- Audio toggle
- Fullscreen handling with scroll position restore

**Recommendation:** Extract to a shared `video-controls.js` module.

### Fullscreen Icon Toggle

Similar fullscreen enter/exit icon toggle code appears in:
- `app.js:725-729` (image card)
- `app.js:847-851` (video card)
- `lightbox.js:587-591` (image)
- `lightbox.js:754-758` (video)

**Recommendation:** Create shared `updateFullscreenIcons(enterIcon, exitIcon, isFullscreen)` utility.

## Functional Analysis by File

### app.js - Contains 7 Distinct Responsibilities

1. **URL Routing** (lines 19-101)
   - `buildUrl()`, `parseUrl()`, `upgradeLegacyUrl()`

2. **Search/Filter** (lines 103-146)
   - `stem()`, `getFilteredIncidents()`

3. **View State** (lines 165-388)
   - Sort preferences, viewed incidents tracking

4. **View Toggle & Navigation** (lines 390-460)
   - `initViewToggle()`, `initSectionNav()`, `switchView()`

5. **Media Gallery** (lines 462-617)
   - Column layout, scroll-to-play, media ordering

6. **Media Card Controls** (lines 619-885)
   - Video/image card rendering and controls

7. **Splash Screen** (lines 898-952)
   - Splash animation and timing

### lightbox.js - Contains 5 Distinct Responsibilities

1. **Core Lightbox** (lines 1-60)
   - DOM references, init, popstate handling

2. **Open/Close Operations** (lines 65-570)
   - Opening incidents, about, 404, new-updated views

3. **Content Rendering** (lines 400-505)
   - `renderIncidentContent()`, `renderAboutContent()`

4. **Media Controls** (lines 568-791)
   - Video/image player setup

5. **Media Rendering** (lines 793-955)
   - `renderLocalMedia()`, `renderVideoElement()`, `renderImageElement()`

### style.css - Contains 17 Sections

Already well-organized with section comments. Natural split points:
1. Variables & Reset (lines 1-48)
2. Splash Screen (lines 50-236)
3. Header (lines 238-359)
4. Navigation (lines 361-403)
5. View Toggle (lines 405-458)
6. Search (lines 460-639)
7. Media Gallery (lines 641-834)
8. Main Content (lines 836-912)
9. Incident Table (lines 889-1058)
10. Lightbox (lines 1060-1412)
11. Local Media (lines 1414-1674)
12. Footer (lines 1676-1717)
13. Responsive (lines 1719-1772)
14. New & Updated (lines 1774-1850)
15. Header Links (lines 1852-1912)

## Recommendations Summary

### High Priority
1. Split `app.js` into router, media-gallery, view-state, and splash modules
2. Split `lightbox.js` into core, content, and media modules
3. Extract shared video controls to dedicated module
4. Remove dead `reorderSections()` function

### Medium Priority
1. Split `style.css` into logical modules
2. Decide on backwards-compat aliases (keep with docs or remove)

### Low Priority
1. Consider splitting `process_media.py` (multipart logic separate from processing)

## File Dependencies

Current load order (from index.html):
```html
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<script src="js/parser.js"></script>
<script src="js/search.js"></script>
<script src="js/lightbox.js"></script>
<script src="js/app.js"></script>
```

**Key dependencies:**
- `app.js` depends on: `Lightbox`, `Search`, `IncidentParser`
- `lightbox.js` depends on: `App`, `IncidentParser`, `marked`
- `search.js` depends on: `App`
- `parser.js` is standalone

**Note:** Circular dependency between `app.js` and `lightbox.js` (both reference each other). This is manageable with globals but should be considered in any module refactor.
