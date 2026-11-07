#!/usr/bin/env bash
# Renders the brand exports (DESIGN-REFERENCE-RESPAWN.md §R12) straight into website/public/.
set -euo pipefail
cd "$(dirname "$0")/.."
PUB=../website/public
mkdir -p "$PUB/assets/brand" out

run() { npx remotion still src/index.ts "$@" --log=error; }

run CoverCorrection out/og-image.png --props='{"format":"og"}' --image-format=png
ffmpeg -y -loglevel error -i out/og-image.png -q:v 2 "$PUB/assets/og-image.jpg"
echo "  assets/og-image.jpg"
run CoverCorrection "$PUB/assets/brand/thumbnail.png" --props='{"format":"thumb"}' --image-format=png
echo "  assets/brand/thumbnail.png"
run Favicon "$PUB/favicon-32.png" --props='{"size":32}' --image-format=png
run Favicon "$PUB/favicon-16.png" --props='{"size":16}' --image-format=png
run Favicon "$PUB/apple-touch-icon.png" --props='{"size":180}' --image-format=png
echo "  favicon-32.png favicon-16.png apple-touch-icon.png"
run RespawnMark "$PUB/assets/brand/respawn-mark.png" --image-format=png
echo "  assets/brand/respawn-mark.png"
echo "done"
