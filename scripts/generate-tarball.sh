#!/bin/bash
# Generates a tarball of all incident markdown files from docs/incidents/.
# Excludes _no_add directory, underscore-prefixed files, and empty directories.
# Output goes to docs/ for serving.

ROOT="$(git rev-parse --show-toplevel)"
INCIDENTS_DIR="$ROOT/docs/incidents"
OUTPUT="$ROOT/docs/mn-ice-witness-all-incidents.tar.gz"

if [ ! -d "$INCIDENTS_DIR" ]; then
    echo "ERROR: incidents directory not found: $INCIDENTS_DIR"
    exit 1
fi

FILE_LIST=$(find "$INCIDENTS_DIR" \
    -path '*/_no_add' -prune -o \
    -name '*.md' ! -name '_*' -print)

FILE_COUNT=$(echo "$FILE_LIST" | wc -l | tr -d ' ')

tar -czf "$OUTPUT" \
    -C "$ROOT/docs" \
    --files-from <(echo "$FILE_LIST" | sed "s|$ROOT/docs/||")

echo "Generated tarball: $OUTPUT ($FILE_COUNT files)"
