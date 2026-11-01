#!/usr/bin/env bash
# encode-bg-video.sh — turn your 280 PNG frames into ONE scroll-scrubbable video.
#
# Run from the project root (the folder containing package.json):
#     bash encode-bg-video.sh
#
# Needs ffmpeg:   brew install ffmpeg
#
# WHY "-g 1": -g is the keyframe interval. A normal web video has a keyframe
# every few seconds, so jumping to an arbitrary time must decode forward from
# the nearest keyframe -> scrubbing stutters. With -g 1 EVERY frame is a
# keyframe, so any seek is instant and exact. The cost is a bigger file, which
# is fine for ~12 seconds of dark footage.

set -euo pipefail

SRC_DIR="${SRC_DIR:-ezgif-2011b9ceb9b186d2-png-split}"   # your original PNG frames
OUT_DIR="${OUT_DIR:-public/assets/bg}"
FPS="${FPS:-24}"          # MUST match `const FPS` in ScrubVideoBackground.jsx
CRF="${CRF:-26}"          # lower = better quality + bigger file (try 23..30)
VERSION="${VERSION:-v1}"  # bump when you re-encode (cache-busting, see vercel.json)

command -v ffmpeg >/dev/null 2>&1 || { echo "ffmpeg not found. Install it with: brew install ffmpeg"; exit 1; }
[ -d "$SRC_DIR" ] || { echo "Frame folder not found: $SRC_DIR"; exit 1; }

mkdir -p "$OUT_DIR"

echo "==> Encoding all-intra H.264 (this takes ~20-60s)..."
ffmpeg -hide_banner -loglevel error -y \
  -framerate "$FPS" -i "$SRC_DIR/ezgif-frame-%03d.png" \
  -c:v libx264 -profile:v high -preset slow -crf "$CRF" \
  -g 1 -keyint_min 1 \
  -pix_fmt yuv420p -movflags +faststart -an \
  "$OUT_DIR/portfolio-scrub.$VERSION.mp4"

echo "==> Making the poster (first frame)..."
if ! ffmpeg -hide_banner -loglevel error -y \
  -i "$SRC_DIR/ezgif-frame-001.png" \
  -c:v libwebp -quality 80 \
  "$OUT_DIR/poster.$VERSION.webp" 2>/dev/null; then
  if command -v cwebp >/dev/null 2>&1; then
    cwebp -q 80 "$SRC_DIR/ezgif-frame-001.png" -o "$OUT_DIR/poster.$VERSION.webp"
  else
    echo "Warning: could not create webp poster. Install cwebp or compile ffmpeg with libwebp."
  fi
fi

echo
echo "Done:"
ls -lh "$OUT_DIR"
echo
echo "Sanity check: the .mp4 should be roughly 4-9 MB. If it's much bigger,"
echo "re-run with a higher CRF:   CRF=29 bash encode-bg-video.sh"
echo "If dark gradients look banded, go the other way:   CRF=23 bash encode-bg-video.sh"
