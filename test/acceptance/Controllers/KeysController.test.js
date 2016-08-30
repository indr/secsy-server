/**
 * Copyright 2016 Reto Inderbitzin
 */
/* eslint-env mocha */
'use strict'

const _ = require('lodash')
const assert = require('chai').assert
const agency = require('./../agency')
const sha256 = require('./../../../lib/sha256')
const util = require('util')

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

  let anon
  before(function () {
    return agency.anon().then((agent) => {
      anon = agent
    })
  })

  describe('#store | POST /api/keys', function () {
    let anon, user, admin
    before(function () {
      this.timeout(4000)
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

  var admin, user1, user2

  before(function (done) {
    this.timeout(4000)
    agency.admin().then(function (agent) {
      admin = agent
      return agency.user()
    }).then(function (agent) {
      user1 = agent
      return agency.user()
    }).then(function (agent) {
      user2 = agent
      admin.post(url()).send(makeKey(admin, false)).expect(201, function () {
        user1.post(url()).send(makeKey(user1, false)).expect(201, function () {
          user2.post(url()).send(makeKey(user2, true)).expect(201, done)
        })
      })
    }).catch(done)
  })

  describe('#index | GET /api/keys', function () {
    it('should return 401 as anon', function (done) {
      anon.get(url()).expect(401, done)
    })

    it('should return 200 as user and only public and own keys', function (done) {
      user1.get(url())
        .expect(200)
        .end(function (err, res) {
          assert.isNull(err)
          assert.isAbove(res.body.length, 1)
          assert.isOk(_.find(res.body, { owned_by: user1.id, is_public: false }),
            util.format('Own not public key for user %s not found', user1.id, res.body))
          const user2key = _.find(res.body, { owned_by: user2.id })
          assert.isOk(user2key, util.format('Public key for user %s not found', user2.id, res.body))
          assert.isUndefined(user2key.private_key)
          // assert.isUndefined(user2key.destroyMe)
          assert.isTrue(_.every(res.body, function (eachKey) {
            return eachKey.is_public || eachKey.owned_by === user1.id
          }), util.format('Contains non public not belonging to user %s', user1.id, res.body))
          done()
        })
    })

    it('should return 200 as admin and only public and own keys', function (done) {
      admin.get(url())
        .expect(200)
        .end(function (err, res) {
          assert.isNull(err)
          assert.isAbove(res.body.length, 1)
          assert.isOk(_.find(res.body, { owned_by: admin.id, is_public: false }),
            util.format('Own not public key for user %s not found', admin.id, res.body))
          const user2key = _.find(res.body, { owned_by: user2.id })
          assert.isOk(user2key, util.format('Public key for user %s not found', user2.id, res.body))
          assert.isUndefined(user2key.private_key)
          // assert.isUndefined(user2key.destroyMe)
          assert.isTrue(_.every(res.body, function (eachKey) {
            return eachKey.is_public || eachKey.owned_by === admin.id
          }), util.format('Contains non public not belonging to admin %s', admin.id, res.body))
          done()
        })
    })
  })

  describe('#index with query | GET /api/keys?emailSha256=...', function () {
    var emailHash

    before(function (done) {
      agency.user().then(function (user) {
        user.post(url()).send(makeKey(user)).expect(201).end(function (err, res) {
          assert.isNull(err)
          emailHash = res.body.emailSha256
          done()
        })
      }).catch(done)
    })

    it('should return 403 as anon', function (done) {
      anon.get(url()).query('emailSha256=' + emailHash).expect(401, done)
    })

    it('should return 200 as user and specified key', function (done) {
      user1.get(url()).query('emailSha256=' + emailHash).expect(200).end(function (err, res) {
        assert.isNull(err)
        assert.lengthOf(res.body, 1)
        assert.equal(res.body[ 0 ].emailSha256, emailHash)
        done()
      })
    })

    it('should return 200 as admin and specified key', function (done) {
      admin.get(url()).query('emailSha256=' + emailHash).expect(200).end(function (err, res) {
        assert.isNull(err)
        assert.lengthOf(res.body, 1)
        assert.equal(res.body[ 0 ].emailSha256, emailHash)
        done()
      })
    })
  })

  describe('#show | GET /api/keys/:id', function () {
    const userKeyMap = {}

    function saveId (userId, done) {
      return function (err, res) {
        assert.isNull(err)
        userKeyMap[ userId ] = res.body.id
        done()
      }
    }

    var admin, user1, user2

    before(function (done) {
      this.timeout(4000)
      agency.admin().then(function (agent) {
        admin = agent
        return agency.user()
      }).then(function (agent) {
        user1 = agent
        return agency.user()
      }).then(function (agent) {
        user2 = agent
        admin.post(url()).send(makeKey(admin, false)).expect(201).end(saveId(admin.id, function () {
          user1.post(url()).send(makeKey(user1, false)).expect(201).end(saveId(user1.id, function () {
            user2.post(url()).send(makeKey(user2, true)).expect(201).end(saveId(user2.id, done))
          }))
        }))
      }).catch(done)
    })

    it('should return 401 as anon for public key', function (done) {
      anon.get(url(userKeyMap[ user2.id ])).expect(401, done)
    })

    it('should return 404 as user for private key', function (done) {
      user1.get(url(userKeyMap[ admin.id ])).expect(404, done)
    })

    it('should return 200 as user for public key', function (done) {
      user1.get(url(userKeyMap[ user2.id ])).expect(200)
        .end(function (err, res) {
          assert.isNull(err)
          assert.isUndefined(res.body.private_key)
          // assert.isUndefined(res.body.destroyMe)
          done()
        })
    })

    it('should return 200 as user for own key', function (done) {
      user1.get(url(userKeyMap[ user1.id ])).expect(200, done)
    })

    it('should return 404 as admin for private key', function (done) {
      admin.get(url(userKeyMap[ user1.id ])).expect(404, done)
    })

    it('should return 200 as admin for public key', function (done) {
      admin.get(url(userKeyMap[ user2.id ])).expect(200)
        .end(function (err, res) {
          assert.isNull(err)
          assert.isUndefined(res.body.private_key)
          // assert.isUndefined(res.body.destroyMe)
          done()
        })
    })

    it('should return 200 as admin for own key', function (done) {
      admin.get(url(userKeyMap[ admin.id ])).expect(200, done)
    })
  })
})
