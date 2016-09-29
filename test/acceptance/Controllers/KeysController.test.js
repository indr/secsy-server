/**
 * Copyright 2016 Reto Inderbitzin
 */
/* eslint-env mocha */
'use strict'

const assert = require('chai').assert
const context = require('../../contexts').acceptance
const sha = require('sha.js')
const utils = require('./../../test-helpers/utils')
const uuid = require('node-uuid')

require('co-mocha')

context('Acceptance | Controller | KeysController', function () {
  let Env

  before(function * () {
    Env = use('Env')
  })

  function url (id) {
    return !id ? '/api/keys' : '/api/keys/' + id
  }

  function makeKey (agent, isPublic) {
    return {
      email_sha256: utils.sha256(agent.email, Env.get('HASH_SALT')),
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

  function assert201 (res, agent, isPublic) {
    const key = res.body
    assert.lengthOf(key.id, 36)
    // assert.closeTo(new Date(key.created_at).getTime(), new Date().getTime(), 1200)
    // assert.equal(key.updated_at, key.created_at)
    assert.equal(key.email_sha256, agent.emailSha256)

    assertKey(key, makeKey(agent, isPublic))
  }

  let anon
  before(function () {
    return agency.anon().then((agent) => {
      anon = agent
    })
  })

  describe('#store | POST /api/keys', function () {
    let anon, user1, user2, admin
    before(function * () {
      this.timeout(4000)
      anon = yield agency.anon()
      user1 = yield agency.user({ key: false, sync_enabled: true })
      user2 = yield agency.user({ key: false, sync_enabled: false })
      admin = yield agency.admin({ key: false })
    })

    describe('given user has no key', function () {
      it('anon: should return 401', function () {
        return anon.post(url()).send(makeKey(anon)).expect(401)
      })

      it('user: should return 201 with is_public true', function () {
        return user1.post(url()).send(makeKey(user1)).expect(201).then((res) => {
          assert201(res, user1, true)
        })
      })

      it('user: should return 201 with is_public false', function () {
        return user2.post(url()).send(makeKey(user2)).expect(201).then((res) => {
          assert201(res, user2, false)
        })
      })

      it('admin: should return 201', function () {
        return admin.post(url()).send(makeKey(admin)).expect(201).then((res) => {
          assert201(res, admin, true)
        })
      })
    })

    describe('given user has already a key', function () {
      // There must be a better way to accomplish this
      let agents = [ 'user1', 'user2', 'admin' ]
      before(function () {
        agents.user1 = user1
        agents.user2 = user2
        agents.admin = admin
      })

      agents.forEach(function (role) {
        it(role + ': should return 201 and create a new key id', function () {
          let agent = agents[ role ]
          let keyId
          return agent.post(url()).send(makeKey(agent)).expect(201).then((res) => {
            assert201(res, agent, agent.options.sync_enabled)
            keyId = res.body.id
          }).then(() => {
            return agent.post(url()).send(makeKey(agent)).expect(201)
          }).then((res) => {
            assert201(res, agent, agent.options.sync_enabled)
            assert.notEqual(res.body.id, keyId)
          })
        })
      })
    })
  })

  describe('#patch | PATCH /api/keys/my', function () {
    let user, user1, user2, keyId1, keyId2

    before(function * () {
      user1 = user = yield agency.user({ sync_enabled: true })
      user2 = yield agency.user({ sync_enabled: false })
      keyId1 = (yield user1.post(url()).send(makeKey(user1, true)).expect(201)).body.id
      keyId2 = (yield user2.post(url()).send(makeKey(user2, true)).expect(201)).body.id
    })

    it('should return 401', function * () {
      const anon = yield agency.anon()
      yield anon.patch(url(keyId1))
        .expect(401)
    })

    it('should return 403 for unknown key id', function * () {
      yield user.patch(url(uuid.v4()))
        .send({ private_key: 'NEW PRIVATE', public_key: 'NEW PUBLIC' })
        .expect(403)
    })

    it('should return 403 for not owned key', function * () {
      yield user.patch(url(keyId2))
        .send({ private_key: 'NEW PRIVATE', public_key: 'NEW PUBLIC' })
        .expect(403)
    })

    it('should return 400 with invalid public_key or private_key', function * () {
      var res = yield user.patch(url(keyId1))
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

    it('should return 200 and key with is_public true', function * () {
      const res = yield user1.patch(url(keyId1))
        .send({ private_key: 'NEW PRIVATE', public_key: 'NEW PUBLIC' })
        .expect(200)

      delete res.body.id
      assert.deepEqual(res.body, {
        email_sha256: user1.emailSha256,
        is_public: true,
        public_key: 'NEW PUBLIC',
        private_key: 'NEW PRIVATE'
      })
    })

    it('should return 200 and key with is_public false', function * () {
      const res = yield user2.patch(url(keyId2))
        .send({ private_key: 'NEW PRIVATE', public_key: 'NEW PUBLIC' })
        .expect(200)

      delete res.body.id
      assert.deepEqual(res.body, {
        email_sha256: user2.emailSha256,
        is_public: false,
        public_key: 'NEW PUBLIC',
        private_key: 'NEW PRIVATE'
      })
    })
  })

  describe('#index', function () {
    var user1, user2, user3

    before(function * () {
      this.timeout(4000)
      user1 = yield agency.user({ sync_enabled: false })
      user2 = yield agency.user({ sync_enabled: true })
      user3 = yield agency.user({ sync_enabled: true })
      yield user1.post(url()).send(makeKey(user1, false)).expect(201)
      yield user2.post(url()).send(makeKey(user2, true)).expect(201)
      yield user3.post(url()).send(makeKey(user3, true)).expect(201)
    })

    describe('GET /api/keys', function () {
      it('should return 401', function * () {
        anon.get(url())
          .expect(401)
      })

      it('should return 400 given not queried with valid hash', function * () {
        const res = yield user2.get(url())
          .expect(400)

        assert.deepEqual(res.body, {
          status: 400,
          message: 'Validation failed',
          fields: [
            { field: 'h', message: 'required validation failed on h', validation: 'required' },
            { field: 'h', message: 'email_hash validation failed on h', validation: 'email_hash' }
          ]
        })
      })
    })

    describe('GET /api/keys?h=', function () {
      it('should return 401', function * () {
        yield anon.get(url()).query('h=' + user2.emailSha256)
          .expect(401)
      })

      it('should return 403 if user does not sync', function * () {
        yield user1.get(url()).query('h=' + user2.emailSha256)
          .expect(403)
      })

      it('should return 200 for unknown key', function * () {
        const hash = sha('sha256').update('unknown').digest('hex')
        const res = yield user2.get(url()).query('h=' + hash)
          .expect(200)

        assert.lengthOf(res.body, 0)
      })

      it('should return 200 for own key', function * () {
        const res = yield user2.get(url()).query('h=' + user2.emailSha256)
          .expect(200)

        assert.equal(res.body[ 0 ].email_sha256, user2.emailSha256)
        assert.isUndefined(res.body[ 0 ].private_key)
      })

      it('should return 200 for others if public', function * () {
        const res = yield user2.get(url()).query('h=' + user3.emailSha256)
          .expect(200)

        assert.equal(res.body[ 0 ].email_sha256, user3.emailSha256)
        assert.isUndefined(res.body[ 0 ].private_key)
      })

      it('should return 200 and empty result for others if non public', function * () {
        const res = yield user2.get(url()).query('h=' + user1.emailSha256)
          .expect(200)

        assert.lengthOf(res.body, 0)
      })
    })
  })

  describe('#show | GET /api/keys/:id', function () {
    const userKeyMap = {}
    var user1, user2, user3

    before(function * () {
      this.timeout(4000)
      let res

      user1 = yield agency.user({ sync_enabled: false })
      user2 = yield agency.user({ sync_enabled: true })
      user3 = yield agency.user({ sync_enabled: true })

      res = yield user1.post(url()).send(makeKey(user1, false)).expect(201)
      userKeyMap[ user1.emailSha256 ] = res.body.id
      res = yield user2.post(url()).send(makeKey(user2, true)).expect(201)
      userKeyMap[ user2.emailSha256 ] = res.body.id
      res = yield user3.post(url()).send(makeKey(user3, true)).expect(201)
      userKeyMap[ user3.emailSha256 ] = res.body.id
    })

    it('should return 401', function * () {
      yield anon.get(url(userKeyMap[ user2.emailSha256 ]))
        .expect(401)
    })

    it('should return 403 if user does not sync', function * () {
      const res = yield user1.get(url(userKeyMap[ user2.emailSha256 ]))
        .expect(403)

      assert.deepEqual(res.body, {
        status: 403,
        message: 'sync-disabled'
      })
    })

    it('should return 404 for unknown key', function * () {
      yield user2.get(url(uuid.v4()))
        .expect(404)
    })

    it('should return 200 for own key', function * () {
      const res = yield user1.get(url(userKeyMap[ user1.emailSha256 ]))
        .expect(200)

      assert.equal(res.body.id, userKeyMap[ user1.emailSha256 ])
      assert.property(res.body, 'private_key')
    })

    it('should return 200 with id "my" as user', function * () {
      const res = yield user1.get(url('my'))
        .expect(200)

      assert.equal(res.body.id, userKeyMap[ user1.emailSha256 ])
      assert.property(res.body, 'private_key')
    })

    it('should return 200 for others if public', function * () {
      const res = yield user2.get(url(userKeyMap[ user3.emailSha256 ]))
        .expect(200)

      assert.equal(res.body.id, userKeyMap[ user3.emailSha256 ])
      assert.isUndefined(res.body.private_key)
    })

    it('should return 404 for others if non public', function * () {
      user2.get(url(userKeyMap[ user1.emailSha256 ]))
        .expect(404)
    })
  })
})
