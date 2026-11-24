#!/bin/sh
# One-command build: picture → events → score/foley → master. Needs the Lemo-Opuscar library (LIB) with its core packages.
set -e
LIB=${LIB:-/root/lemo-opuscar}
HERE=$(cd "$(dirname "$0")" && pwd)
NAME=$(basename "$HERE")
export LIB
cd "$LIB"
node core/render/events.mjs "$HERE"
node core/render/video.mjs "$HERE" --fps 24 --workers 4 --out "$HERE/out/video.mp4"
"$LIB/.venv/bin/python" "$HERE/mix.py"
sh "$HERE/master.sh" "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/$NAME.mp4"
node core/render/still.mjs "$HERE" "${POSTER_T:-30.8}" --out "$HERE/out/poster" >/dev/null && cp "$HERE/out/poster/"*.jpg "$HERE/poster.jpg"
