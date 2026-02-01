#!/bin/bash
# Install git hooks for this project

ROOT="$(git rev-parse --show-toplevel)"
HOOKS_DIR="$ROOT/.git/hooks"

echo "Installing git hooks..."

cp "$ROOT/scripts/pre-commit" "$HOOKS_DIR/pre-commit"
chmod +x "$HOOKS_DIR/pre-commit"

echo "Done. Pre-commit hook installed."
