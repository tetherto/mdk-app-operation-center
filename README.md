# Operation Center Lite

Single-site operations for MDK: a dashboard view of the site, efficiency per power meter, an explorer for racks and miners, container detail (layout, power adjustment, charts, heatmap), and power commands.

It is an MDK app: one package with a Gateway plugin and a dashboard UI. A dashboard installs it with:

```bash
mdk add app github:<owner>/<repo>#<tag>
```

The pages then appear under the app's sidebar group, at `/app/<name>/`, and a summary panel appears on the dashboard's Home.

## Quick start

Everything below runs on one machine with mock devices: no hardware, no hosted Kernel. About five minutes the first time, two after that.

**You need:** Node 24 or later and git.

1. **Clone and install.** `npm run setup` installs MDK from npm (`@tetherto/mdk-*`, pinned to one version) and the vendor miner workers the dev stack runs, from GitHub:

   ```bash
   git clone git@github.com:tetherto/mdk-app-operation-center.git
   cd mdk-app-operation-center
   npm run setup
   ```

   Set `NPM="sfw npm"` (or any wrapper) if your environment requires one.

2. **Build the UI** (the dashboard serves the committed bundle):

   ```bash
   npm run build:ui
   ```

3. **Start the stack.** One terminal, kept open:

   ```bash
   npm run dev:stack
   ```

   This boots the Kernel, 4 miner workers, a meter worker and a container worker on 80 mock devices, this app and the Gateway on `:3847`. Wait for `gateway listening`. The first boot is the slowest; `npm run mdk -- status --dir dev` shows every worker and device.

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
dev/mdk.yaml          local stack: Kernel, vendor miner workers, a simulated meter
                      and a simulated container on mock devices, this app and the Gateway
dev/workers/          powermeter-sim and container-sim, the simulated meter and
                      container Worker Plugins
