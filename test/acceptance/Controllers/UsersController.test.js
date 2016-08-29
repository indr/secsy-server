/* eslint-env mocha */
'use strict'

const assert = require('chai').assert
const agency = require('./../agency')

describe('Acceptance | Controller | UsersController', function () {
  describe('#signup | POST /api/users', function () {
    it('should return 201', function (done) {
      agency.anon().then((agent) => {
        agent.post('/api/users')
          .send({ email: agent.email, password: agent.password })
          .expect(201)
          .end(function (err, res) {
            assert.isNull(err)
            const user = res.body
            assert.lengthOf(user.id, 36)
            assert.closeTo(new Date(user.created_at).getTime(), new Date().getTime(), 1000)
            assert.equal(user.updated_at, user.created_at)
            assert.isString(user.username)
            assert.isAbove(user.username.length, 0)
            assert.equal(user.email, user.username)
            assert.notProperty(user, 'password')
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
              .expect(400, done)
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
            assert.equal(res.body.id, agent.id)
            done()
          })
      })
    })

    it('should return 200 as admin', function (done) {
      agency.admin().then((agent) => {
        agent.get('/api/users/me')
          .expect(200, function (err, res) {
            assert.isNull(err)
            assert.equal(res.body.id, agent.id)
            done()
          })
      })
    })
  })
})
