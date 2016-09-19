/**
 * Copyright 2016 Reto Inderbitzin <mail@indr.ch>
 */
/* eslint-env mocha */
/* global dateTimeRegex */
'use strict'

const assert = require('chai').assert
const agency = require('./../agency')
const utils = require('./../../test-helpers/utils')
const uuid = require('node-uuid')
require('co-mocha')

describe('Acceptance | Controller | UpdatesController', function () {
  let Env

  before(function * () {
    Env = use('Env')
  })

  function url (id) {
    return !id ? '/api/updates' : '/api/updates/' + id
  }

  function makeUpdate (email, encrypted_) {
    return {
      to_email_sha256: utils.sha256(email || '', Env.get('HASH_SALT')),
      encrypted_: encrypted_ === undefined ? 'cypher' : encrypted_
    }
  }

  function postUpdate (sharer, receiver) {
    return new Promise(function (resolve, reject) {
      sharer.post(url()).send(makeUpdate(receiver.email)).end(function (err) {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  function assertUpdates (updates) {
    updates.forEach(assertUpdate)
  }

  function assertUpdate (update) {
    const properties = [ 'updated_at', 'created_by', 'owned_by' ]

    assert.match(update.created_at, dateTimeRegex)
    const keys = Object.keys(update)
    properties.forEach(function (each) {
      assert.notInclude(keys, each)
    })
  }

  let anon, user1, user2, admin, sharer1, sharer2

  before(function () {
    this.timeout(4000)
    return agency.anon().then((agent) => {
      anon = agent
      return agency.user()
    }).then((agent) => {
      user1 = agent
      return agency.user()
    }).then((agent) => {
      user2 = agent
      return agency.admin()
    }).then((agent) => {
      admin = agent
    })
  })

  before(function (done) {
    this.timeout(4000)
    agency.user().then(function (agent) {
      sharer1 = agent
      return agency.admin().then(function (agent) {
        sharer2 = agent
        done()
      })
    })
  })

  describe('#create for non-existing receiver', function () {
    it('should return 401 as anon', function (done) {
      anon.post(url()).send(makeUpdate('123abc')).expect(401, done)
    })

    it('should return 201 and object with an id as user', function (done) {
      user1.post(url()).send(makeUpdate('123abc')).expect(201)
        .end(function (err, res) {
          assert.isNull(err)
          assert.lengthOf(res.body.id, 36)
          assert.deepEqual(res.body, { id: res.body.id })
          done()
        })
    })

    it('should return 201 and object with an id as admin', function (done) {
      admin.post(url()).send(makeUpdate('123abc', '')).expect(201)
        .end(function (err, res) {
          assert.isNull(err)
          assert.lengthOf(res.body.id, 36)
          assert.deepEqual(res.body, { id: res.body.id })
          done()
        })
    })
  })

  describe('#create with empty _encrypted data', function () {
    var receiver
    before(function (done) {
      agency.user().then(function (agent) {
        receiver = agent
        done()
      })
    })

    it('should return 401 as anon', function (done) {
      anon.post(url()).send(makeUpdate(receiver.email, '')).expect(401, done)
    })

    it('should return 201 and object with an id as user', function (done) {
      user1.post(url()).send(makeUpdate(receiver.email, '')).expect(201)
        .end(function (err, res) {
          assert.isNull(err)
          assert.lengthOf(res.body.id, 36)
          assert.deepEqual(res.body, { id: res.body.id })
          done()
        })
    })

    it('should return 201 and object with an id as admin', function (done) {
      admin.post(url()).send(makeUpdate(receiver.email, '')).expect(201)
        .end(function (err, res) {
          assert.isNull(err)
          assert.lengthOf(res.body.id, 36)
          assert.deepEqual(res.body, { id: res.body.id })
          done()
        })
    })
  })

  describe('#create for existing email hash', function () {
    var receiver
    before(function (done) {
      agency.user().then(function (agent) {
        receiver = agent
        done()
      })
    })

    it('should return 401 as anon', function (done) {
      anon.post(url()).send(makeUpdate(receiver.email)).expect(401, done)
    })

    it('should return 201 and object with id as user', function (done) {
      user1.post(url()).send(makeUpdate(receiver.email)).expect(201)
        .end(function (err, res) {
          assert.isNull(err)
          assert.lengthOf(res.body.id, 36)
          assert.deepEqual(res.body, { id: res.body.id })
          done()
        })
    })

    it('should return 201 and object with id as admin', function (done) {
      admin.post(url()).send(makeUpdate(receiver.email)).expect(201)
        .end(function (err, res) {
          assert.isNull(err)
          assert.lengthOf(res.body.id, 36)
          assert.deepEqual(res.body, { id: res.body.id })
          done()
        })
    })

    it('receiver should now have two updates', function (done) {
      receiver.get(url()).expect(200).end(function (err, res) {
        assert.isNull(err)
        assert.lengthOf(res.body, 2)
        assertUpdates(res.body)
        done()
      })
    })
  })

  before(function (done) {
    postUpdate(sharer1, user1).then(function () {
      return postUpdate(sharer1, admin)
    }).then(function () {
      return postUpdate(sharer2, user1)
    }).then(function () {
      return postUpdate(sharer2, user2)
    }).then(done).catch(done)
  })

  var updates = []
  describe('#find', function () {
    it('should return 401 as anon', function (done) {
      anon.get(url()).expect(401, done)
    })

    it('should return 200 and two updates as user', function (done) {
      user1.get(url()).expect(200).end(function (err, res) {
        assert.isNull(err)
        assert.lengthOf(res.body, 2)
        updates[ 0 ] = res.body
        assertUpdates(res.body)
        done()
      })
    })

    it('should return 200 and one update as admin', function (done) {
      admin.get(url()).expect(200).end(function (err, res) {
        assert.isNull(err)
        assert.lengthOf(res.body, 1)
        updates[ 1 ] = res.body
        assertUpdates(res.body)
        done()
      })
    })
  })

  // #show is not active or implemented
  // These tests where necessary with Sails
  // describe.skip('#show', function () {
  //   it('should return 401 as anon for non-existing update', function (done) {
  //     anon.get(url(999)).expect(401, done)
  //   })
  //
  //   it('should return 403 as anon for existing update', function (done) {
  //     anon.get(url(updates[ 0 ][ 0 ].id)).expect(403, done)
  //   })
  //
  //   // TODO: Returns 500 (!)
  //   it.skip('should return 403 as user for non-existing update', function (done) {
  //     user1.get(url(999)).expect(403, done)
  //   })
  //
  //   it('should return 403 as user for foreign update', function (done) {
  //     user1.get(url(updates[ 1 ][ 0 ].id)).expect(403, done)
  //   })
  //
  //   it('should return 200 as user for own update', function (done) {
  //     user1.get(url(updates[ 0 ][ 0 ].id)).expect(200).end(function (err, res) {
  //       assert.isNull(err)
  //       assert.deepEqual(res.body, updates[ 0 ][ 0 ])
  //       done()
  //     })
  //   })
  //
  //   // TODO: Returns 500 (!)
  //   it.skip('should return 403 as admin for non-existing update', function (done) {
  //     admin.get(url(999)).expect(403, done)
  //   })
  //
  //   it('should return 403 as admin for foreign update', function (done) {
  //     admin.get(url(updates[ 0 ][ 0 ].id)).expect(403, done)
  //   })
  //
  //   it('should return 200 as admin for own update', function (done) {
  //     admin.get(url(updates[ 1 ][ 0 ].id)).expect(200).end(function (err, res) {
  //       assert.isNull(err)
  //       assert.deepEqual(res.body, updates[ 1 ][ 0 ])
  //       done()
  //     })
  //   })
  // })

  // #update is not active or implemented
  // These tests where necessary with Sails
  // describe.skip('#update', function () {
  //   it('should return 403 as anon for non-existing update', function (done) {
  //     anon.put(url(9999)).expect(403, done)
  //   })
  //
  //   it('should return 403 as anon for existing update', function (done) {
  //     anon.put(url(updates[ 0 ][ 0 ].id)).expect(403, done)
  //   })
  //
  //   it('should return 403 as user for non-existing update', function (done) {
  //     user1.put(url(9999)).expect(403, done)
  //   })
  //
  //   it('should return 403 as user for foreign update', function (done) {
  //     user1.put(url(updates[ 1 ][ 0 ].id)).expect(403, done)
  //   })
  //
  //   it('should return 403 as user for own update', function (done) {
  //     user1.put(url(updates[ 0 ][ 0 ].id)).expect(403, done)
  //   })
  //
  //   it('should return 403 as admin for non-existing update', function (done) {
  //     admin.put(url(9999)).expect(403, done)
  //   })
  //
  //   it('should return 403 as admin for foreign update', function (done) {
  //     admin.put(url(updates[ 0 ][ 0 ].id)).expect(403, done)
  //   })
  //
  //   it('should return 403 as admin for own update', function (done) {
  //     admin.put(url(updates[ 1 ][ 0 ].id)).expect(403, done)
  //   })
  // })

  describe('#delete', function () {
    it('should return 401 as anon for invalid id', function (done) {
      anon.delete(url(9999)).expect(401, done)
    })

    it('should return 401 as anon for non-existing update', function (done) {
      anon.delete(url(uuid.v4())).expect(401, done)
    })

    it('should return 401 as anon for existing update', function (done) {
      anon.delete(url(updates[ 0 ][ 0 ].id)).expect(401, done)
    })

    it('should return 404 as user for invalid id', function (done) {
      user1.delete(url(9999)).expect(404, done)
    })

    it('should return 404 as user for non-existing update', function (done) {
      user1.delete(url(uuid.v4())).expect(404, done)
    })

    it('should return 404 as user for foreign update', function (done) {
      user1.delete(url()).expect(404, done)
    })

    it('should return 200 as user for own update', function (done) {
      const id = updates[ 0 ][ 1 ].id
      user1.delete(url(id)).expect(200, { id }, done)
    })

    it('should return 404 as admin for invalid id', function (done) {
      admin.delete(url(9999)).expect(404, done)
    })

    it('should return 404 as admin for non-existing update', function (done) {
      admin.delete(url(uuid.v4())).expect(404, done)
    })

    it('should return 404 as admin for foreign update', function (done) {
      admin.delete(url(updates[ 0 ][ 0 ].id)).expect(404, done)
    })

    it('should return 200 as admin for own update', function (done) {
      const id = updates[ 1 ][ 0 ].id
      admin.delete(url(id)).expect(200, { id }, done)
    })
  })
})
