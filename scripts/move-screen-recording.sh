#!/bin/bash
#
# move-screen-recording.sh
#
# Moves the latest Screen Recording from raw_media/ to the correct dated folder,
# renames it to match the incident ID, and cleans up other Screen recordings.
#
# Usage:
#   ./scripts/move-screen-recording.sh --type mov|png INCIDENT_ID
#
# Example:
#   ./scripts/move-screen-recording.sh --type mov 2026-01-24-nur-d-rapper-detained
#
# This will:
#   1. Find the latest "Screen Recording*.mov" in raw_media/
#   2. Create raw_media/2026-01/24/ if needed
#   3. Move and rename to raw_media/2026-01/24/2026-01-24-nur-d-rapper-detained.raw.mov
#   4. Delete all other Screen Recording*.mov files in raw_media/

set -e

# Parse arguments
TYPE=""
INCIDENT_ID=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --type)
            TYPE="$2"
            shift 2
            ;;
        *)
            INCIDENT_ID="$1"
            shift
            ;;
    esac
done

# Validate arguments
if [[ -z "$TYPE" ]]; then
    echo "Error: --type is required (mov or png)"
    echo "Usage: $0 --type mov|png INCIDENT_ID"
    exit 1
fi

if [[ "$TYPE" != "mov" && "$TYPE" != "png" ]]; then
    echo "Error: --type must be 'mov' or 'png'"
    exit 1
fi

if [[ -z "$INCIDENT_ID" ]]; then
    echo "Error: INCIDENT_ID is required"
    echo "Usage: $0 --type mov|png INCIDENT_ID"
    exit 1
fi

# Validate incident ID format (YYYY-MM-DD-name)
if [[ ! "$INCIDENT_ID" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}-.+ ]]; then
    echo "Error: INCIDENT_ID must be in format YYYY-MM-DD-name"
    echo "Example: 2026-01-24-nur-d-rapper-detained"
    exit 1
fi

# Extract date parts from incident ID
YEAR_MONTH="${INCIDENT_ID:0:7}"  # 2026-01
DAY="${INCIDENT_ID:8:2}"         # 24

# Set up paths
RAW_MEDIA_DIR="raw_media"
TARGET_DIR="$RAW_MEDIA_DIR/$YEAR_MONTH/$DAY"
TARGET_FILE="$TARGET_DIR/$INCIDENT_ID.raw.$TYPE"

# Find the latest Screen Recording of the specified type
LATEST_FILE=$(ls -t "$RAW_MEDIA_DIR"/Screen*."$TYPE" 2>/dev/null | head -1)

if [[ -z "$LATEST_FILE" ]]; then
    echo "Error: No Screen Recording.$TYPE files found in $RAW_MEDIA_DIR/"
    exit 1
fi

echo "Found latest file: $LATEST_FILE"

# Create target directory if needed
if [[ ! -d "$TARGET_DIR" ]]; then
    echo "Creating directory: $TARGET_DIR"
    mkdir -p "$TARGET_DIR"
fi

# Move and rename the file
echo "Moving to: $TARGET_FILE"
mv "$LATEST_FILE" "$TARGET_FILE"

# Count remaining Screen files to delete
REMAINING_COUNT=$(ls "$RAW_MEDIA_DIR"/Screen*."$TYPE" 2>/dev/null | wc -l | tr -d ' ')

if [[ "$REMAINING_COUNT" -gt 0 ]]; then
    echo "Deleting $REMAINING_COUNT remaining Screen Recording.$TYPE files..."
    rm "$RAW_MEDIA_DIR"/Screen*."$TYPE"
    echo "Cleanup complete."
else
    echo "No other Screen Recording.$TYPE files to clean up."
fi

echo ""
echo "Done! File moved to: $TARGET_FILE"
echo ""
echo "Next step: Run the media pipeline"
echo "  ./scripts/process-media.sh $INCIDENT_ID"
