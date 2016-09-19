/* eslint-env mocha */
/* global dateTimeRegex */
'use strict'

const assert = require('chai').assert
const agency = require('./../agency')
const uuid = require('node-uuid')
require('co-mocha')

describe('Acceptance | Controller | UsersController', function () {
  describe('#store | POST /api/users', function () {
    it('should return 201 and user with lower case email', function (done) {
      agency.anon().then((agent) => {
        agent.post('/api/users')
          .send({
            email: agent.email.toUpperCase(),
            password: agent.password,
            locale: 'de-ch',
            sync_enabled: true
          })
          .expect(201)
          .end(function (err, res) {
            assert.isNull(err)
            const user = res.body

            assert.lengthOf(user.id, 36)
            assert.match(user.created_at, dateTimeRegex)
            assert.closeTo(new Date(user.created_at).getTime(), new Date().getTime(), 1500)
            assert.match(user.updated_at, dateTimeRegex)
            assert.equal(user.updated_at, user.created_at)
            assert.equal(user.username, agent.email)
            assert.equal(user.email, agent.email)
            assert.equal(user.locale, 'de-CH')
            assert.equal(user.sync_enabled, true)
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
              .expect(400, {
                status: 400,
                message: 'Validation failed',
                fields: [ {
                  field: 'username',
                  validation: 'unique',
                  message: 'username has already been taken by someone else'
                }, {
                  field: 'email',
                  validation: 'unique',
                  message: 'email has already been taken by someone else'
                } ]
              }, done)
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
      agency.user({ sync_enabled: true }).then((agent) => {
        agent.get('/api/users/me')
          .expect(200, function (err, res) {
            assert.isNull(err)
            const user = res.body
            assert.equal(user.id, agent.id)
            assert.match(user.created_at, dateTimeRegex)
            assert.match(user.updated_at, dateTimeRegex)
            assert.equal(user.locale, 'en-US')
            assert.equal(user.sync_enabled, true)
            assert.lengthOf(user.hash_salt, 32)
            assert.isDefined(user.email_sha256, 'email_sha265 ist not defined')
            assert.isDefined(user.private_key, 'private_key is not defined')
            assert.isDefined(user.public_key, 'public_key is not defined')
            done()
          })
      })
    })

    it('should return 200 as admin', function (done) {
      agency.admin({ sync_enabled: false }).then((agent) => {
        agent.get('/api/users/me')
          .expect(200, function (err, res) {
            assert.isNull(err)
            const user = res.body
            assert.equal(user.id, agent.id)
            assert.match(user.created_at, dateTimeRegex)
            assert.match(user.updated_at, dateTimeRegex)
            assert.equal(user.locale, 'en-US')
            assert.equal(user.sync_enabled, false)
            assert.lengthOf(user.hash_salt, 32)
            assert.isDefined(user.email_sha256, 'email_sha265 ist not defined')
            assert.isDefined(user.private_key, 'private_key is not defined')
            assert.isDefined(user.public_key, 'public_key is not defined')
            done()
          })
      })
    })
  })

  describe('#confirm | POST /api/users/confirm', function () {
    let agent

    beforeEach(function * () {
      agent = yield agency.anon()
    })

    it('should return 400 with invalid token', function * () {
      yield agent.post('/api/users/confirm')
        .expect(400)
    })

    it('should return 404 with unknown token', function * () {
      yield agent.post('/api/users/confirm')
        .send({ token: uuid.v4() })
        .expect(404)
    })

    it('should return 200 with valid token', function * () {
      yield agent.signup()
      const email = yield agent.getEmail()
      // TODO: Use agent.getRecentToken()
      const token = email.textBody.match(/\/activate\/([a-z0-9\-].*)/i)[ 1 ]
      yield agent.post('/api/users/confirm')
        .send({ token })
        .expect(200)
    })
  })

  describe('#resend | POST /api/users/resend', function () {
    let agent

    beforeEach(function * () {
      agent = yield agency.anon()
      yield agent.signup()
    })

    it('should return 400 with invalid email', function * () {
      const res = yield agent.post('/api/users/resend')
        .expect(400)

      assert.deepEqual(res.body, {
        status: 400,
        message: 'Validation failed',
        fields: [
          { field: 'email', message: 'required validation failed on email', validation: 'required' }
        ]
      })
    })

    it('should return 404 with unknown email', function * () {
      const res = yield agent.post('/api/users/resend')
        .send({ email: 'unknown@example.com' })
        .expect(404)

      assert.deepEqual(res.body, { status: 404, message: 'email-not-found' })
    })

    it('should return 404 with for confirmed user email', function * () {
      yield agent.confirm()

      const res = yield agent.post('/api/users/resend')
        .send({ email: agent.email })
        .expect(404)

      assert.deepEqual(res.body, { status: 404, message: 'email-not-found' })
    })

    it('should return 200 for unconfirmed user email', function * () {
      const res = yield agent.post('/api/users/resend')
        .send({ email: agent.email.toUpperCase() })
        .expect(200)

      assert.deepEqual(res.body, { status: 200 })
    })
  })

  describe('#forgot | POST /api/users/forgot-password', function () {
    const url = '/api/users/forgot-password'
    let agent

    beforeEach(function * () {
      agent = yield agency.user()
      yield agent.logout()
    })

    it('should return 400 with invalid email', function * () {
      const res = yield agent.post(url)
        .expect(400)

      assert.deepEqual(res.body, {
        status: 400,
        message: 'Validation failed',
        fields: [
          { field: 'email', message: 'required validation failed on email', validation: 'required' }
        ]
      })
    })

    it('should return 404 with unknown email', function * () {
      const res = yield agent.post(url)
        .send({ email: 'unknown@example.com' })
        .expect(404)

      assert.deepEqual(res.body, { status: 404, message: 'email-not-found' })
    })

    it('should return 200', function * () {
      const res = yield agent.post(url)
        .send({ email: agent.email.toUpperCase() })
        .expect(200)

      assert.deepEqual(res.body, { status: 200 })
    })
  })

  describe('#reset | POST /api/users/reset-password', function () {
    const url = '/api/users/reset-password'
    let agent, token

    beforeEach(function * () {
      agent = yield agency.user()
      yield agent.logout()
      yield agent.forgotPassword()
      token = yield agent.getRecentToken()
    })

    it('should return 400 with invalid token', function * () {
      const res = yield agent.post(url)
        .send({ password: 'newSecret1234$' })
        .expect(400)

      assert.deepEqual(res.body, {
        status: 400,
        message: 'Validation failed',
        fields: [
          { field: 'token', validation: 'required', message: 'required validation failed on token' }
        ]
      })
    })

    it('should return 400 with invalid password', function * () {
      console.log('length', token.length)
      const res = yield agent.post(url)
        .send({ token: token })
        .expect(400)

      assert.deepEqual(res.body, {
        status: 400,
        message: 'Validation failed',
        fields: [
          { field: 'password', validation: 'required', message: 'required validation failed on password' }
        ]
      })
    })

    it('should return 400 with weak password', function * () {
      const res = yield agent.post(url)
        .send({ token: token, password: 'weak' })
        .expect(400)

      assert.deepEqual(res.body, {
        status: 400,
        message: 'Validation failed',
        fields: [
          { field: 'password', validation: 'password', message: 'password validation failed on password' }
        ]
      })
    })

    it('should return 200', function * () {
      const res = yield agent.post(url)
        .send({ token: token, password: 'newSecret1234$' })
        .expect(200)

      assert.deepEqual(res.body, { status: 200 })
    })
  })

  describe('#delete | DELETE /api/users/me', function () {
    const url = '/api/users/me'
    let user

    beforeEach(function * () {
      user = yield agency.user()
    })

    it('should return 400 given password is wrong', function * () {
      const res = yield user.delete(url)
        .send({ password: 'wrong password' })
        .expect(400)

      assert.deepEqual(res.body, {
        status: 400,
        message: 'invalid-password'
      })
    })

    it('should return 200', function * () {
      const res = yield user.delete(url)
        .send({ password: user.password, message: 'Just cause' })
        .expect(200)

      assert.deepEqual(res.body, { status: 200 })
    })
  })

  describe('#update | PATCH /api/users/me', function () {
    const url = '/api/users/me'
    let user

    beforeEach(function * () {
      user = yield agency.user()
    })

    it('should return 400 with invalid locale', function * () {
      const res = yield user.patch(url)
        .send({ locale: 'invalid' })
        .expect(400)

      assert.deepEqual(res.body, {
        status: 400,
        message: 'Validation failed',
        fields: [
          { field: 'locale', message: 'regex validation failed on locale', validation: 'regex' }
        ]
      })
    })

    it('should return 200', function * () {
      const res = yield user.patch(url)
        .send({ locale: 'en-US' })
        .expect(200)

      assert.deepEqual(res.body, { status: 200 })
    })
  })
})
