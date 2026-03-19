#!/bin/bash
# Generates a tarball of all incident markdown files from docs/incidents/.
# Excludes the _no_add directory. Output goes to docs/ for serving.

ROOT="$(git rev-parse --show-toplevel)"
INCIDENTS_DIR="$ROOT/docs/incidents"
OUTPUT="$ROOT/docs/mn-ice-witness-all-incidents.tar.gz"

if [ ! -d "$INCIDENTS_DIR" ]; then
    echo "ERROR: incidents directory not found: $INCIDENTS_DIR"
    exit 1
fi

tar -czf "$OUTPUT" \
    --exclude='_no_add' \
    -C "$ROOT/docs" \
    incidents/

echo "Generated tarball: $OUTPUT"
