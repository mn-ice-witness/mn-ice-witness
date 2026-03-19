# Custom OG Images Procedure

How to replace auto-generated OG (Open Graph) images with custom ones for better social media previews.

## Why Custom OG Images

Auto-generated OG images are extracted from video at a specific timestamp (usually 2 seconds in). These may not always be the most compelling frame for social sharing. Custom OG images allow you to select a more impactful frame or use an entirely different image.

## Method 1: Automated (Recommended)

The `process_media.py` script automatically detects custom OG source files using the `.raw_og` naming convention.

### Steps

1. **Download or create your custom OG image** (PNG or JPEG)

2. **Move/rename to raw_media with the `.raw_og` naming pattern:**
   ```bash
   # For an incident in a date folder:
   mv ~/Downloads/screenshot.png raw_media/2026-01/30/2026-01-30-incident-name.raw_og.png

   # Or at raw_media root (also works):
   mv ~/Downloads/screenshot.png raw_media/2026-01-30-incident-name.raw_og.png
   ```

3. **Run process_media.py:**
   ```bash
   python-main scripts/process_media.py
   ```

The script will:
- Find the `.raw_og` file
- Scale it to 1200x630 with letterboxing (black bars if needed)
- Delete any existing OG images for that incident (auto-generated or old custom)
- Create the new OG image: `docs/media/{date}/{slug}-og-custom-{timestamp}.jpg`

### Naming Convention

| Pattern              | Example |
| :--------------------| :-------|
| `{slug}.raw_og.{png\ | jpg\    |

The file can be placed in:
- Date-based folder: `raw_media/2026-01/30/`
- Root level: `raw_media/`

## Method 2: Manual (Alternative)

For cases where you want more control over the output or can't use the automated pipeline.

### Steps

1. **Place your screenshot in raw_media** (any filename works)

2. **Convert to JPG and name correctly:**
   ```bash
   # Copy to temp location (handles special characters in filenames)
   cd raw_media && cp Screenshot*.png /tmp/screenshot.png

   # Convert PNG to JPG with correct naming
   cd /Users/ajcarter/workspace/GIT_MN_ICE_FILES
   sips -s format jpeg /tmp/screenshot.png --out docs/media/2026-01/07/2026-01-07-incident-name-og-custom.jpg
   ```

3. **Remove auto-generated OG image:**
   ```bash
   rm docs/media/2026-01/07/2026-01-07-incident-name-og-2s-*.jpg
   ```

4. **Clean up source file:**
   ```bash
   rm raw_media/Screenshot*.png
   ```

## How It Works

The `scripts/generate_summary.py` script looks for OG images using the glob pattern:

```python
pattern = f"{slug}-og-*.jpg"
```

This matches any file like:
- `2026-01-07-incident-name-og-custom.jpg` - Manual custom
- `2026-01-07-incident-name-og-custom-1769890628.jpg` - Automated custom
- `2026-01-07-incident-name-og-2s-1769196137.jpg` - Auto-generated from video

As long as only one OG image exists per incident, the system will use it.

## Quick Reference

### Automated Workflow
| Step | Action                                                      |
| :----| :-----------------------------------------------------------|
| 1    | Move image to `raw_media/{date-folder}/{slug}.raw_og.{ext}` |
| 2    | Run `python-main scripts/process_media.py`                  |

### Manual Workflow
| Step | Command                                                                                |
| :----| :--------------------------------------------------------------------------------------|
| 1    | `cd raw_media && cp Screenshot*.png /tmp/screenshot.png`                               |
| 2    | `sips -s format jpeg /tmp/screenshot.png --out docs/media/{date}/{slug}-og-custom.jpg` |
| 3    | `rm docs/media/{date}/{slug}-og-2s-*.jpg`                                              |
| 4    | `rm raw_media/Screenshot*.png`                                                         |
