# Refactoring Plan: Modular Code

**Status:** COMPLETED (January 2026)

**Goal:** Split large files into focused modules under 300 lines each, with clear single responsibilities. This makes the codebase easier to understand and modify.

## Results Summary

| File | Before | After |
|------|--------|-------|
| app.js | 1077 lines | 420 lines |
| lightbox.js | 956 lines | 633 lines |
| router.js | - | 112 lines (NEW) |
| media-controls.js | - | 313 lines (NEW) |
| splash.js | - | 112 lines (NEW) |
| view-state.js | - | 255 lines (NEW) |
| lightbox-content.js | - | 282 lines (NEW) |
| media-gallery.js | - | 329 lines (NEW) |

## Phase 1: JavaScript Modularization

### New File Structure

```
docs/js/
├── app.js              # Main entry point, init, global App object (reduced)
├── router.js           # NEW: URL routing, path parsing, legacy URL upgrade
├── media-gallery.js    # NEW: Gallery rendering, column layout, scroll-to-play
├── media-controls.js   # NEW: Shared video/image control handlers
├── view-state.js       # NEW: View toggle, sort prefs, viewed incidents
├── splash.js           # NEW: Splash screen animation
├── lightbox.js         # Core lightbox (reduced)
├── lightbox-content.js # NEW: Incident/about content rendering
├── parser.js           # Keep as-is
└── search.js           # Keep as-is
```

### Module Responsibilities

#### `router.js` (~100 lines)
- `buildUrl(type, slug)` - Build clean path-based URLs
- `parseUrl(url)` - Parse URL into route object
- `upgradeLegacyUrl(route)` - Redirect hash URLs to paths
- Exports: `Router` object

#### `media-gallery.js` (~200 lines)
- `renderMediaGallery()` - Multi-column gallery layout
- `getColumnCount()` - Responsive column calculation
- `sortMediaByOrder()` - Custom media ordering
- `setupScrollToPlay()` - IntersectionObserver for autoplay
- `renderMediaCard()` - Individual card HTML
- Exports: `MediaGallery` object

#### `media-controls.js` (~150 lines)
- `setupVideoControls(video, container, options)` - Unified video control setup
- `setupImageControls(image, container)` - Image fullscreen handling
- `updateFullscreenIcons(enterIcon, exitIcon, isFs)` - Shared icon toggle
- Handles: play/pause, time slider, audio toggle, fullscreen, scroll restore
- Exports: `MediaControls` object

#### `view-state.js` (~150 lines)
- `loadViewedState()` / `saveViewedState()` - LocalStorage for viewed incidents
- `loadSortPreference()` / `saveSortPreference()` - Sort toggle state
- `markAsViewed(incident)` - Mark incident as viewed
- `clearViewed()` - Clear all viewed history
- `initViewToggle()` - View button handlers
- `initSortToggle()` - Sort checkbox handler
- Exports: `ViewState` object

#### `splash.js` (~80 lines)
- `initSplash()` - Splash screen setup
- Animation timing, local storage for 24hr cooldown
- Title click to replay
- Touch swipe handling
- Exports: `Splash` object

#### `lightbox-content.js` (~200 lines)
- `renderIncidentContent(incident)` - Fetch and render incident markdown
- `renderAboutContent()` - Render about.md
- `renderNewUpdatedContent()` - New/updated listing
- `renderIncident(incident, summaryData)` - Full incident HTML
- `renderLocalMedia(summaryData)` - Video/image HTML for lightbox
- `embedVideos(html)` - YouTube embed transformation
- Exports: `LightboxContent` object

#### Reduced `app.js` (~250 lines)
- `App` object definition with config (categoryLabels, sectionHashes)
- `init()` - Orchestrates initialization
- `loadIncidents()` - Fetch incidents-summary.json
- `getFilteredIncidents()` - Search/filter logic
- `render()` / `renderRow()` - List view rendering
- `handleInitialRoute()` / `openFromRoute()` - Route handling (calls Router)
- Imports and coordinates other modules

