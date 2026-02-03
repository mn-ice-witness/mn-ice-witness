#!/usr/bin/env python3
"""
Generate category-based incident summary JSON files and search index from markdown files.
This creates a single JSON file with all metadata needed for table rendering,
eliminating the need to fetch individual markdown files on page load.
"""

from __future__ import annotations

import json
import re
import subprocess
import time
from pathlib import Path


# Media extensions for detecting local media
VIDEO_EXTENSIONS = {".mp4", ".webm"}
IMAGE_EXTENSIONS = {".webp", ".jpg", ".jpeg", ".png"}

# Pattern to extract date from filename: YYYY-MM-DD-rest
DATE_PATTERN = re.compile(r"^(\d{4})-(\d{2})-(\d{2})-")


def get_date_folder(slug: str) -> str | None:
    """Extract YYYY-MM/DD folder path from slug."""
    match = DATE_PATTERN.match(slug)
    if match:
        year, month, day = match.groups()
        return f"{year}-{month}/{day}"
    return None


def get_media_aspect_ratio(file_path: Path):
    """Get aspect ratio (width/height) of a media file using ffprobe."""
    try:
        result = subprocess.run(
            [
                "ffprobe",
                "-v",
                "error",
                "-select_streams",
                "v:0",
                "-show_entries",
                "stream=width,height",
                "-of",
                "csv=p=0",
                str(file_path),
            ],
            capture_output=True,
            text=True,
            timeout=5,
        )
        if result.returncode == 0 and result.stdout.strip():
            parts = result.stdout.strip().split(",")
            if len(parts) >= 2:
                width, height = int(parts[0]), int(parts[1])
                if height > 0:
                    return width / height
    except (subprocess.TimeoutExpired, FileNotFoundError, ValueError):
        pass
    return None


def find_og_image(slug: str, media_dir: Path):
    """Find OG image for a video using pattern (e.g., slug-og-2s-1234567890.jpg)."""
    date_folder = get_date_folder(slug)
    pattern = f"{slug}-og-*.jpg"

    # Check date-based folder first
    if date_folder:
        folder_path = media_dir / date_folder
        if folder_path.exists():
            matches = list(folder_path.glob(pattern))
            if matches:
                matches.sort(key=lambda p: p.stat().st_mtime, reverse=True)
                return f"media/{date_folder}/{matches[0].name}"

    # Fall back to flat structure
    matches = list(media_dir.glob(pattern))
    if matches:
        matches.sort(key=lambda p: p.stat().st_mtime, reverse=True)
        return f"media/{matches[0].name}"
    return None


def get_local_media(slug: str, media_dir: Path) -> dict:
    """Check for local media files matching the incident slug."""
    result = {
        "hasLocalMedia": False,
        "localMediaType": None,
        "localMediaPath": None,
        "localMediaOgPath": None,
        "localMediaFiles": [],
        "aspectRatio": None,
        "mediaVersion": None,
    }

    if not media_dir.exists():
        return result

    # Determine the search directory and path prefix
    date_folder = get_date_folder(slug)
    if date_folder:
        folder_path = media_dir / date_folder
        if folder_path.exists():
            search_dir = folder_path
            path_prefix = f"media/{date_folder}"
        else:
            # Fall back to flat structure
            search_dir = media_dir
            path_prefix = "media"
    else:
        search_dir = media_dir
        path_prefix = "media"

    media_files = []

    # Collect all matching video files
    for ext in VIDEO_EXTENSIONS:
        media_path = search_dir / f"{slug}{ext}"
        if media_path.exists():
            media_files.append(
                {
                    "type": "video",
                    "path": f"{path_prefix}/{slug}{ext}",
                    "file": media_path,
                }
            )

    # Collect all matching image files
    for ext in IMAGE_EXTENSIONS:
        media_path = search_dir / f"{slug}{ext}"
        if media_path.exists():
            media_files.append(
                {
                    "type": "image",
                    "path": f"{path_prefix}/{slug}{ext}",
                    "file": media_path,
                }
            )

    if media_files:
        result["hasLocalMedia"] = True
        result["localMediaFiles"] = [
            {"type": m["type"], "path": m["path"]} for m in media_files
        ]
        # Primary media (video preferred) for backwards compatibility
        primary = next((m for m in media_files if m["type"] == "video"), media_files[0])
        result["localMediaType"] = primary["type"]
        result["localMediaPath"] = primary["path"]
        # Get aspect ratio for primary media
        result["aspectRatio"] = get_media_aspect_ratio(primary["file"])
        # Per-video cache version based on file mtime
        result["mediaVersion"] = int(primary["file"].stat().st_mtime)
        # Find OG image for videos (timestamp-based naming: slug-og-2s.jpg)
        if primary["type"] == "video":
            result["localMediaOgPath"] = find_og_image(slug, media_dir)

    return result


