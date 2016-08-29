/**
 * Copyright 2016 Reto Inderbitzin
 */
/* eslint-env mocha */
'use strict'

const assert = require('chai').assert
const agency = require('./../agency')
const sha256 = require('./../../../lib/sha256')

describe('Acceptance | Controller | KeysController', function () {
  function url (id) {
    return !id ? '/api/keys' : '/api/keys/' + id
  }

  function key (agent, isPublic) {
    return {
      email_sha256: sha256(agent.email),
      is_public: isPublic,
      private_key: 'BEGIN PRIVATE KEY...',
      public_key: 'BEGIN PUBLIC KEY...'
    }
  }

  function assertKey (actual, expected) {
    assert.propertyVal(actual, 'email_sha256', expected.email_sha256)
    assert.propertyVal(actual, 'is_public', expected.is_public)
    assert.propertyVal(actual, 'private_key', expected.private_key)
    assert.propertyVal(actual, 'public_key', expected.public_key)
  }

  describe('#store | POST /api/keys', function () {
    it('should return 401 as anon', function (done) {
      agency.anon().then((agent) => {
        agent.post(url()).send(key(agent))
          .expect(401, done)
      })
    })

    it.skip('should return 201 as user and create contact me', function (done) {
      agency.user().then((agent) => {
        agent.post(url()).send(key(agent))
          .expect(201)
          .end(function (err, res) {
            assert.isNull(err)
            assertKey(res.body, key(agent, false))
            // shouldHaveContactMe(agent, done)
            done()
          })
      })
    })

    it.skip('should return 201 as user and update contact me', function (done) {

    })
  })
})