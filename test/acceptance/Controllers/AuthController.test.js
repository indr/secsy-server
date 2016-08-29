/* eslint-env mocha */
'use strict'

const assert = require('chai').assert
const agency = require('./../agency')

describe('Acceptance | Controller | AuthController', function () {
  let user, admin

  before((done) => {
    agency.user().then((agent) => {
      user = agent
      return agency.admin()
    }).then((agent) => {
      admin = agent
      done()
    }).catch(done)
  })

  describe('#login | POST /auth/local', function () {
    before((done) => {
      user.logout().then(() => {
        return admin.logout()
      }).then(() => {
        done()
      }).catch(done)
    })

    function assertUser (expected, done) {
      return function (err, res) {
        assert.isNull(err)
        const user = res.body
        assert.lengthOf(user.id, 36)
        assert.equal(user.username, expected.username)
        assert.equal(user.email, expected.email)
        assert.notProperty(user, 'password')
        assert.property(user, 'private_key')
        assert.property(user, 'public_key')
        assert.isAbove(user.private_key.length, 0)
        assert.isAbove(user.public_key.length, 0)
        done()
      }
    }

    it('should return 403 with unknown identifier/email', function (done) {
      agency.anon().then((agent) => {
        agent.post('/auth/local')
          .send({ identifier: 'unknown@example.com', password: 'wrong' })
          .expect(403, done)
      })
    })

    it('should return 403 with invalid password', function (done) {
      agency.anon().then((agent) => {
        agent.post('/auth/local')
          .send({ identifier: 'admin@example.com', password: 'wrong' })
          .expect(403, done)
      })
    })

    it('should return 200 as user', function (done) {
      user.post('/auth/local')
        .send({ identifier: user.email, password: user.password })
        .expect(200)
        .end(assertUser(user, done))
    })

    it('should return 200 as admin', function (done) {
      admin.post('/auth/local')
        .send({ identifier: admin.email, password: admin.password })
        .expect(200)
        .end(assertUser(admin, done))
    })
  })

  describe('#logout | POST /auth/logout', function () {
    before((done) => {
      user.login().then(() => {
        return admin.login()
      }).then(() => {
        done()
      }).catch(done)
    })

    it('should return 200 as anon', function (done) {
      agency.anon().then((agent) => {
        agent.post('/auth/logout')
          .expect(200)
          .end((err, res) => {
            assert.isNull(err)
            agent.post('/auth/logout')
              .expect(200, done)
          })
      })
    })

    it('should return 200 as user', function (done) {
      user.post('/auth/logout')
        .auth(user.email, user.password)
        .expect(200)
        .end((err, res) => {
          assert.isNull(err)
          user.post('/auth/logout')
            .expect(200, done)
        })
    })

    it('should return 200 as admin', function (done) {
      admin.post('/auth/logout')
        .auth(admin.email, admin.password)
        .expect(200)
        .end((err, res) => {
          assert.isNull(err)
          user.post('/auth/logout')
            .expect(200, done)
        })
    })
  })
})