def parse_frontmatter(content):
    match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
    if not match:
        return {}, content

    frontmatter_text = match.group(1)
    body = content[match.end() :].strip()

    meta = {}
    for line in frontmatter_text.split("\n"):
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        meta[key.strip()] = value.strip()

    return meta, body


def extract_title(body):
    match = re.search(r"^# (.+)$", body, re.MULTILINE)
    return match.group(1).strip() if match else "Untitled Incident"


def extract_summary(body):
    match = re.search(r"## Summary\n+([\s\S]*?)(?=\n## |$)", body)
    if match:
        return match.group(1).strip().split("\n")[0]
    return ""


def extract_latest_update(body):
    """Extract the most recent update text from ## Updates section."""
    match = re.search(r"## Updates\n+- \*\*[^*]+\*\* - (.+?)(?:\n|$)", body)
    if match:
        return match.group(1).strip()
    return None


def parse_type(type_value):
    if "," in type_value:
        return [t.strip() for t in type_value.split(",")]
    return type_value


def count_media(content):
    videos = len(re.findall(r"\*\*Video:\*\*", content, re.IGNORECASE))
    photos = len(re.findall(r"\*\*Photo:\*\*", content, re.IGNORECASE))
    analysis = len(re.findall(r"\*\*Analysis:\*\*", content, re.IGNORECASE))
    return videos + photos + analysis


REQUIRED_FIELDS = [
    "date",
    "type",
    "status",
    "trustworthiness",
    "created",
    "last_updated",
]

# Date validation patterns
DATE_ONLY_PATTERN = re.compile(r"^\d{4}-\d{2}-\d{2}$")  # YYYY-MM-DD
DATETIME_PATTERN = re.compile(
    r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$"
)  # YYYY-MM-DDTHH:MM:SS

VALID_STATUS = {"ongoing", "resolved", "under-investigation"}
VALID_INJURIES = {"none", "minor", "serious", "fatal"}
VALID_TRUSTWORTHINESS = {"high", "medium", "low", "no-news-media", "removed"}
VALID_TYPES = {"citizens", "observers", "immigrants", "schools-hospitals", "response"}
VALID_CITIZENSHIP = {
    "us-citizen",
    "legal-resident",
    "asylum-seeker",
    "undocumented",
    "unknown",
    "n/a",
    "various",
}


