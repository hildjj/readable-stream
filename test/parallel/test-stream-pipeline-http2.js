'use strict'

const tap = require('tap')

const silentConsole = {
  log() {},

  error() {}
}
const common = require('../common')

if (!common.hasCrypto) common.skip('missing crypto')

const { Readable, pipeline } = require('../../lib/ours/index')

const http2 = require('http2')

{
  const server = http2.createServer((req, res) => {
    pipeline(req, res, common.mustCall())
  })
  server.listen(0, () => {
    const url = `http://localhost:${server.address().port}`
    const client = http2.connect(url)
    const req = client.request({
      ':method': 'POST'
    })
    const rs = new Readable({
      read() {
        rs.push('hello')
      }
    })
    pipeline(
      rs,
      req,
      common.mustCall((err) => {
        server.close()
        client.close()
      })
    )
    let cnt = 10
    req.on('data', (data) => {
      cnt--
      if (cnt === 0) rs.destroy()
    })
  })
}
/* replacement start */

process.on('beforeExit', (code) => {
  if (code === 0) {
    tap.pass('test succeeded')
  } else {
    tap.fail(`test failed - exited code ${code}`)
  }
})
/* replacement end */
