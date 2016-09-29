'use strict'

/* eslint-env mocha */

const Agency = require('./test-helpers/agency')
const assert = require('chai').assert
const app = require('../bootstrap/app')
const fold = require('adonis-fold')
const http = require('../bootstrap/http')
const path = require('path')

require('co-mocha')

// global.dateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
// global.dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/
global.dateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\+|-)\d{2}:\d{2}$/

const contexts = exports = module.exports = {}

contexts.acceptance = function (caption, fn) {
  before(function (done) {
    const ctx = this

    if (!ctx.count) {
      http(function (err, server) {
        assert.isNull(err)
        ctx.server = server.getInstance()
        ctx.agency = global.agency = new Agency(ctx.server)
        done()
      })
    } else {
      done()
    }

    ctx.count = ctx.count + 1 || 1
  })

  after(function (done) {
    const ctx = this
    ctx.count = ctx.count - 1

    if (!ctx.count) {
      ctx.server.close(done)
    } else {
      done()
    }
  })

  context(caption, function () {
    fn()
  })
}

contexts.integration = function (caption, fn) {
  before(function (done) {
    const ctx = this

    if (!ctx.count) {
      const Ioc = fold.Ioc
      const Registrar = fold.Registrar
      const packageFile = path.join(__dirname, '../package.json')

      Registrar.register(app.providers).then(() => {
        Ioc.aliases(app.aliases)

        const Helpers = use('Helpers')
        Helpers.load(packageFile, fold.Ioc)
        done()
      })
    } else {
      done()
    }
    ctx.count = ctx.count + 1 || 1
  })

  after(function (done) {
    const ctx = this
    ctx.count = ctx.count - 1

    if (!ctx.count) {
      done()
    } else {
      done()
    }
  })

  context(caption, function () {
    fn()
  })
}

contexts.unit = function (caption, fn) {
  context(caption, function () {
    fn()
  })
}
