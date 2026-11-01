# powermeter-sim

A simulated power meter for the Operation Center Lite dev stack, scaffolded with `mdk create worker` and cut down to a read-only meter. It reports the channels the ABB and SATEC meter workers report (`active_power` W, `voltage` V, `current` A, `snap`), has no commands, and talks to its own simulator in `mock/server.js` over HTTP.

`dev/mdk.yaml` runs one device per container with `mock: true`; each device's `opts.baseW` is the load the meter sits behind. The reading drifts a few percent around it.

```
mdk-contract.json     capability manifest
src/client.js         binds to this device's simulator (ambient @tetherto/mdk-worker/device opts)
src/telemetry/*.js    one handler per channel
mock/server.js        the simulator: GET /api/v1/reading
```
