#!/bin/sh
# Launch SiliconPulse 3D as a Chrome app window (no browser chrome).
# This avoids Electron/Chromium sandbox issues in restricted containers while
# still giving a desktop-style window.
set -eu
DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
PORT="${SILICONPULSE_PORT:-$(python3 -c 'import socket; s=socket.socket(); s.bind(("127.0.0.1",0)); print(s.getsockname()[1]); s.close()')}"
cd "$DIR"

python3 -m http.server "$PORT" --directory dist --bind 127.0.0.1 >/tmp/siliconpulse-server.log 2>&1 &
SERVER=$!
cleanup() { kill "$SERVER" 2>/dev/null || true; }
trap cleanup EXIT INT TERM

# Wait for the static server.
i=0
while [ "$i" -lt 40 ]; do
  if curl -s -o /dev/null "http://127.0.0.1:$PORT/"; then break; fi
  i=$((i + 1)); sleep 0.25
done

BROWSER=""
for candidate in google-chrome google-chrome-stable chromium chromium-browser brave-browser microsoft-edge; do
  if command -v "$candidate" >/dev/null 2>&1; then BROWSER="$candidate"; break; fi
done

if [ -z "$BROWSER" ]; then
  echo "No Chromium-based browser found. Open http://127.0.0.1:$PORT/ manually." >&2
  wait "$SERVER"
  exit 1
fi

"$BROWSER" \
  --app="http://127.0.0.1:$PORT/" \
  --user-data-dir="${HOME}/.siliconpulse-chrome" \
  --window-size=1600,1000 \
  --no-first-run \
  --no-sandbox \
  --disable-gpu \
  --no-default-browser-check \
  --disable-features=Translate \
  >/tmp/siliconpulse-browser.log 2>&1 &
wait "$SERVER"
