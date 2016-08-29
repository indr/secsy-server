/**
 * Copyright 2016 Reto Inderbitzin <mail@indr.ch>
 */
/* eslint-env mocha */
'use strict'

const assert = require('chai').assert
const agency = require('./../agency')

describe('Acceptance | Controller | ContactsController', function () {
  function url (id) {
    return !id ? '/api/contacts' : '/api/contacts/' + id
  }

  function contact () {
    return {
      encrypted_: 'cypher'
    }
  }

  describe('#store | POST /api/contacts', function () {
    it('should return 401 as anon', function (done) {
      agency.anon().then((agent) => {
        agent.post(url()).send(contact())
          .expect(401, done)
      })
    })

    it('should return 201 and contact as user', function (done) {
      agency.user().then((user) => {
        user.post('/api/contacts')
          .send(contact())
          .expect(201)
          .end(function (err, res) {
            assert.isNull(err)
            const contact = res.body

            assert.lengthOf(contact.id, 36)
            assert.closeTo(new Date(contact.created_at).getTime(), new Date().getTime(), 1200)
            assert.equal(contact.updated_at, contact.created_at)
            assert.equal(contact.user_id, user.id)
            assert.isFalse(contact.me)
            assert.equal(contact.encrypted_, 'cypher')
            done()
          })
      })
    })
  })
})
