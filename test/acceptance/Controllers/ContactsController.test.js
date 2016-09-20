/**
 * Copyright 2016 Reto Inderbitzin <mail@indr.ch>
 */
/* eslint-env mocha */
/* global dateTimeRegex */
'use strict'

const _ = require('lodash')
const assert = require('chai').assert
const agency = require('./../agency')
require('co-mocha')

describe('Acceptance | Controller | ContactsController', function () {
  function url (id) {
    return !id ? '/api/contacts' : '/api/contacts/' + id
  }

  function makeContact (encrypted_) {
    return {
      encrypted_: encrypted_ || 'cypher'
    }
  }

  describe('#store | POST /api/contacts', function () {
    let user

    before(function * () {
      user = yield agency.user()
    })

    it('should return 401', function (done) {
      agency.anon().then((agent) => {
        agent.post(url()).send(makeContact())
          .expect(401, done)
      })
    })

    it('should return 400 with invalid encrypted_', function * () {
      yield user.post('/api/contacts')
        .expect(400)
    })

    it('should return 201 and contact as user', function (done) {
      user.post('/api/contacts')
        .send(makeContact())
        .expect(201)
        .end(function (err, res) {
          assert.isNull(err)
          const contact = res.body

          assert.lengthOf(contact.id, 36)

          assert.match(contact.created_at, dateTimeRegex)
          assert.closeTo(new Date(contact.created_at).getTime(), new Date().getTime(), 1200)
          assert.match(contact.updated_at, dateTimeRegex)
          assert.equal(contact.updated_at, contact.created_at)
          assert.equal(contact.owned_by, user.id)
          assert.isFalse(contact.me)
          assert.equal(contact.encrypted_, 'cypher')
          done()
        })
    })
  })

  let anon, user, admin

  before(function () {
    return agency.anon().then((agent) => {
      anon = agent
    }).then(() => {
      return agency.user()
    }).then((agent) => {
      user = agent
      return agent.post(url()).send(makeContact()).then((res) => {
        agent.contacts = [ res.body.id ]
      })
    }).then(() => {
      return agency.admin()
    }).then((agent) => {
      admin = agent
      return agent.post(url()).send(makeContact()).then((res) => {
        agent.contacts = [ res.body.id ]
      })
    })
  })

  describe('#index | GET /api/contacts', function () {
    it('should return 403 as anon', function (done) {
      anon.get('/api/contacts')
        .expect(401, done)
    })

    it('should return only own contacts as user', function (done) {
      user.get('/api/contacts')
        .expect(200)
        .end(function (err, res) {
          assert.isNull(err)
          assert.lengthOf(res.body, _.filter(res.body, { owned_by: user.id }).length)
          assert.lengthOf(_.filter(res.body, { me: true }), 1)
          assert.match(res.body[ 0 ].created_at, dateTimeRegex)
          assert.match(res.body[ 0 ].updated_at, dateTimeRegex)
          done()
        })
    })

    it('should return only own contacts as admin', function (done) {
      admin.get('/api/contacts')
        .expect(200)
        .end(function (err, res) {
          assert.isNull(err)
          assert.lengthOf(res.body, _.filter(res.body, { owned_by: admin.id }).length)
          assert.lengthOf(_.filter(res.body, { me: true }), 1)
          assert.match(res.body[ 0 ].created_at, dateTimeRegex)
          assert.match(res.body[ 0 ].updated_at, dateTimeRegex)
          done()
        })
    })
  })

  describe('#show | GET /api/contacts/:id', function () {
    it('should return 401 as anon', function () {
      return anon.get(url(user.contacts[ 0 ])).expect(401)
    })

    it('should return 404 as user for others contact', function () {
      return user.get(url(admin.contacts[ 0 ])).expect(404)
    })
    it('should return 404 as admin for others contact', function () {
      return admin.get(url(user.contacts[ 0 ])).expect(404)
    })

    it('should return 200 as user for own contact', function () {
      return user.get(url(user.contacts[ 0 ])).expect(200).then((res) => {
        assert.equal(res.body.id, user.contacts[ 0 ])
        assert.match(res.body.created_at, dateTimeRegex)
        assert.match(res.body.updated_at, dateTimeRegex)
      })
    })
    it('should return 200 as admin for own contact', function () {
      return admin.get(url(admin.contacts[ 0 ])).expect(200).then((res) => {
        assert.equal(res.body.id, admin.contacts[ 0 ])
        assert.match(res.body.created_at, dateTimeRegex)
        assert.match(res.body.updated_at, dateTimeRegex)
      })
    })
  })

  describe('#update | PUT /api/contacts/:id', function () {
    it('should return 401 as anon', function () {
      return anon.put(url(user.contacts[ 0 ])).send(makeContact('updated')).expect(401)
    })

    it('should return 400 with invalid encrypte_', function * () {
      yield user.put(url(user.contacts[ 0 ]))
        .expect(400)
    })

    it('should return 404 as user for others contact', function () {
      return user.put(url(admin.contacts[ 0 ])).send(makeContact('updated')).expect(404)
    })

    it('should return 404 as admin for others contact', function () {
      return admin.put(url(user.contacts[ 0 ])).send(makeContact('updated')).expect(404)
    })

    it('should return 200 as user for own contact', function () {
      return user.put(url(user.contacts[ 0 ])).send(makeContact('updated')).expect(200)
    })

    it('should return 200 as admin for own contact', function () {
      return admin.put(url(admin.contacts[ 0 ])).send(makeContact('updated')).expect(200)
    })
  })

  describe('#destroy | DELETE /api/contacts/:id', function () {
    it('should return 401 as anon', function () {
      return anon.delete(url(user.contacts[ 0 ])).expect(401)
    })

    it('should return 404 as user for others contact', function () {
      return user.delete(url(admin.contacts[ 0 ])).expect(404)
    })
    it('should return 404 as admin for others contact', function () {
      return admin.delete(url(user.contacts[ 0 ])).expect(404)
    })

    it('should return 200 as user for own contact', function () {
      return user.delete(url(user.contacts[ 0 ])).expect(200)
    })
    it('should return 200 as admin for own contact', function () {
      return admin.delete(url(admin.contacts[ 0 ])).expect(200)
    })
  })
})
