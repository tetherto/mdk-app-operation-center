#!/usr/bin/env sh
# Installs what this repo runs against, all from npm at the versions pinned in
# the package.json files (@tetherto/mdk-* 0.13.0):
#   ./        the mdk CLI and the app runtime (its plugin loader runs the plugin tests)
#   ui-src/   @tetherto/mdk-ui-foundation, -react-adapter, -react-devkit and the build tools
#   dev/      the app, the vendor miner workers and the simulated meter the dev
#             stack runs (dev/package.json), plus the vendor mock adapters from
#             dev/upstream; dev/mock-site/ links the app alone
# The plugin needs no MDK package of its own: the app runtime hands it
# @tetherto/mdk-gateway/plugin (config, the Kernel client, logger) when it loads it.
#
# Set NPM to wrap npm (e.g. NPM="sfw npm") if your environment requires it.
set -eu
# Fail on a missing or wrong credential instead of prompting for one.
export GIT_TERMINAL_PROMPT=0

ROOT=$(cd "$(dirname "$0")/.." && pwd)
NPM=${NPM:-npm}

(cd "$ROOT" && $NPM install --no-audit --no-fund)

# The dev stack's workers (vendor miner workers from GitHub, the simulated
# meter from dev/workers) and the app itself, as dev/package.json names them.
(cd "$ROOT/dev" && $NPM install --no-audit --no-fund --no-package-lock)
# Until the vendor repos ship a mock/server.js of their own (see dev/upstream/README.md).
for pkg in whatsminer-mdk-worker antminer-mdk-worker; do
  cp "$ROOT/dev/upstream/$pkg/mock/server.js" "$ROOT/dev/node_modules/$pkg/mock/server.js"
done
mkdir -p "$ROOT/dev/mock-site/node_modules"
ln -sfn "$ROOT" "$ROOT/dev/mock-site/node_modules/op-centre-lite"

(cd "$ROOT/ui-src" && $NPM install --no-audit --no-fund)
echo "setup: ready. Next: npm run build:ui, then npm run dev:stack"
