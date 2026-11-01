# mdk-app-operation-center

Single-site operations for MDK: a dashboard view of the site, efficiency per power meter, an explorer for racks and miners, container detail (layout, power adjustment, charts, heatmap), and power commands.

It is an MDK app: one package with a Gateway plugin and a dashboard UI. A dashboard installs it with:

```bash
mdk add app github:<owner>/<repo>#<tag>
```

The pages then appear under the app's sidebar group, at `/app/<name>/`, and a summary panel appears on the dashboard's Home.

## Quick start

Everything below runs on one machine with mock devices: no hardware, no hosted Kernel. A few minutes the first time, for the installs.

**You need:** Node 24 or later and git. The MDK packages (`@tetherto/mdk-*` 0.13.0) come from npm.

1. **Clone and install.** `npm run setup` installs the MDK CLI, the UI packages and the dev stack:

   ```bash
   git clone git@github.com:tetherto/mdk-app-operation-center.git
   cd mdk-app-operation-center
   npm run setup
   ```

   Set `NPM="sfw npm"` (or any wrapper) if your environment requires one. Setup also installs the vendor miner workers the dev stack runs, from GitHub.

2. **Build the UI** (the dashboard serves the committed bundle):

   ```bash
   npm run build:ui
   ```

3. **Start the stack.** One terminal, kept open:

   ```bash
   npm run dev:stack
   ```

   This boots the Kernel, 4 miner workers and a meter worker on 76 mock devices, this app and the Gateway on `:3847`. Wait for `gateway listening`. The first boot is the slowest; `npm run mdk -- status --dir dev` shows every worker and device.

4. **Create a user.** The Kernel refuses every call until `spec.rbac` in `dev/mdk.yaml` binds someone (it already binds a user named `dev` to `admin`), and the Gateway asks every app route for a signed-in user. In a second terminal:

   ```bash
   npm run mdk -- user add dev --admin --dir dev     # prompts for a password, 12 characters or more
   ```

5. **Call the API.** Import `postman/op-centre-lite.postman_collection.json` into Postman, set the `password` variable, run **0. Sign in / Login** once, then any request. Or with curl:

   ```bash
   TOKEN=$(curl -s -X POST localhost:3847/auth/login -H 'content-type: application/json' \
     -d '{"username":"dev","password":"<password>"}' | jq -r .accessToken)
   curl -H "authorization: Bearer $TOKEN" localhost:3847/apps/op-centre-lite/api/site/summary
   ```

6. **Open the dashboard.** Once:

   ```bash
   npm run mdk -- create dashboard --dir dev
   ```

   then, in a third terminal, `npm run dev:dashboard`, open the URL it prints (`http://127.0.0.1:3030`, or the next free port) and sign in as `dev`. The app's pages are under its sidebar group. After a UI change, `npm run dev:ui` rebuilds the bundle on save; reload the browser.

7. **Check everything** before a commit: `npm run check`, and `npm run e2e` with the stack stopped (it boots its own).

