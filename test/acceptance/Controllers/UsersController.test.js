/* eslint-env mocha */
'use strict'

const assert = require('chai').assert
const agency = require('./../agency')

describe('Acceptance | Controller | UsersController', function () {
  describe('#store | POST /api/users', function () {
    it('should return 201 and user with lower case email', function (done) {
      agency.anon().then((agent) => {
        agent.post('/api/users')
          .send({ email: agent.email.toUpperCase(), password: agent.password })
          .expect(201)
          .end(function (err, res) {
            assert.isNull(err)
            const user = res.body

            assert.lengthOf(user.id, 36)
            assert.closeTo(new Date(user.created_at).getTime(), new Date().getTime(), 1500)
            assert.equal(user.updated_at, user.created_at)
            assert.equal(user.username, agent.email)
            assert.equal(user.email, agent.email)
            assert.notProperty(user, 'password')
            assert.isDefined(user.email_sha256, 'email_sha265 ist not defined')
            assert.isUndefined(user.private_key, 'private_key is not undefined')
            assert.isUndefined(user.public_key, 'public_key is not undefined')
            done()
          })
      }).catch(done)
    })

    it('should return 400 with empty email', function (done) {
      agency.anon().then((agent) => {
        agent.post('/api/users')
          .send({ email: '', password: agent.password })
          .expect(400, done)
      })
    })

    it('should return 400 with empty password', function (done) {
      agency.anon().then((agent) => {
        agent.post('/api/users')
          .send({ email: agent.email, password: '' })
          .expect(400, done)
      })
    })

    it('should return 400 if email already taken', function (done) {
      agency.anon().then((agent) => {
        agent.post('/api/users')
          .send({ email: agent.email, password: agent.password })
          .expect(201, function () {
            agent.post('/api/users')
              .send({ email: agent.email, password: agent.password })
              .expect(400, [ {
                field: 'username',
                validation: 'unique',
                message: 'username has already been taken by someone else'
              }, {
                field: 'email',
                validation: 'unique',
                message: 'email has already been taken by someone else'
              } ], done)
          })
      })
    })
  })

  describe('#me | GET /api/users/me', function () {
    it('should return 401 as anon', function (done) {
      agency.anon().then((agent) => {
        agent.get('/api/users/me')
          .expect(401, done)
      })
    })

    it('should return 200 as user', function (done) {
      agency.user().then((agent) => {
        agent.get('/api/users/me')
          .expect(200, function (err, res) {
            assert.isNull(err)
            const user = res.body
            assert.equal(user.id, agent.id)
            assert.isDefined(user.email_sha256, 'email_sha265 ist not defined')
            assert.isDefined(user.private_key, 'private_key is not defined')
            assert.isDefined(user.public_key, 'public_key is not defined')
            done()
          })
      })
    })

    it('should return 200 as admin', function (done) {
      agency.admin().then((agent) => {
        agent.get('/api/users/me')
          .expect(200, function (err, res) {
            assert.isNull(err)
            const user = res.body
            assert.equal(user.id, agent.id)
            assert.isDefined(user.email_sha256, 'email_sha265 ist not defined')
            assert.isDefined(user.private_key, 'private_key is not defined')
            assert.isDefined(user.public_key, 'public_key is not defined')
            done()
          })
      })
    })
  })
})
