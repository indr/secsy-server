'use strict'

/* eslint-env mocha */

const _ = require('lodash')
const assert = require('chai').assert
const setup = require('./../setup')
const uuid = require('node-uuid')
require('co-mocha')

describe('Unit | Service | Validator', function () {
  let sut

  before(function * () {
    yield setup.loadProviders()
    yield setup.start()

    sut = make('App/Services/Validator')
  })

  describe('Validator password', function () {
    const validSpecialChars = '`~!@#$%^&*()-_=+[]{};:\'"|\\,.<>?/'

    const validPasswords = _.map(validSpecialChars.split(''), (each) => {
      return 'abcDEF1234' + each
    })
    const invalidPasswords = [
      'tooshort',
      'UPPERCASEONLY',
      'lowercaseonly',
      '1234567890',
      validSpecialChars
    ]

    describe('Raw validator', function () {
      it('should pass for valid passwords', function * () {
        for (let each of validPasswords) {
          assert.isTrue(sut.is.password(each), each)
        }
      })

      it('should fail for invalid passwords', function * () {
        for (let each of invalidPasswords) {
          assert.isFalse(sut.is.password(each), each)
        }
      })
    })

    describe('Schema validator', function () {
      it('should pass for valid passwords', function * () {
        for (let each of validPasswords) {
          let validation = yield sut.validate({ field: each }, { field: 'password' })
          assert.isTrue(validation)
        }
      })

      it('should fail for invalid passwords', function * () {
        for (let each of invalidPasswords) {
          try {
            yield sut.validate({ field: each }, { field: 'password' })
            assert(false)
          } catch (error) {
            assert.equal(error.name, 'ValidationException', each)
            assert.deepEqual(error.fields, [ {
              field: 'field', message: 'password validation failed on field', validation: 'password'
            } ])
          }
        }
      })
    })
  })

  describe('Validator token', function () {
    const validTokens = [
      uuid.v1(),
      uuid.v4(),
      uuid.v4().toUpperCase(),
      uuid.v4().toLowerCase()
    ]
    const invalidTokens = [
      uuid.v4().substr(0, 35),
      uuid.v4() + 'a',
      uuid.v4().replace('-', ''),
      '{' + uuid.v4() + '}'
    ]

    describe('Raw validator', function () {
      it('should pass for valid tokens', function * () {
        for (let each of validTokens) {
          assert.isTrue(sut.is.token(each), each)
        }
      })

      it('should fail for invalid tokens', function * () {
        for (let each of invalidTokens) {
          assert.isFalse(sut.is.token(each), each)
        }
      })
    })

    describe('Schema validator', function () {
      it('should pass for valid tokens', function * () {
        for (let each of validTokens) {
          let validation = yield sut.validate({ field: each }, { field: 'token' })
          assert.isTrue(validation)
        }
      })

      it('should fail for invalid tokens', function * () {
        for (let each of invalidTokens) {
          try {
            yield sut.validate({ field: each }, { field: 'token' })
            assert(false)
          } catch (error) {
            assert.equal(error.name, 'ValidationException', each)
            assert.deepEqual(error.fields, [ {
              field: 'field', message: 'token validation failed on field', validation: 'token'
            } ])
          }
        }
      })
    })
  })
})
