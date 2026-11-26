# container-sim

A simulated mining container for the Operation Center Lite dev stack, built like `powermeter-sim`. It reports the container's own air temperature and humidity the way the Bitdeer and Antspace container workers do: the `snap` channel carries `stats.ambient_temp_c` and `stats.humidity_percent`, and its PDU sockets as the Bitdeer worker reports them (`stats.container_specific.pdu_data[]`, each socket `{ socket, enabled, current_a, ... }`), beside `temperature` (°C) and `humidity` (%) channels. It has no commands and talks to its own simulator in `mock/server.js` over HTTP.

`dev/mdk.yaml` runs one device per container with `mock: true`, named by the container's `envDeviceId` and `containerDeviceId` in the app's `layout`; each device's `opts.baseC` is the temperature the reading drifts around, `opts.pdus` the socket count per PDU and `opts.off` the PDU sockets switched off.

```
mdk-contract.json     capability manifest
src/client.js         binds to this device's simulator (ambient @tetherto/mdk-worker/device opts)
src/telemetry/*.js    one handler per channel
mock/server.js        the simulator: GET /api/v1/reading
```