def validate_frontmatter(meta, file_path):
    errors = []

    missing = [field for field in REQUIRED_FIELDS if not meta.get(field)]
    if missing:
        errors.append(f"missing required fields: {', '.join(missing)}")

    # Validate date field (YYYY-MM-DD only, NO text like "early", "mid", "late")
    date_value = meta.get("date", "").strip()
    if date_value and not DATE_ONLY_PATTERN.match(date_value):
        errors.append(
            f"invalid date '{date_value}' (must be YYYY-MM-DD format, e.g., 2026-01-15). "
            f"NO text like 'early', 'mid', 'late' - these BREAK the GitHub Pages build!"
        )

    # Validate created field (YYYY-MM-DDTHH:MM:SS)
    created_value = meta.get("created", "").strip()
    if created_value and not DATETIME_PATTERN.match(created_value):
        errors.append(
            f"invalid created '{created_value}' (must be YYYY-MM-DDTHH:MM:SS format, e.g., 2026-01-15T14:30:00)"
        )

    # Validate last_updated field (YYYY-MM-DDTHH:MM:SS)
    updated_value = meta.get("last_updated", "").strip()
    if updated_value and not DATETIME_PATTERN.match(updated_value):
        errors.append(
            f"invalid last_updated '{updated_value}' (must be YYYY-MM-DDTHH:MM:SS format, e.g., 2026-01-15T14:30:00)"
        )

    status = meta.get("status", "").strip().lower()
    if status and status not in VALID_STATUS:
        errors.append(
            f"invalid status '{status}' (must be: {', '.join(sorted(VALID_STATUS))})"
        )

    injuries = meta.get("injuries", "").strip().lower()
    if injuries and injuries not in VALID_INJURIES:
        errors.append(
            f"invalid injuries '{injuries}' (must be: {', '.join(sorted(VALID_INJURIES))})"
        )

    trust = meta.get("trustworthiness", "").strip().lower()
    if trust and trust not in VALID_TRUSTWORTHINESS:
        errors.append(
            f"invalid trustworthiness '{trust}' (must be: {', '.join(sorted(VALID_TRUSTWORTHINESS))})"
        )

    type_value = meta.get("type", "").strip().lower()
    if type_value:
        types = [t.strip() for t in type_value.split(",")]
        for t in types:
            if t not in VALID_TYPES:
                errors.append(
                    f"invalid type '{t}' (must be: {', '.join(sorted(VALID_TYPES))})"
                )

    citizenship = meta.get("affected_individual_citizenship", "").strip().lower()
    if citizenship and citizenship not in VALID_CITIZENSHIP:
        errors.append(
            f"invalid citizenship '{citizenship}' (must be: {', '.join(sorted(VALID_CITIZENSHIP))})"
        )

    if errors:
        raise ValueError(f"{file_path.name}: " + "; ".join(errors))


def process_incident(file_path, docs_dir, media_dir):
    content = file_path.read_text()
    meta, body = parse_frontmatter(content)

    validate_frontmatter(meta, file_path)

    relative_path = str(file_path.relative_to(docs_dir))

    # Extract slug from filename (without .md)
    slug = file_path.stem

    notable_value = meta.get("notable", "false").lower()
    is_notable = notable_value in ("true", "yes", "1")

    # Check for local media
    local_media = get_local_media(slug, media_dir)

    return {
        "filePath": relative_path,
        "title": extract_title(body),
        "summary": extract_summary(body),
        "latestUpdate": extract_latest_update(body),
        "date": meta.get("date", "Unknown"),
        "time": meta.get("time", "unknown"),
        "location": meta.get("location", "Unknown location"),
        "city": meta.get("city", "Minneapolis"),
        "type": parse_type(meta.get("type", "unknown")),
        "status": meta.get("status", "unknown"),
        "affectedIndividualCitizenship": meta.get(
            "affected_individual_citizenship", "unknown"
        ),
        "injuries": meta.get("injuries", "unknown"),
        "trustworthiness": meta.get("trustworthiness", "no-news-media"),
        "created": meta["created"],
        "lastUpdated": meta["last_updated"],
        "mediaCount": count_media(content),
        "notable": is_notable,
        "hasLocalMedia": local_media["hasLocalMedia"],
        "localMediaType": local_media["localMediaType"],
        "localMediaPath": local_media["localMediaPath"],
        "localMediaOgPath": local_media["localMediaOgPath"],
        "localMediaFiles": local_media["localMediaFiles"],
        "aspectRatio": local_media["aspectRatio"],
        "mediaVersion": local_media["mediaVersion"],
    }


def extract_slug_from_filename(filename):
    """Extract slug from filename, removing date prefix (YYYY-MM-DD-)."""
    stem = Path(filename).stem
    # Remove date prefix if present (e.g., 2026-01-11-speedway-st-paul -> speedway-st-paul)
    if re.match(r"^\d{4}-\d{2}-\d{2}-", stem):
        return stem[11:]
    return stem


