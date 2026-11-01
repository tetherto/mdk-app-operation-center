# Upstream worker additions

Files this dev stack needs in the vendor worker packages, kept here in the layout of their repos until the pull requests carrying them are merged:

- `whatsminer-mdk-worker/mock/server.js` for [whatsminer/whatsminer-mdk-worker](https://github.com/whatsminer/whatsminer-mdk-worker)
- `antminer-mdk-worker/mock/server.js` for [bitmain-official/antminer-mdk-worker](https://github.com/bitmain-official/antminer-mdk-worker)

Each is the `mock/server.js` adapter `mdk run` looks for when a worker's config has `mock: true`: `createServer(opts)` over the simulator the repo already ships, returning `{ server, ready, exit }`. `scripts/setup.sh` copies them into `dev/node_modules/<package>/mock/` after installing the workers. Once a repo ships its own `mock/server.js`, bump the commit in `dev/package.json` and delete the copy here.