dev/upstream/         mock/server.js adapters for the vendor workers, until merged there
dev/mock-site/        the app alone on its in-memory site, for UI work
scripts/setup.sh      installs the mdk CLI, the UI deps and the dev stack's workers
```

## Building on it

Each page is a feature folder: a pure `*-shape.ts` that turns contract data into display values (unit-tested, no React), a `use-*.ts` hook that fetches and shapes, and components that only render. To reuse a piece, copy its folder and the `lib/` helpers it imports; the shapes and hooks only need the contract types and `useMdkApp().apiUrl`.

| Piece                                                                                                             | Where                                                                                                                                | Built on                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Route contract (every request and response, zod)                                                                  | [`api/contract.ts`](ui-src/api/contract.ts), [`api/route-table.ts`](ui-src/api/route-table.ts)                                       | zod; the route table generates `plugin/mdk-plugin.json`                                                                     |
| Typed requests and query keys                                                                                     | [`api/request.ts`](ui-src/api/request.ts), [`api/query-keys.ts`](ui-src/api/query-keys.ts)                                           | `mdkFetch`, react-query (`useQuery`, `useMutation`)                                                                         |
| Page frame with site stats strip and hosted demo banner                                                           | [`components/page.tsx`](ui-src/components/page.tsx), [`components/hosted-demo-banner.tsx`](ui-src/components/hosted-demo-banner.tsx) | `HeaderMinersBox` and siblings, `CoreAlert`                                                                                 |
| Container cards (totals, rack table, status tiles)                                                                | [`features/site-overview/`](ui-src/features/site-overview/)                                                                          | `Card`, `DataTable`, `MinersActivityChart`                                                                                  |
| Power mode and power % controls: confirm, send, result toast, refetch                                             | [`features/commands/`](ui-src/features/commands/)                                                                                    | `Select`, `AlertDialog`, `useNotification`; take any `CommandTarget` (a container or miner ids)                             |
| Racks and miners tables with search, filter, paging and CSV export                                                | [`features/explorer/`](ui-src/features/explorer/), [`lib/csv.ts`](ui-src/lib/csv.ts)                                                 | `DataTable`, `Pagination`, `Input`, `Select`; server paging for miners                                                      |
| Socket grid of a container's racks (columns or ordered view), with legend, zoom, print, CSV export and side panel | [`features/container-detail/`](ui-src/features/container-detail/)                                                                    | primitives only (the devkit `Socket` was removed in 0.12); `Workbench` wraps `SocketGrid`; each tab picks what a tile shows |
| History charts (hash rate against nominal, power) with a window toggle                                            | [`features/history/`](ui-src/features/history/), [`lib/use-line-chart-data.ts`](ui-src/lib/use-line-chart-data.ts)                   | `LineChartCard`; `use-line-chart-data` works around a devkit chart that mounts empty                                        |
| Site and mining efficiency, per-meter cards, consumption breakdown                                                | [`features/site-efficiency/`](ui-src/features/site-efficiency/)                                                                      | `SingleStatCard`, `Card`, `DataTable`, `EmptyState`                                                                         |
| Units and formatting (TH/s, PH/s, W, kW, MW, W/TH, %, °C)                                                         | [`lib/units.ts`](ui-src/lib/units.ts)                                                                                                | one place for every unit and decimal count                                                                                  |

The plugin side follows the same split: [`plugin/lib/aggregate.js`](plugin/lib/aggregate.js) shapes the fleet snapshot per route, [`plugin/lib/topology.js`](plugin/lib/topology.js) reads the layout config, and [`plugin/lib/commands.js`](plugin/lib/commands.js) sends commands as the signed-in operator. See [How the worker site is served](#how-the-worker-site-is-served).

For MDK itself (Workers, the Kernel, the Gateway, the devkit), start from the MDK docs and its Agent Skills (`mdk`, `mdk-gateway-plugin`, `mdk-ui-component`).

## Setup

Node 24 or later. The [Quick start](#quick-start) above is the short version; this is what `npm run setup` does.

`scripts/setup.sh` installs, from npm and GitHub:

- `./`: the `mdk` CLI (`@tetherto/mdk-cli`, which brings the Kernel, the Gateway, the app runtime and the worker host it boots), and `@tetherto/mdk-app-runtime`, whose plugin loader `api/plugin-site.test.ts` loads the plugin with. `npm run mdk -- <command>` runs the CLI.
- `ui-src/`: `@tetherto/mdk-ui-foundation`, `-react-adapter` and `-react-devkit`, and the UI toolchain.
- `dev/`: the app, the vendor miner workers and the simulated meter the dev stack runs, plus the `mock/server.js` adapters from `dev/upstream/`. `dev/mock-site/` links the app alone.

The app builds against MDK 0.13.1, where every app route is authenticated and authorized by `spec.rbac` and the app runtime hands the plugin its Kernel client. The version is pinned exactly in `package.json` and `ui-src/package.json`; bump them together, then `npm run setup`.

Set `NPM="sfw npm"` (or any wrapper) if your environment requires one.

## Develop

Three terminals:

```bash
npm run dev:stack       # mdk run: Kernel, mock workers, this app and the Gateway (:3847)
npm run dev:dashboard   # mdk run dashboard: a local dashboard (:3030) with this app installed
npm run dev:ui          # rebuild ui/ on save, then reload the browser
```

`dev/mdk.yaml` is a small site on mock devices: four containers of two racks by ten sockets (two sockets empty), containers 1 to 3 on the MicroBT [whatsminer-mdk-worker](https://github.com/whatsminer/whatsminer-mdk-worker), container 4 on the Bitmain [antminer-mdk-worker](https://github.com/bitmain-official/antminer-mdk-worker), and one simulated power meter (`dev/workers/powermeter-sim`) and one simulated container reporting its air temperature (`dev/workers/container-sim`) per container. `mdk run` starts a mock device per seed device from each worker's `mock/server.js`; the vendor workers do not ship one yet, so `dev/upstream/` carries the adapters and `npm run setup` copies them in. The app's `layout` block in the same file places every device. `npm run mdk -- status --dir dev` lists the workers and their devices.

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

On the dev stack, containers 1 to 3 are Whatsminers and container 4 is Antminers; miner ids are `miner-<container>-<rack>-<slot>`, meters `meter-1` to `meter-4`, container devices `container-sim-1` to `container-sim-4`.

## How the worker site is served

With `mock: false` the plugin reads the site from the Kernel through the client the app runtime hands it (signed in as the app's service account, `app:<name>`); commands and log downloads go through the request's client, which carries the signed-in operator's token, so `spec.rbac` checks both and the Kernel's write-command log names the operator.

- **Topology** comes from the `layout` config (below). MDK devices carry no position, so a device the layout does not name is ignored, and a socket's device the Kernel does not list, or cannot read, is reported `offline` with the identity it last showed, so counts hold.
- **Reads** are one snapshot of every device in the layout: capabilities once per device (miner or meter, the `setPowerMode` modes, which percent command it has), then each device's latest readings from its worker's cache: one `list` request (`status: true`) per worker, answered from the snaps an MDK worker-infra worker collects on its own timer (`thing.collectSnapsItvMs`), so a read never reaches a device. A worker without that cache leaves its devices offline, unless `fleet.liveFallback` is on: then they get one metrics pull each, at most `commands.concurrency` in flight (the dev stack's vendor workers need this). The snapshot serves every route for `snapshotTtlMs`, and is served stale while a refresh runs, so a request never waits on a full fleet read once there is one.
- **Vendor telemetry** is mapped in `plugin/lib/normalize.js`: hashrate from `hashrate_rt` (else `hashrate_avg`), inlet temperature from Antminer's `ambient_temp` or Whatsminer's `miner_stats.env_temp`, a socket's `currentA` and `enabled` from its container device's snap (`stats.container_specific.pdu_data[].sockets[]`, the Bitdeer container worker; null without a reading, never guessed from the miner), a container's `envTempC` (also every one of its miners') from its env device's snap, `stats.ambient_temp_c` on the Bitdeer and Antspace container workers or `stats.temp_c` on a Seneca sensor (null while the probe reports a fault), else its `temperature` channel, frequency as the mean of the hashboards, serial and IP from `device_info`. A miner's `powerPct` is the worker's readable value (Antminer) or else the last value this app set (Whatsminer reports none), and `null` before that.
- **History** comes from the Workers' own telemetry stores when the stack has them: on MDK after 0.13.0 a Worker whose config (or contract) sets `telemetryPollIntervalMs` keeps every poll for a day and 5-minute rollups for 30 days, and `/api/history` reads them in one Kernel round trip (`pullSnapshot` with a range), the reading nearest to each bucket start summed over the scope's miners. When the stack cannot serve that (a 0.13.0 Kernel or client, a Worker that does not poll) the app's own samples serve the route instead: `plugin/main.js` samples the site, every container and every rack each `history.sampleIntervalMs` into a Hyperbee (`corestore` + `hyperbee`, npm dependencies of the app) under the app's data dir, prunes what is older than `history.retentionDays`, and answers a request with one range read of its scope, averaged per bucket; without a data dir (the smoke run of `mdk validate`) the samples are kept in memory. Either way a bucket with no reading is left out of the series, so a gap (restart, Kernel down) shows as a gap. `nominal` is the layout's nominal hashrate summed over the scope's occupied sockets.
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
| `history.sampleIntervalMs` | `60000`              | How often the app samples the fleet for `/api/history` (the fallback series)    |
| `history.retentionDays`    | `30`                 | How long those samples are kept under the app's data dir                        |
| `commands.concurrency`     | `8`                  | Commands (and telemetry reads) in flight at once                                |
| `commands.verify`          | `false`              | Wait up to 10 s for each command to finish and count only successes             |
| `fleet.liveFallback`       | `false`              | Pull a device directly when its worker serves no cached readings                |
| `snapshotTtlMs`            | `5000`               | One fleet read serves every route and the sampler for this long                 |

MDK devices carry no position, so `layout` is where the site's shape comes from. Its names follow MiningOS (`info.container`, `info.pos` = `<rack>_<slot>`), so a MiningOS export maps onto it directly. The schema is `layoutSchema` in `ui-src/api/contract.ts`; ids and device ids must be unique across the site, socket positions within a rack. A socket with `deviceId: null` is empty; a container with `meterDeviceId: null` has no power meter. `envDeviceId` (optional) names the device reporting the container's air temperature, its own container worker or a sensor, shown as Env Temp; several containers may name one site sensor, but it may not be a miner or a meter. Without it, Env Temp shows "-". `containerDeviceId` (optional) names the container's own worker, which reports its PDU sockets; it may be the same device as `envDeviceId`, one per container. A socket's `pdu` and `socket` (optional, both or neither) name the PDU socket feeding it, as that worker names them (Bitdeer: `pdu: "1-1"`, `socket: "a1"`), empty sockets included; they need the container's `containerDeviceId` and are unique within the container. The Layout tab shows that socket's current and on/off; without them it shows "- A" and no on/off. `siteMeterDeviceId` (optional) names the meter of the whole site, cooling included, such as a DCS reading the site main meter: Site Efficiency's total consumption and site efficiency use its reading, and what the container meters do not cover shows as "Not metered". Without it, the total is the sum of the container meters.

```yaml
layout:
  siteMeterDeviceId: site-meter # optional
  containers:
    - id: container-1
      name: Container 1
      model: MicroBT WhatsMiner M56
      nominalHashrateThs: 212
      meterDeviceId: meter-1
      envDeviceId: bitdeer-1 # optional
      containerDeviceId: bitdeer-1 # optional
      racks:
        - id: c1-r1
          name: Rack 1
          sockets:
            - { position: "1-1", deviceId: wm-101, pdu: "1-1", socket: "a1" } # pdu, socket optional
            - { position: "1-2", deviceId: null }
