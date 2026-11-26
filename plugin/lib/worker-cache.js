"use strict";

/**
 * The devices' latest readings from their Worker's own cache, never from the
 * devices: a Worker built on MDK worker-infra collects a `snap` per device on
 * its timer (`thing.collectSnapsItvMs`) and answers the `list` built-in with
 * `status: true` from memory, each thing carrying its last snap
 * (`thing.last = { snap: { success?, stats, config }, ts }`). One request per
 * Worker, however many devices it has.
 *
 * Each snap is turned into the reply shape of a `metrics` pull
 * (`{ metrics, timestamp }`), so ./normalize.js reads both sources the same
 * way. Snap fields are mdk-core's miner and meter snap (`stats.hashrate_mhs`,
 * `stats.power_w`, `stats.temperature_c`, `config.power_mode`, ...), and a
 * container's or sensor's ambient reading (`stats.ambient_temp_c`, `stats.temp_c`)
 * and a container's PDU sockets (`stats.container_specific.pdu_data`).
 */

/** What the app runtime's Kernel client throws for a method its MDK version lacks. */
const NO_SUCH_METHOD = "ERR_MDK_CLIENT_NO_SUCH_METHOD";

const number = (value) => (typeof value === "number" && Number.isFinite(value) ? value : null);
const isMapping = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

/** A container's PDUs from its snap stats, only the fields the app reads; [] without any. */
function pduDataOf(stats) {
  const specific = isMapping(stats.container_specific) ? stats.container_specific : {};
  if (!Array.isArray(specific.pdu_data)) return [];
  return specific.pdu_data.filter(isMapping).map((pdu) => ({
    pdu: pdu.pdu,
    offline: pdu.offline === true,
    sockets: Array.isArray(pdu.sockets)
      ? pdu.sockets.filter(isMapping).map((s) => ({
          socket: s.socket,
          enabled: s.enabled,
          current_a: number(s.current_a),
        }))
      : [],
  }));
}

/**
 * A snap as a `metrics` reply; null when the device has no readings: never
 * collected, or its last collection failed (`success: false`, status
 * `offline`), which the fleet reports as offline.
 */
function replyFromThing(thing) {
  const last = isMapping(thing.last) ? thing.last : {};
  const snap = isMapping(last.snap) ? last.snap : null;
  if (snap === null || snap.success === false) return null;
  const stats = isMapping(snap.stats) ? snap.stats : {};
  if (stats.status === undefined || stats.status === "offline") return null;
  const config = isMapping(snap.config) ? snap.config : {};
  const hashrate = isMapping(stats.hashrate_mhs) ? stats.hashrate_mhs : {};
  const temperature = isMapping(stats.temperature_c) ? stats.temperature_c : {};
  const frequency = isMapping(stats.frequency_mhz) ? stats.frequency_mhz : {};
  const network = isMapping(config.network_config) ? config.network_config : {};
  const info = isMapping(thing.info) ? thing.info : {};
  // The 5-minute average, the figure the Worker's own stats use; MH/s to TH/s.
  const mhs = number(hashrate.t_5m) ?? number(hashrate.avg);
  const uptimeMs = number(stats.uptime_ms);

  const metrics = {
    status: stats.status,
    // Firmware v3 Whatsminers call `low` `eco`.
    power_mode: config.power_mode === "eco" ? "low" : config.power_mode,
    power: number(stats.power_w),
    // Meters report site/container consumption under the same key.
    active_power: number(stats.power_w),
    temperature: number(temperature.avg),
    ambient_temp: number(temperature.ambient),
    uptime: uptimeMs === null ? null : uptimeMs / 1000,
    miner_stats: { freq_avg: number(frequency.avg) },
    device_info: {
      ip: typeof network.ip_address === "string" ? network.ip_address : "",
      serial_number: typeof info.serialNum === "string" ? info.serialNum : "",
    },
    // A container's or sensor's ambient reading and a container's PDU
    // sockets, for ./normalize.js envTempOf and pduSocketsOf.
    snap: {
      stats: {
        status: stats.status,
        ambient_temp_c: number(stats.ambient_temp_c),
        temp_c: number(stats.temp_c),
        container_specific: { pdu_data: pduDataOf(stats) },
      },
    },
  };
  if (mhs !== null) metrics.hashrate_rt = mhs / 1e6;
  return { metrics, timestamp: number(last.ts) ?? undefined };
}

/**
 * One Worker's `list` reply. Since MDK 0.14 a `list` addressed to a device
 * answers for that device only, so the fleet read goes through the
 * Worker-scoped `pullWorkerQuery`, which answers
 * `{ workers: { [workerId]: payload }, errors?: { [workerId]: code } }`.
 * A Worker the Kernel reports under `errors` (ERR_WORKER_NOT_ROUTABLE,
 * ERR_WORKER_UNREACHABLE, or the Worker's own refusal) throws that code.
 * A client without `pullWorkerQuery` (MDK 0.13 and earlier) still addresses
 * the Worker's first device, which those Kernels answer with the whole list.
 * The client the app runtime hands a plugin answers every method name with a
 * function and throws ERR_MDK_CLIENT_NO_SUCH_METHOD only when one it lacks is
 * called, so a missing `pullWorkerQuery` shows up as that error, not as
 * `typeof`.
 */
async function pullWorkerList(client, worker, deviceIds) {
  const query = { type: "list", limit: Math.max(deviceIds.length, 1), status: true };
  const legacy = () => client.pullTelemetry(deviceIds[0] ?? worker.workerId, query);
  if (typeof client.pullWorkerQuery !== "function") return await legacy();
  let res;
  try {
    res = await client.pullWorkerQuery({ workers: [worker.workerId], ...query });
  } catch (err) {
    if (String((err && err.message) || err).startsWith(NO_SUCH_METHOD)) return await legacy();
    throw err;
  }
  const errors = isMapping(res) && isMapping(res.errors) ? res.errors : {};
  const error = errors[worker.workerId];
  if (error !== undefined && error !== null) throw new Error(String(error));
  const replies = isMapping(res) && isMapping(res.workers) ? res.workers : {};
  return replies[worker.workerId] ?? null;
}

/** Why a Worker's readings did not come from its cache. */
const NO_LIST_CACHE = "no list cache";

/**
 * The cached replies of one Worker's devices:
 *   { cached: true, replies }  replies keyed by device id (null for a device
 *                              without readings);
 *   { cached: false, reason }  the request failed (`reason` is the error code,
 *                              e.g. ERR_WORKER_UNREACHABLE) or the Worker does
 *                              not serve the `list` built-in (a Worker without
 *                              worker-infra: NO_LIST_CACHE).
 */
async function readWorkerCache(client, worker) {
  const deviceIds = Array.isArray(worker.deviceIds) ? worker.deviceIds : [];
  let reply;
  try {
    reply = await pullWorkerList(client, worker, deviceIds);
  } catch (err) {
    return { cached: false, reason: String((err && err.message) || err) };
  }
  if (!isMapping(reply) || !Array.isArray(reply.things)) {
    return { cached: false, reason: NO_LIST_CACHE };
  }
  const replies = new Map();
  for (const thing of reply.things) {
    if (isMapping(thing) && typeof thing.id === "string")
      replies.set(thing.id, replyFromThing(thing));
  }
  return { cached: true, replies };
}

module.exports = { readWorkerCache, replyFromThing };
