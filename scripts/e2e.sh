#!/usr/bin/env sh
# Boots the dev stack (mdk run --dir dev: Kernel, the mock workers, this app and
# the Gateway), creates the e2e user, runs ui-src/scripts/e2e.ts against it and
# stops the stack. Needs `npm run setup` and `npm run build:ui` first.
#
#   E2E_USER      dev (bound to admin in dev/mdk.yaml)
#   E2E_PASSWORD  any 12+ characters; set for the user on every run
set -eu

ROOT=$(cd "$(dirname "$0")/.." && pwd)
MDK="$ROOT/node_modules/.bin/mdk"
export E2E_USER=${E2E_USER:-dev}
export E2E_PASSWORD=${E2E_PASSWORD:-op-centre-e2e-pass}
export MDK_GATEWAY=${MDK_GATEWAY:-http://localhost:3847}
LOG=${E2E_LOG:-"$ROOT/dev/e2e-stack.log"}

$MDK run --dir "$ROOT/dev" > "$LOG" 2>&1 &
STACK=$!
stop() {
  kill -INT "$STACK" 2>/dev/null || true
  wait "$STACK" 2>/dev/null || true
}
trap stop EXIT INT TERM

echo "e2e: waiting for the Gateway at $MDK_GATEWAY (stack log: $LOG)"
i=0
until curl -s -o /dev/null "$MDK_GATEWAY/auth/login"; do
  i=$((i + 1))
  if [ "$i" -ge 240 ]; then
    echo "e2e: the Gateway did not come up in 240 s"; tail -n 40 "$LOG"; exit 1
  fi
  if ! kill -0 "$STACK" 2>/dev/null; then
    echo "e2e: the stack exited"; tail -n 40 "$LOG"; exit 1
  fi
  sleep 1
done

printf '%s\n' "$E2E_PASSWORD" | $MDK user add "$E2E_USER" --admin --password-stdin --dir "$ROOT/dev" > /dev/null
node "$ROOT/ui-src/scripts/e2e.ts"
