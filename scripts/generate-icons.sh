#!/usr/bin/env bash
# Regenerate the site's icon set from the approved ORK wordmark.
#
# One source (client/public/images/ork-logo.png) produces every raster size, so
# the favicon, the apple-touch icon and the web-manifest icons can never drift
# apart from the logo shown in the header.
#
# The wordmark is legible down to ~32px, but a bare 3D mark on transparency is
# not, so each size is composited onto the Professional dark surface (#0A1012)
# with a rounded corner — which is also what iOS needs, since apple-touch-icon
# has no alpha channel.
set -euo pipefail

cd "$(dirname "$0")/../client/public"

BG="#0A1012"
SRC="images/ork-logo.png"
TRIM="$(mktemp -t ork-trim).png"
trap 'rm -f "$TRIM"' EXIT

magick "$SRC" -trim +repage "$TRIM"

# size:logo-width-ratio
emit() {
	local size=$1 ratio=$2 out=$3
	local logo_w
	logo_w=$(python3 -c "print(max(1, round($size * $ratio)))")
	local radius
	radius=$(python3 -c "print(max(1, round($size * 0.22)))")
	magick -size "${size}x${size}" xc:none \
		-fill "$BG" \
		-draw "roundrectangle 0,0,$((size - 1)),$((size - 1)),${radius},${radius}" \
		"$TRIM" -resize "${logo_w}x" -gravity center -composite \
		-strip "$out"
	printf '%-26s %s\n' "$out" "$(du -h "$out" | cut -f1)"
}

# Legacy / browser chrome
emit 64 0.78 favicon.png
emit 32 0.86 favicon-32.png

# iOS home screen (180px, opaque)
emit 180 0.70 apple-touch-icon.png

# Web app manifest
emit 192 0.70 icon-192.png
emit 512 0.70 icon-512.png

# Maskable variant: same artwork pulled further inside the safe zone, because
# Android crops maskable icons to a circle inscribed in the middle 80%.
emit 512 0.52 icon-maskable-512.png