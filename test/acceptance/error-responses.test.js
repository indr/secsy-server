'use strict'

/* eslint-env mocha */

const assert = require('chai').assert
const context = require('../contexts').acceptance
const supertest = require('supertest')

require('co-mocha')

context('Acceptance | Error responses', function () {
  let agent

  before(function * () {
    agent = supertest(this.server)
  })

  it('should return html given accept text/html', function * () {
    const response = yield agent.get('/not-found')
      .set('Accept', 'text/html')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(404)

    assert.deepEqual(response.body, {})
    assert.match(response.text, /<h1>404<\/h1>/)
  })

  it('should return json given accept application/json', function * () {
    const response = yield agent.get('/not-found')
      .set('Accept', 'application/json')
      .expect('Content-Type', 'application/json')
      .expect(404)

    assert.equal(response.body.status, 404)
    assert.equal(response.body.message, 'Route not found /not-found')
  })
})
