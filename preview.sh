#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [[ ! -d node_modules ]]; then
  echo "Installing dependencies..."
  npm ci
fi

echo "Starting RebelRx Tech development server..."
npm run dev
