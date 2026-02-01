# Media Production Workflow

This document describes how to capture, process, and serve media for MN ICE Files.

## Quick Reference

When running the media pipeline or adding new media, run these commands:

```bash
# 1. Process all raw media (compresses video, removes audio, optimizes images)
python3 scripts/process_media.py

# 2. Regenerate the incidents summary JSON (detects new media)
python3 scripts/generate_summary.py

# 3. Commit and push
git add -A && git commit -m "Add new media" && git push
```

## Directory Structure

```
raw_media/                    # Source files (gitignored, local only)
  └── YYYY-MM-DD-slug.raw.mov   # Raw video recordings
  └── YYYY-MM-DD-slug.png       # Raw images

docs/media/                   # Processed files (served to website, tracked in git)
  └── YYYY-MM-DD-slug.mp4       # Compressed, muted video
  └── YYYY-MM-DD-slug.jpg       # Optimized image

docs/data/media-order.md      # Controls gallery display order (edit to reorder)
```

## Naming Convention

Media files MUST match the incident markdown filename (without .md):
- Incident: `docs/incidents/2026-01/2026-01-11-observer-shoved-into-traffic.md`
- Media: `raw_media/2026-01-11-observer-shoved-into-traffic.raw.mov`
- Output: `docs/media/2026-01-11-observer-shoved-into-traffic.mp4`

The `.raw` suffix is optional but recommended for videos to distinguish source files.

## Capturing Screen Video

### macOS Built-in (Cmd + Shift + 5)
1. Press `Cmd + Shift + 5`
2. Click "Record Selected Portion"
3. Drag to select the video area
4. Click Record
5. Play the source video
6. Click Stop when done
7. File saves to Desktop as `.mov`
8. Rename to `YYYY-MM-DD-incident-slug.raw.mov`
9. Move to `raw_media/`

## Processing Media

### Prerequisites
```bash
brew install ffmpeg
```

### Process All Media
```bash
python3 scripts/process_media.py
```

This script:
1. Scans `raw_media/` for video and image files
2. Compares timestamps with `docs/media/`
3. Only processes new or updated files:
   - **Videos**: Strips audio, compresses with H.264 (CRF 28), outputs `.mp4`
   - **Images**: Converts to optimized JPEG, max 1200px width

### Regenerate Summary
After processing, always regenerate the JSON:
```bash
python3 scripts/generate_summary.py
```

This updates `docs/data/incidents-summary.json` with `hasLocalMedia: true` for incidents with media.

## Controlling Gallery Order

Edit `docs/data/media-order.md` to control the order of media in the gallery view:

```markdown
# Media Gallery Order
# List incident slugs in display order (one per line)

aliya-rahman-car-window-hospitalized
observer-shoved-into-traffic
nimco-omar-citizen-check
```

Items listed first appear first. Items not listed appear after, in default order.

## Video Specifications

- **Format**: MP4 (H.264)
- **Audio**: None (stripped)
- **CRF**: 28 (good quality/size balance)
- **Resolution**: Source resolution preserved
- **Typical compression**: 80-90% size reduction

## Image Specifications

- **Format**: JPEG
- **Quality**: High (q:v 3)
- **Max width**: 1200px (auto-scaled)

## Troubleshooting

### Video shows black/corrupted
Delete the output and reprocess:
```bash
rm docs/media/YYYY-MM-DD-slug.mp4
python3 scripts/process_media.py
```

### Media not appearing in gallery
1. Check filename matches incident slug exactly
2. Run `python3 scripts/generate_summary.py`
3. Check `docs/data/incidents-summary.json` for `hasLocalMedia: true`

## Full Pipeline Summary

1. **Capture**: Screen record compelling video (Cmd+Shift+5)
2. **Rename**: `YYYY-MM-DD-incident-slug.raw.mov`
3. **Place**: Move to `raw_media/`
4. **Process**: `python3 scripts/process_media.py`
5. **Regenerate**: `python3 scripts/generate_summary.py`
6. **Order** (optional): Edit `docs/data/media-order.md`
7. **Commit**: `git add -A && git commit -m "Add media" && git push`
8. **Verify**: Check gallery view on live site
