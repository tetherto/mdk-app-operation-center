'use strict'

// The mock device `mdk run` boots. A stack whose worker config has `mock: true`
// gets one of these per seed device: createServer(opts) receives the device's
// own opts from mdk.yaml (the same ones src/client.js reads: address or host,
// port, username, password) and returns { server, ready, exit }. Everything
// else is the CGI simulator in ./cgi-server.js.
//
// Extra opts seed the device's identity so a stack of many miners reports
// distinct serials, IPs and models: serial -> serinum, ip -> ipaddress,
// model -> miner_type.
const { createServer: createCgiServer } = require('./cgi-server')

function createServer (opts = {}) {
  const state = { systemInfo: {}, networkInfo: {}, minerType: {} }
  if (opts.serial !== undefined) state.systemInfo.serinum = String(opts.serial)
  if (opts.ip !== undefined) {
    state.systemInfo.ipaddress = String(opts.ip)
    state.networkInfo.ipaddress = String(opts.ip)
    state.networkInfo.conf_ipaddress = String(opts.ip)
  }
  if (opts.model !== undefined) {
    state.minerType.miner_type = String(opts.model)
    state.systemInfo.minertype = `Antminer ${opts.model}`
  }

  const mock = createCgiServer({
    host: opts.host || opts.address || '127.0.0.1',
    port: opts.port || 0,
    username: opts.username || 'root',
    password: opts.password || 'root',
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
