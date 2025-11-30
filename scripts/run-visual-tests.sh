#!/bin/bash

# Kill any hanging Next.js dev servers
echo "Cleaning up old dev servers..."
pkill -9 -f "next dev" 2>/dev/null || true
pkill -9 -f "next-server" 2>/dev/null || true

# Wait a moment for ports to be released
sleep 2

# Run visual tests
echo "Running visual regression tests..."
pnpm exec playwright test test/visual --update-snapshots

echo "Visual tests complete!"