def update_media_order(incidents_with_media, data_dir):
    """Update media-order.md with any new media items."""
    order_file = data_dir / "media-order.md"

    existing_slugs = []
    header_lines = []

    if order_file.exists():
        lines = order_file.read_text().strip().split("\n")
        for line in lines:
            stripped = line.strip()
            if stripped.startswith("#") or not stripped:
                header_lines.append(line)
            else:
                existing_slugs.append(stripped)

    media_slugs = set()
    for incident in incidents_with_media:
        slug = extract_slug_from_filename(incident["filePath"])
        media_slugs.add(slug)

    new_slugs = [s for s in media_slugs if s not in existing_slugs]
    new_slugs.sort()

    if new_slugs:
        all_slugs = existing_slugs + new_slugs
        content = "\n".join(header_lines) + "\n\n" + "\n".join(all_slugs) + "\n"
        order_file.write_text(content)


CATEGORIES = ["citizens", "immigrants", "observers", "schools-hospitals", "response"]


def get_incident_categories(incident):
    """Return list of categories this incident belongs to."""
    incident_type = incident["type"]
    if isinstance(incident_type, list):
        return incident_type
    return [incident_type]


def generate_category_files(incidents, data_dir):
    """Generate separate JSON files for each category."""
    category_incidents = {cat: [] for cat in CATEGORIES}

    for incident in incidents:
        for cat in get_incident_categories(incident):
            if cat in category_incidents:
                category_incidents[cat].append(incident)

    counts = []
    for cat in CATEGORIES:
        output_file = data_dir / f"incidents-summary-{cat}.json"
        output_data = {"incidents": category_incidents[cat]}
        output_file.write_text(json.dumps(output_data, indent=2))
        counts.append(f"{cat}={len(category_incidents[cat])}")

    return ", ".join(counts)


def parse_not_use_entries(project_root):
    """Parse not_use.md to extract rejected story entries."""
    not_use_file = project_root / "dev-docs" / "not_use.md"
    if not not_use_file.exists():
        return []

    content = not_use_file.read_text()
    entries = []

    # Pattern to match story headers like **Story Name (Date)**
    # Look for lines starting with ** that have a date in parentheses
    pattern = re.compile(
        r"^\*\*([^*]+?)(?:\s*\(([^)]+)\))?\*\*\s*$", re.MULTILINE
    )

    for match in pattern.finditer(content):
        title = match.group(1).strip()
        date_info = match.group(2).strip() if match.group(2) else ""

        # Extract date if it looks like a date (Jan XX, Month YYYY, etc.)
        date = "n/a"
        if date_info:
            # Try to extract just month/day from formats like "Jan 30" or "January 30, 2026"
            date_match = re.search(r"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d+", date_info, re.IGNORECASE)
            if date_match:
                date = date_info

        entries.append({
            "title": title,
            "date": date,
            "file": "dev-docs/not_use.md",
        })

    return entries


