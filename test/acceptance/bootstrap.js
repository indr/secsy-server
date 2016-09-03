/* eslint-env mocha */
'use strict'

const assert = require('chai').assert
const http = require('./../../bootstrap/http')

const ctx = {
  http: null
}

// global.dateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
global.dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/

before(function (done) {
  http(function (err, server) {
    assert.isNull(err)
    ctx.http = server.getInstance()
    done()
  })
})

module.exports = ctx