```

## Troubleshooting

- **`The kernel is already running for this project`** on `npm run dev:stack`: a previous stack (or an `npm run e2e`) is still up. `pkill -f "node_modules/.bin/mdk run"` and retry (that stops every local stack, including other projects').
- **Port in use** (`3847`, `3848`, mock ports `18101` to `18184`): another stack on the machine. Mock ports move on their own and the log says so; the Kernel and Gateway ports are in `dev/mdk.yaml`.
- **401 on every route**: no token, an expired one, or a wrong password. Sign in again. `npm run e2e` sets the `dev` user's password to `E2E_PASSWORD` (default `op-centre-e2e-pass`); `npm run mdk -- user passwd dev --dir dev` sets it back.
- **403 `ERR_KERNEL_ACTION_FORBIDDEN`**: the app's grant in `spec.rbac` is missing or stale (after a change to `permissions` in `mdk-app.yaml`). Run `npm run mdk -- rbac init --dir dev` and restart the stack; the Kernel applies `spec.rbac` at boot.
- **503 `ERR_KERNEL_UNAVAILABLE`**: the app cannot reach the Kernel. Check the stack terminal; `npm run mdk -- status --dir dev`.
- **`ERR_LAYOUT_INVALID: ...` and the app does not start**: the `layout` block in `dev/mdk.yaml` (or the deployed `mdk.yaml`) repeats an id, a device id or a socket position, or misses a field; the message names the path.
- **Every miner `offline`**: the workers are not registered (status shows them) or the device ids in `layout` do not match `spec.workers[].config.devices[].id`.
- **A `.mdk-sdk/` folder shows up in `git status` or lint**: left from the setup before MDK was on npm. Delete it.
- **`ui/ is stale` in CI**: run `npm run build:ui` and commit `ui/`. **`plugin/mdk-plugin.json is stale`**: `npm run gen:routes` and commit it.
- **The dashboard shows no app**: `npm run build:ui` has not run, or the dashboard was created before the stack (`mdk create dashboard --dir dev` reads `dev/mdk.yaml`). Re-create it with `--force`.

## Checks

```bash
npm run check   # fmt, lint, typecheck, tests, route table freshness, UI build, mdk validate app
npm run e2e     # boots the dev stack, signs in, calls every route, sends a command, downloads logs
```

The unit tests cover the plugin's modules against stubbed Kernel replies in the shapes the Kernel sends (`ui-src/api/plugin-*.test.ts`) and the mock site against the contract. `npm run e2e` (`scripts/e2e.sh`, also in CI) is the integration test: the real stack from `dev/mdk.yaml`, with `E2E_PASSWORD` (default `op-centre-e2e-pass`) set as the `dev` user's password on every run, so sign in with that afterwards or set it back with `npm run mdk -- user passwd dev --dir dev`. Stop `dev:stack` first: it uses the same ports.
