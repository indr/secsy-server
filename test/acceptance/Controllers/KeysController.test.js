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
const uuid = require('node-uuid')
require('co-mocha')

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
    const notProperties = [ 'created_at', 'updated_at', 'owned_by', 'private_key' ]
    notProperties.forEach(function (each) {
      assert.notProperty(actual, each)
    })

    assert.propertyVal(actual, 'email_sha256', expected.email_sha256)
    assert.propertyVal(actual, 'is_public', expected.is_public)
    assert.propertyVal(actual, 'public_key', expected.public_key)
  }

  function assert201 (res, agent) {
    const key = res.body
    assert.lengthOf(key.id, 36)
    // assert.closeTo(new Date(key.created_at).getTime(), new Date().getTime(), 1200)
    // assert.equal(key.updated_at, key.created_at)
    assert.equal(key.email_sha256, agent.emailSha256)

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

  describe('#patch | PATCH /api/keys/my', function () {
    let user

    beforeEach(function * () {
      user = yield agency.user()
      yield user.generateKey()
    })

    it('should return 401', function * () {
      const anon = yield agency.anon()
      yield anon.patch(url('my'))
        .expect(401)
    })

    it('should return 403 with key id not equal "my"', function * () {
      yield user.patch(url(uuid.v4()))
        .expect(403)
    })

    it('should return 400 with invalid public_key or private_key', function * () {
      var res = yield user.patch(url('my'))
        .expect(400)

      assert.deepEqual(res.body, {
        status: 400,
        message: 'Validation failed',
        fields: [
          { field: 'public_key', message: 'required validation failed on public_key', validation: 'required' },
          { field: 'private_key', message: 'required validation failed on private_key', validation: 'required' }
        ]
      })
    })

    it('should return 200 and key', function * () {
      var res = yield user.patch(url('my'))
        .send({ private_key: 'NEW PRIVATE', public_key: 'NEW PUBLIC' })
        .expect(200)

      delete res.body.id
      assert.deepEqual(res.body, {
        email_sha256: user.emailSha256,
        is_public: true,
        public_key: 'NEW PUBLIC',
        private_key: 'NEW PRIVATE'
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
          assert.isOk(_.find(res.body, { email_sha256: user1.emailSha256, is_public: false }),
            util.format('Own not public key for user %s not found', user1.emailSha256, res.body))
          const user2key = _.find(res.body, { email_sha256: user2.emailSha256 })
          assert.isOk(user2key, util.format('Public key for user %s not found', user2.emailSha256, res.body))
          assert.isUndefined(user2key.private_key)
          assert.isTrue(_.every(res.body, function (eachKey) {
            return eachKey.is_public || eachKey.email_sha256 === user1.emailSha256
          }), util.format('Contains non public not belonging to user %s', user1.emailSha256, res.body))
          done()
        })
    })

    it('should return 200 as admin and only public and own keys', function (done) {
      admin.get(url())
        .expect(200)
        .end(function (err, res) {
          assert.isNull(err)
          assert.isAbove(res.body.length, 1)
          assert.isOk(_.find(res.body, { email_sha256: admin.emailSha256, is_public: false }),
            util.format('Own not public key for user %s not found', admin.emailSha256, res.body))
          const user2key = _.find(res.body, { email_sha256: user2.emailSha256 })
          assert.isOk(user2key, util.format('Public key for user %s not found', user2.emailSha256, res.body))
          assert.isUndefined(user2key.private_key)
          assert.isTrue(_.every(res.body, function (eachKey) {
            return eachKey.is_public || eachKey.email_sha256 === admin.emailSha256
          }), util.format('Contains non public not belonging to admin %s', admin.emailSha256, res.body))
          done()
        })
    })
  })

  describe('#index with query | GET /api/keys?h=...', function () {
    var emailHash

    before(function (done) {
      agency.user().then(function (user) {
        user.post(url()).send(makeKey(user, true)).expect(201).end(function (err, res) {
          assert.isNull(err)
          emailHash = res.body.email_sha256
          assert.isDefined(emailHash)
          done()
        })
      }).catch(done)
    })

    it('should return 401 as anon', function (done) {
      anon.get(url()).query('h=' + emailHash).expect(401, done)
    })

    it('should return 200 as user and specified key', function (done) {
      user1.get(url()).query('h=' + emailHash).expect(200).end(function (err, res) {
        assert.isNull(err)
        assert.lengthOf(res.body, 1)
        assert.equal(res.body[ 0 ].email_sha256, emailHash)
        done()
      })
    })

    it('should return 200 as admin and specified key', function (done) {
      admin.get(url()).query('h=' + emailHash).expect(200).end(function (err, res) {
        assert.isNull(err)
        assert.lengthOf(res.body, 1)
        assert.equal(res.body[ 0 ].email_sha256, emailHash)
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
        admin.post(url()).send(makeKey(admin, false)).expect(201).end(saveId(admin.emailSha256, function () {
          user1.post(url()).send(makeKey(user1, false)).expect(201).end(saveId(user1.emailSha256, function () {
            user2.post(url()).send(makeKey(user2, true)).expect(201).end(saveId(user2.emailSha256, done))
          }))
        }))
      }).catch(done)
    })

    it('should return 401 as anon for public key', function (done) {
      anon.get(url(userKeyMap[ user2.emailSha256 ])).expect(401, done)
    })

    it('should return 404 as user for private key', function (done) {
      user1.get(url(userKeyMap[ admin.emailSha256 ])).expect(404, done)
    })

    it('should return 200 as user for public key', function (done) {
      user1.get(url(userKeyMap[ user2.emailSha256 ])).expect(200)
        .end(function (err, res) {
          assert.isNull(err)
          assert.isUndefined(res.body.private_key)
          done()
        })
    })

    it('should return 200 as user for own key', function (done) {
      user1.get(url(userKeyMap[ user1.emailSha256 ])).expect(200, done)
    })

    it('should return 404 as admin for private key', function (done) {
      admin.get(url(userKeyMap[ user1.emailSha256 ])).expect(404, done)
    })

    it('should return 200 as admin for public key', function (done) {
      admin.get(url(userKeyMap[ user2.emailSha256 ])).expect(200)
        .end(function (err, res) {
          assert.isNull(err)
          assert.isUndefined(res.body.private_key)
          done()
        })
    })

    it('should return 200 as admin for own key', function (done) {
      admin.get(url(userKeyMap[ admin.emailSha256 ])).expect(200, done)
    })
  })
})
