/* eslint-env mocha */
'use strict'

const assert = require('chai').assert
const supertest = require('supertest')
const ctx = require('./../bootstrap')

describe('Acceptance | Controller | AppController', function () {
  let agent = null

  before(function (done) {
    agent = supertest(ctx.http)
    done()
  })

  function assertEmberIndexPage (done) {
    return function (err, res) {
      assert.isNull(err)
      assert.isAbove(res.text.indexOf('<base href="/app/" />'), 0)
      assert.isAbove(res.text.indexOf('<meta name="addressbook/config/environment"'), 0)
      done()
    }
  }

  describe('GET /app', function () {
    it('returns 301 moved permanently', function (done) {
      agent.get('/app').expect(301)
        .expect('Location', '/app/', done)
    })
  })

  let urls = [
    '/app/', '/app/index.html', '/app/login', '/app/contacts/123abc/edit'
  ]
  urls.forEach((each) => {
    describe('GET ' + each, function () {
      it('returns ember index page', function (done) {
        agent.get(each).expect(200)
          .end(assertEmberIndexPage(done))
      })
    })
  })
})
