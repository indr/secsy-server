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

  function makeKey (agent, isPublic) {
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
    assert.notProperty(actual, 'private_key')
    assert.propertyVal(actual, 'public_key', expected.public_key)
  }

  function assert201 (res, agent) {
    const key = res.body
    assert.lengthOf(key.id, 36)
    assert.closeTo(new Date(key.created_at).getTime(), new Date().getTime(), 1200)
    assert.equal(key.updated_at, key.created_at)
    assert.equal(key.owned_by, agent.id)

    assertKey(key, makeKey(agent, false))
  }

  let anon, user, admin
  before(function () {
    return agency.anon().then((agent) => {
      anon = agent
      return agency.user({ key: false })
    }).then((agent) => {
      user = agent
      return agency.admin({ key: false })
    }).then((agent) => {
      admin = agent
    })
  })

  describe('#store | POST /api/keys', function () {
    describe('given user has no key', function () {
      it('anon: should return 401', function () {
        return anon.post(url()).send(makeKey(anon)).expect(401)
      })

      it('user: should return 201', function () {
        return user.post(url()).send(makeKey(user)).expect(201).then((res) => {
          assert201(res, user)
        })
      })
      it('should return 201 as admin', function () {
        return admin.post(url()).send(makeKey(admin)).expect(201).then((res) => {
          assert201(res, admin)
        })
      })
    })

    describe('given user has already a key', function () {
      // There must be a better way to accomplish this
      let agents = [ 'user', 'admin' ]
      before(function () {
        agents.user = user
        agents.admin = admin
      })

      agents.forEach(function (role) {
        it(role + ': should return 201 and create a new key id', function () {
          let agent = agents[ role ]
          let keyId
          return agent.post(url()).send(makeKey(agent)).expect(201).then((res) => {
            assert201(res, agent)
            keyId = res.body.id
          }).then(() => {
            return agent.post(url()).send(makeKey(agent)).expect(201)
          }).then((res) => {
            assert201(res, agent)
            assert.notEqual(res.body.id, keyId)
          })
        })
      })
    })
  })
})
