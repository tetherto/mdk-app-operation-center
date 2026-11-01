'use strict'

// The mock device `mdk run` boots. A stack whose worker config has `mock: true`
// gets one of these per seed device: createServer(opts) receives the device's
// own opts from mdk.yaml (the same ones src/client.js reads: address or host,
// port, password) and returns { server, ready, exit }. Everything else is the
// API v3 simulator in ./api-v3-server.js.
//
// Extra opts seed the device's identity so a stack of many miners reports
// distinct serials, IPs and models: serial -> miner-sn, ip -> network.ip,
// model -> miner type.
const { createServer: createApiV3Server } = require('./api-v3-server')

function createServer (opts = {}) {
  const state = { deviceInfo: { miner: {}, network: {} } }
  if (opts.serial !== undefined) state.deviceInfo.miner['miner-sn'] = String(opts.serial)
  if (opts.model !== undefined) state.deviceInfo.miner.type = String(opts.model)
  if (opts.ip !== undefined) state.deviceInfo.network.ip = String(opts.ip)

  const mock = createApiV3Server({
    host: opts.host || opts.address || '127.0.0.1',
    port: opts.port || 0,
    password: opts.password || 'super',
    state
  })

  return {
    server: mock.server,
    state: mock.state,
    ready: mock.ready,
    exit () { mock.close().catch(() => {}) }
  }
}

module.exports = { createServer }