def generate_search_index(incidents, data_dir, project_root):
    """Generate search-index.md for LLM consumption with all 4 categories."""

    # Separate incidents by status
    current = []
    no_news_media = []
    removed = []

    for incident in incidents:
        trust = incident.get("trustworthiness", "").lower()
        if trust == "no-news-media":
            no_news_media.append(incident)
        elif trust == "removed":
            removed.append(incident)
        else:
            current.append(incident)

    # Parse not_use.md for no-add entries
    no_add = parse_not_use_entries(project_root)

    lines = [
        "# Incident Search Index",
        "",
        "**Auto-generated file** - Do not edit directly. Regenerated by `scripts/generate_summary.py` via pre-commit hook.",
        "",
        "## How to Use This File",
        "",
        "When searching for incidents or checking if something already exists:",
        "",
        "1. **Search CURRENT first** - These are published incidents on the main site",
        "2. **Check NO-ADD** - These were evaluated and rejected (see reason in not_use.md)",
        "3. **Check REMOVED** - These were published but later retracted due to new information",
        "4. **Check NO-NEWS-MEDIA** - These lack news coverage, shown only at /no-news-media",
        "",
        "**Format:** `path | date | city | category | title`",
        "",
        "---",
        "",
    ]

    # Section 1: Current incidents
    lines.append(f"## CURRENT ({len(current)} incidents)")
    lines.append("")
    lines.append("Published incidents visible on the main site.")
    lines.append("")

    for incident in current:
        path = incident["filePath"]
        date = incident["date"]
        city = incident["city"]
        title = incident["title"]
        cat = (
            incident["type"]
            if isinstance(incident["type"], str)
            else ", ".join(incident["type"])
        )
        lines.append(f"- {path} | {date} | {city} | {cat} | {title}")

    lines.append("")
    lines.append("---")
    lines.append("")

    # Section 2: No-Add entries
    lines.append(f"## NO-ADD ({len(no_add)} entries)")
    lines.append("")
    lines.append("Stories evaluated and rejected. See `dev-docs/not_use.md` for rejection reasons.")
    lines.append("")

    for entry in no_add:
        lines.append(f"- {entry['file']} | {entry['date']} | {entry['title']}")

    lines.append("")
    lines.append("---")
    lines.append("")

    # Section 3: Removed incidents
    lines.append(f"## REMOVED ({len(removed)} incidents)")
    lines.append("")
    lines.append("Previously published but retracted due to contradicting information. See incident file for correction notes.")
    lines.append("")

    for incident in removed:
        path = incident["filePath"]
        date = incident["date"]
        city = incident["city"]
        title = incident["title"]
        cat = (
            incident["type"]
            if isinstance(incident["type"], str)
            else ", ".join(incident["type"])
        )
        lines.append(f"- {path} | {date} | {city} | {cat} | {title}")

    lines.append("")
    lines.append("---")
    lines.append("")

    # Section 4: No-News-Media incidents
    lines.append(f"## NO-NEWS-MEDIA ({len(no_news_media)} incidents)")
    lines.append("")
    lines.append("Incidents without news media verification. Visible only at /no-news-media.")
    lines.append("")

    for incident in no_news_media:
        path = incident["filePath"]
        date = incident["date"]
        city = incident["city"]
        title = incident["title"]
        cat = (
            incident["type"]
            if isinstance(incident["type"], str)
            else ", ".join(incident["type"])
        )
        lines.append(f"- {path} | {date} | {city} | {cat} | {title}")

    output_file = data_dir / "search-index.md"
    output_file.write_text("\n".join(lines) + "\n")

    return {
        "current": len(current),
        "no_add": len(no_add),
        "removed": len(removed),
        "no_news_media": len(no_news_media),
    }


def main():
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    docs_dir = project_root / "docs"
    incidents_dir = docs_dir / "incidents"
    media_dir = docs_dir / "media"
    data_dir = docs_dir / "data"

    data_dir.mkdir(parents=True, exist_ok=True)

    incidents = []
    for md_file in incidents_dir.rglob("*.md"):
        if md_file.name.startswith("_"):
            continue
        incident = process_incident(md_file, docs_dir, media_dir)
        incidents.append(incident)

    incidents.sort(key=lambda x: x["date"], reverse=True)

    incidents_with_media = [i for i in incidents if i["hasLocalMedia"]]
    media_count = len(incidents_with_media)

    verified_with_media = [
        i
        for i in incidents_with_media
        if i["trustworthiness"] not in ("no-news-media", "removed")
    ]
    update_media_order(verified_with_media, data_dir)

    category_counts = generate_category_files(incidents, data_dir)
    search_counts = generate_search_index(incidents, data_dir, project_root)

    print(f"Generated {len(incidents)} incidents ({media_count} with media)")
    print(f"  Category files: {category_counts}")
    print(f"  Search index: {search_counts['current']} current, {search_counts['no_add']} no-add, {search_counts['removed']} removed, {search_counts['no_news_media']} no-news-media")


if __name__ == "__main__":
    main()