#### Reduced `lightbox.js` (~250 lines)
- Core lightbox state (element refs, currentSlug, savedScrollPositions)
- `init()` - Setup lightbox listeners
- `open()` / `close()` - Main open/close with history management
- `openAbout()` / `openNewUpdated()` / `open404()`
- `handlePopState()` - Browser back/forward
- `copyShareLink()` - Share button
- Imports `LightboxContent` and `MediaControls`

### Load Order

```html
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<script src="js/parser.js"></script>
<script src="js/router.js"></script>
<script src="js/media-controls.js"></script>
<script src="js/view-state.js"></script>
<script src="js/splash.js"></script>
<script src="js/lightbox-content.js"></script>
<script src="js/lightbox.js"></script>
<script src="js/media-gallery.js"></script>
<script src="js/search.js"></script>
<script src="js/app.js"></script>
```

## Phase 2: CSS Modularization

### New File Structure

```
docs/css/
├── style.css           # Main file that imports all modules
├── base.css            # Variables, reset, body (~50 lines)
├── splash.css          # Splash screen (~190 lines)
├── header.css          # Header, masthead, stats (~120 lines)
├── navigation.css      # Section nav pills (~45 lines)
├── controls.css        # View toggle, search modal, sort (~180 lines)
├── gallery.css         # Media gallery cards (~200 lines)
├── list.css            # Incident table, rows (~170 lines)
├── lightbox.css        # Lightbox modal, content (~360 lines)
├── media-player.css    # Video/image controls (~200 lines)
├── footer.css          # Footer (~45 lines)
├── utilities.css       # Trust badges, tags, icons (~45 lines)
└── responsive.css      # Media queries (~55 lines)
```

### CSS Import Strategy

**Option A: CSS @import (simple)**
```css
/* style.css */
@import url('base.css');
@import url('splash.css');
/* ... etc */
```
*Pros: Simple, no build step. Cons: Multiple HTTP requests.*

**Option B: Keep single file, add section markers (recommended for now)**
Keep current `style.css` but ensure clear section markers for navigation:
```css
/* ========================================
   BASE - Variables, reset, body
   Lines: 1-50
   ======================================== */
```

## Phase 3: Python Script Cleanup (Optional)

`process_media.py` (427 lines) could be split if it grows:

```
scripts/
├── process_media.py       # Main CLI, orchestration (~100 lines)
├── media_processing.py    # Video/image compression (~150 lines)
└── multipart.py           # Multi-part video handling (~150 lines)
```

**Recommendation:** Only split if adding features. Currently manageable.

## Implementation Order

1. **Extract `router.js`** - Low risk, self-contained
2. **Extract `media-controls.js`** - High value, removes duplication
3. **Extract `splash.js`** - Low risk, self-contained
4. **Extract `view-state.js`** - Medium risk, touch multiple areas
5. **Extract `lightbox-content.js`** - Medium risk
6. **Extract `media-gallery.js`** - Medium risk
7. **Refactor `app.js` and `lightbox.js`** - High risk, do last
8. **CSS organization** - Can be done independently

## Testing Checklist

After each extraction:
- [ ] Page loads without JS errors
- [ ] Media gallery renders and plays videos
- [ ] Lightbox opens/closes correctly
- [ ] Browser back/forward works
- [ ] Share links copy correctly
- [ ] Search filters incidents
- [ ] Sort toggle works
- [ ] Viewed state persists
- [ ] Fullscreen works on videos and images
- [ ] Mobile responsive

## Development Notes

When modifying this codebase:

1. **Check file size** - If a file exceeds 300 lines, consider splitting
2. **One responsibility per file** - Each module should do one thing well
3. **Use file headers** - Start each file with a comment explaining its purpose
4. **Avoid circular dependencies** - Use events or callbacks if needed
5. **Keep globals minimal** - Only `App`, `Lightbox`, `Search` need to be global
