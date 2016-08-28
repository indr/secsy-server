/* eslint-env mocha */
'use strict'

const assert = require('chai').assert
const http = require('./../../bootstrap/http')

const ctx = {
  http: null
}

before(function (done) {
  http(function (err, server) {
    assert.isNull(err)
    ctx.http = server.getInstance()
    done()
  })
})

module.exports = ctx
