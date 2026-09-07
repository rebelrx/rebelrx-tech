#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [[ $# -lt 1 ]]; then
  echo 'Usage: ./publish.sh "Describe your changes"'
  exit 1
fi

echo "Building RebelRx Tech..."
npm run build

git add -A

if git diff --cached --quiet; then
  echo "Nothing to publish."
  exit 0
fi

git commit -m "$1"
git push origin main

echo "Published successfully."