Something off? See [Troubleshooting](#troubleshooting).

## Layout

```
mdk-app.yaml          app manifest: id, version, permissions, config defaults
package.json          the app package (ships mdk-app.yaml, plugin/, ui/, README.md)
plugin/
  mdk-plugin.json     route table, generated from ui-src/api/route-table.ts
  controllers/        one handler per route: async (req) => body
  lib/                site source (mock or workers), mock site, errors, the app's Kernel client
ui-src/               UI source, built to ui/
  api/                contract (zod), route table, routes, requests
  features/<feature>/ hook + components + page, per feature
  components/         shared page frame
  index.tsx           the app's UI module: pages and panels
ui/                   built UI, committed (GitHub installs run no build)
postman/              Postman collection: every route, with a login that stores the token
dev/mdk.yaml          local stack: Kernel, vendor miner workers and a simulated
                      meter on mock devices, this app and the Gateway
dev/workers/          powermeter-sim, the simulated meter Worker Plugin
dev/upstream/         mock/server.js adapters for the vendor workers, until merged there
dev/mock-site/        the app alone on its in-memory site, for UI work
scripts/setup.sh      installs the root, ui-src/ and dev/ dependencies
```

## Building on it

Each page is a feature folder: a pure `*-shape.ts` that turns contract data into display values (unit-tested, no React), a `use-*.ts` hook that fetches and shapes, and components that only render. To reuse a piece, copy its folder and the `lib/` helpers it imports; the shapes and hooks only need the contract types and `useMdkApp().apiUrl`.

| Piece                                                                     | Where                                                                                                                                | Built on                                                                                            |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Route contract (every request and response, zod)                          | [`api/contract.ts`](ui-src/api/contract.ts), [`api/route-table.ts`](ui-src/api/route-table.ts)                                       | zod; the route table generates `plugin/mdk-plugin.json`                                             |
| Typed requests and query keys                                             | [`api/request.ts`](ui-src/api/request.ts), [`api/query-keys.ts`](ui-src/api/query-keys.ts)                                           | `mdkFetch`, react-query (`useQuery`, `useMutation`)                                                 |
| Page frame with site stats strip and hosted demo banner                   | [`components/page.tsx`](ui-src/components/page.tsx), [`components/hosted-demo-banner.tsx`](ui-src/components/hosted-demo-banner.tsx) | `HeaderMinersBox` and siblings, `CoreAlert`                                                         |
| Container cards (totals, rack table, status tiles)                        | [`features/site-overview/`](ui-src/features/site-overview/)                                                                          | `Card`, `DataTable`, `MinersActivityChart`                                                          |
| Power mode and power % controls: confirm, send, result toast, refetch     | [`features/commands/`](ui-src/features/commands/)                                                                                    | `Select`, `AlertDialog`, `useNotification`; take any `CommandTarget` (a container or miner ids)     |
| Racks and miners tables with search, filter, paging and CSV export        | [`features/explorer/`](ui-src/features/explorer/), [`lib/csv.ts`](ui-src/lib/csv.ts)                                                 | `DataTable`, `Pagination`, `Input`, `Select`; server paging for miners                              |
| Socket grid of a container's racks, with legend, zoom and miner panel     | [`features/container-detail/`](ui-src/features/container-detail/)                                                                    | primitives only (the devkit `Socket` was removed in 0.12); `SocketGrid` takes racks and a selection |
| History charts (hash rate against nominal, power) with an interval toggle | [`features/history/`](ui-src/features/history/), [`lib/use-line-chart-data.ts`](ui-src/lib/use-line-chart-data.ts)                   | `LineChartCard`; `use-line-chart-data` works around a devkit chart that mounts empty                |
| Site and mining efficiency, per-meter cards, consumption breakdown        | [`features/site-efficiency/`](ui-src/features/site-efficiency/)                                                                      | `Card`, `DataTable`, `EmptyState`                                                                   |
| Units and formatting (TH/s, PH/s, W, kW, MW, W/TH, %, °C)                 | [`lib/units.ts`](ui-src/lib/units.ts)                                                                                                | one place for every unit and decimal count                                                          |

The plugin side follows the same split: [`plugin/lib/aggregate.js`](plugin/lib/aggregate.js) shapes the fleet snapshot per route, [`plugin/lib/topology.js`](plugin/lib/topology.js) reads the layout config, and [`plugin/lib/commands.js`](plugin/lib/commands.js) sends commands as the signed-in operator. See [How the worker site is served](#how-the-worker-site-is-served).

For MDK itself (Workers, the Kernel, the Gateway, the devkit), start from the MDK docs and its Agent Skills (`mdk`, `mdk-gateway-plugin`, `mdk-ui-component`).

## Setup

Node 24 or later. The [Quick start](#quick-start) above is the short version; this is what `npm run setup` does.

`scripts/setup.sh` installs everything from npm, with every `@tetherto/mdk-*` package pinned to `0.13.0`:

- the root: `@tetherto/mdk-cli` (the `mdk` command behind `npm run mdk`) and `@tetherto/mdk-app-runtime` (its plugin loader runs the plugin tests);
- `ui-src/`: `@tetherto/mdk-ui-foundation`, `-react-adapter` and `-react-devkit`, plus the build and test tools;
- `dev/`: the app, the vendor miner workers and the simulated meter, with the vendor mock adapters copied in from `dev/upstream/`.

The plugin installs no MDK package: the app runtime hands it `@tetherto/mdk-gateway/plugin` (its config, Kernel client and logger) when it loads it. To move to another MDK release, bump the `@tetherto/mdk-*` versions in `package.json` and `ui-src/package.json` together, along with `version` in `mdk-app.yaml`, and run `npm run setup`.

Set `NPM="sfw npm"` (or any wrapper) if your environment requires one.

## Develop

Three terminals:

```bash
npm run dev:stack       # mdk run: Kernel, mock workers, this app and the Gateway (:3847)
npm run dev:dashboard   # mdk run dashboard: a local dashboard (:3030) with this app installed
npm run dev:ui          # rebuild ui/ on save, then reload the browser
```

`dev/mdk.yaml` is a small site on mock devices: four containers of two racks by ten sockets (two sockets empty), containers 1 to 3 on the MicroBT [whatsminer-mdk-worker](https://github.com/whatsminer/whatsminer-mdk-worker), container 4 on the Bitmain [antminer-mdk-worker](https://github.com/bitmain-official/antminer-mdk-worker), and one simulated power meter per container (`dev/workers/powermeter-sim`). `mdk run` starts a mock device per seed device from each worker's `mock/server.js`; the vendor workers do not ship one yet, so `dev/upstream/` carries the adapters and `npm run setup` copies them in. The app's `layout` block in the same file places every device. `npm run mdk -- status --dir dev` lists the workers and their devices.

The Kernel refuses every call until `spec.rbac` in `dev/mdk.yaml` binds someone, and the Gateway asks every app route for a signed-in user. `dev/mdk.yaml` carries the policy `mdk rbac init` writes (the CLI as admin, the Gateway's read access, the app's own grant from `mdk-app.yaml`) and an `admin` binding for a user named `dev`. Create that user once, with the stack running:

```bash
npm run mdk -- user add dev --admin --dir dev     # prompts for a password (12 characters or more)
```

After a change to `permissions` in `mdk-app.yaml`, run `npm run mdk -- rbac init --dir dev` and restart the stack: the Kernel applies `spec.rbac` at boot. The stack's keys and credentials live under `dev/.mdk/`, which stays untracked.

Create the local dashboard once with `npm run mdk -- create dashboard --dir dev`. App UIs have no hot reload: `dev:ui` rebuilds the bundle, and a browser reload picks it up. The dashboard does not need a restart.

For UI work without the workers, `npm run dev:stack:mock` runs `dev/mock-site/mdk.yaml` instead: the app alone with `mock: true`, so every route is served from an in-memory site of 4 containers, 4 racks each, 20 sockets per rack. Readings drift over time and commands change the state. Set `commandsEnabled: false` there to try the hosted demo, where command routes return 403. The dashboard works against either stack.

Call a route directly, with a token from the Gateway's sign-in:

```bash
TOKEN=$(curl -s -X POST localhost:3847/auth/login -H 'content-type: application/json' \
  -d '{"username":"dev","password":"<password>"}' | jq -r .accessToken)
curl -H "authorization: Bearer $TOKEN" localhost:3847/apps/op-centre-lite/api/site/summary
```

## Routes

All under the app's mount (`/apps/op-centre-lite` by default). The bodies are typed in `ui-src/api/contract.ts`, and every numeric field names its unit.

| Method | Route                                                                | Response          |
| ------ | -------------------------------------------------------------------- | ----------------- |
| GET    | `/api/config`                                                        | `SiteConfig`      |
| GET    | `/api/site/summary`                                                  | `SiteSummary`     |
| GET    | `/api/containers`                                                    | `Containers`      |
| GET    | `/api/containers/:id/layout`                                         | `ContainerLayout` |
| GET    | `/api/history?metric&interval&limit` or `?metric&interval&start&end` | `History`         |
| GET    | `/api/power-meters`                                                  | `PowerMeters`     |
| GET    | `/api/miners?containerId&search&page&pageSize`                       | `MinersPage`      |
| GET    | `/api/miners/:id/logs`                                               | file download     |
| POST   | `/api/commands/power-mode`                                           | `CommandResult`   |
| POST   | `/api/commands/power-pct`                                            | `CommandResult`   |

Errors return `{ statusCode, error, message }`, with an `ERR_*` code in `message`. The logs route is a stream: it answers with the miner's log archive as an attachment (the worker's `downloadLogs` result), not JSON.

### Calling the routes

Every app route needs a Bearer token from the Gateway's sign-in (`POST /auth/login` with `{ "username", "password" }` answers `{ accessToken, refreshToken }`). The Postman collection in `postman/` has one request per route, grouped as sign-in, site reads, miners, history, commands and error shapes; its Login request stores the token in a collection variable so the others just work. Variables: `gatewayUrl` (`http://localhost:3847`), `appMount` (`op-centre-lite`), `username`, `password`, `containerId`, `minerId`.

The same with curl:

```bash
G=localhost:3847/apps/op-centre-lite; A="authorization: Bearer $TOKEN"
curl -H "$A" "$G/api/containers"
curl -H "$A" "$G/api/containers/container-1/layout"
curl -H "$A" "$G/api/miners?containerId=container-4&search=am41&page=1&pageSize=20"
curl -H "$A" "$G/api/history?metric=hashrate&interval=5m&limit=12"
curl -H "$A" "$G/api/power-meters"
curl -X POST -H "$A" -H 'content-type: application/json' \
  -d '{"target":{"containerId":"container-4"},"mode":"low"}' "$G/api/commands/power-mode"
curl -X POST -H "$A" -H 'content-type: application/json' \
  -d '{"target":{"minerIds":["miner-1-1-1"]},"pct":80}' "$G/api/commands/power-pct"
curl -OJ -H "$A" "$G/api/miners/miner-1-1-1/logs"     # saves the archive under its own filename
```

On the dev stack, containers 1 to 3 are Whatsminers and container 4 is Antminers; miner ids are `miner-<container>-<rack>-<slot>`, meters `meter-1` to `meter-4`.

## How the worker site is served

With `mock: false` the plugin reads the site from the Kernel through the client the app runtime hands it (signed in as the app's service account, `app:<name>`); commands and log downloads go through the request's client, which carries the signed-in operator's token, so `spec.rbac` checks both and the Kernel's write-command log names the operator.

- **Topology** comes from the `layout` config (below). MDK devices carry no position, so a device the layout does not name is ignored, and a socket's device the Kernel does not list, or cannot read, is reported `offline` with the identity it last showed, so counts hold.
- **Reads** are one snapshot of every device in the layout: capabilities once per device (miner or meter, the `setPowerMode` modes, which percent command it has), then one metrics pull per device, at most `commands.concurrency` in flight. The snapshot serves every route for `snapshotTtlMs`, and is served stale while a refresh runs, so a request never waits on a full fleet read once there is one.
- **Vendor telemetry** is mapped in `plugin/lib/normalize.js`: hashrate from `hashrate_rt` (else `hashrate_avg`), inlet temperature from Antminer's `ambient_temp` or Whatsminer's `miner_stats.env_temp`, frequency as the mean of the hashboards, serial and IP from `device_info`. A miner's `powerPct` is the worker's readable value (Antminer) or else the last value this app set (Whatsminer reports none), and `null` before that.
- **History** is the app's own (the Kernel keeps none): `plugin/main.js` samples the site, every container and every rack each `history.sampleIntervalMs` into `history.jsonl` under the app's data dir, keeps `history.retentionDays`, and reloads it on boot. A bucket with no sample is left out of the series, so a gap (restart, Kernel down) shows as a gap. `nominal` is the layout's nominal hashrate summed over the scope's occupied sockets.
- **Commands** fan out to the target's miners: a container's miners that are not offline, or the listed ids the site knows. Miners whose worker lacks the mode (the contract's `setPowerMode` enum) or a percent command are skipped. `accepted` is whether the Kernel queued at least one command and `minerCount` how many; with `commands.verify: true` the count is of commands that finished `SUCCESS` within 10 s. The next read reflects the change as soon as the worker does (the Whatsminer worker caches its reads for a few seconds).
- **Logs** run the worker's `downloadLogs` for the operator and stream its archive (`.tgz` on Whatsminer, `.tar` on Antminer). 501 `ERR_LOGS_UNSUPPORTED` for a worker without the command, 502 `ERR_LOGS_FAILED` when it fails.
- **Kernel down** answers 503 `ERR_KERNEL_UNAVAILABLE` on every data route; a Kernel refusal (`ERR_KERNEL_ACTION_FORBIDDEN`, a missing grant in `spec.rbac`) passes through as 403.

## Configuration

`mdk-app.yaml` holds the defaults; an app's `config` in `mdk.yaml` overrides them key by key (a nested key such as `history` is replaced whole).

| Key                        | Default              | Meaning                                                                         |
| -------------------------- | -------------------- | ------------------------------------------------------------------------------- |
| `mock`                     | `false`              | Serve every route from the in-memory site instead of the workers                |
| `siteName`                 | `"Site"`             | Shown in the UI                                                                 |
| `commandsEnabled`          | `true`               | `false` on the hosted demo: command routes return 403, the UI disables controls |
| `downloadUrl`              | `null`               | The hosted demo banner's "Download the App" link (http or https); none if unset |
| `layout`                   | `{ containers: [] }` | Containers, racks and sockets, and the device in each (below)                   |
| `history.sampleIntervalMs` | `60000`              | How often the app samples the fleet for `/api/history`                          |
| `history.retentionDays`    | `30`                 | How long samples are kept under the app's data dir                              |
| `commands.concurrency`     | `8`                  | Commands (and telemetry reads) in flight at once                                |
| `commands.verify`          | `false`              | Wait up to 10 s for each command to finish and count only successes             |
| `snapshotTtlMs`            | `5000`               | One fleet read serves every route and the sampler for this long                 |

MDK devices carry no position, so `layout` is where the site's shape comes from. Its names follow MiningOS (`info.container`, `info.pos` = `<rack>_<slot>`), so a MiningOS export maps onto it directly. The schema is `layoutSchema` in `ui-src/api/contract.ts`; ids and device ids must be unique across the site, socket positions within a rack. A socket with `deviceId: null` is empty; a container with `meterDeviceId: null` has no power meter.

```yaml
layout:
  containers:
    - id: container-1
      name: Container 1
      model: MicroBT WhatsMiner M56
      nominalHashrateThs: 212
      meterDeviceId: meter-1
      racks:
        - id: c1-r1
          name: Rack 1
          sockets:
            - { position: "1-1", deviceId: wm-101 }
            - { position: "1-2", deviceId: null }
```

## Troubleshooting

- **`The kernel is already running for this project`** on `npm run dev:stack`: a previous stack (or an `npm run e2e`) is still up. `pkill -f "cli/dist/index.js run"` and retry.
- **Port in use** (`3847`, `3848`, mock ports `18101` to `18176`): another stack on the machine. Mock ports move on their own and the log says so; the Kernel and Gateway ports are in `dev/mdk.yaml`.
- **401 on every route**: no token, an expired one, or a wrong password. Sign in again. `npm run e2e` sets the `dev` user's password to `E2E_PASSWORD` (default `op-centre-e2e-pass`); `npm run mdk -- user passwd dev --dir dev` sets it back.
- **403 `ERR_KERNEL_ACTION_FORBIDDEN`**: the app's grant in `spec.rbac` is missing or stale (after a change to `permissions` in `mdk-app.yaml`). Run `npm run mdk -- rbac init --dir dev` and restart the stack; the Kernel applies `spec.rbac` at boot.
- **503 `ERR_KERNEL_UNAVAILABLE`**: the app cannot reach the Kernel. Check the stack terminal; `npm run mdk -- status --dir dev`.
- **`ERR_LAYOUT_INVALID: ...` and the app does not start**: the `layout` block in `dev/mdk.yaml` (or the deployed `mdk.yaml`) repeats an id, a device id or a socket position, or misses a field; the message names the path.
- **Every miner `offline`**: the workers are not registered (status shows them) or the device ids in `layout` do not match `spec.workers[].config.devices[].id`.
- **`ui/ is stale` in CI**: run `npm run build:ui` and commit `ui/`. **`plugin/mdk-plugin.json is stale`**: `npm run gen:routes` and commit it.
- **The dashboard shows no app**: `npm run build:ui` has not run, or the dashboard was created before the stack (`mdk create dashboard --dir dev` reads `dev/mdk.yaml`). Re-create it with `--force`.

## Checks

```bash
npm run check   # fmt, lint, typecheck, tests, route table freshness, UI build, mdk validate app
npm run e2e     # boots the dev stack, signs in, calls every route, sends a command, downloads logs
```

The unit tests cover the plugin's modules against stubbed Kernel replies in the shapes the Kernel sends (`ui-src/api/plugin-*.test.ts`) and the mock site against the contract. `npm run e2e` (`scripts/e2e.sh`, also in CI) is the integration test: the real stack from `dev/mdk.yaml`, with `E2E_PASSWORD` (default `op-centre-e2e-pass`) set as the `dev` user's password on every run, so sign in with that afterwards or set it back with `npm run mdk -- user passwd dev --dir dev`. Stop `dev:stack` first: it uses the same ports.
