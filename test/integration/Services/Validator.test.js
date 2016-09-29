'use strict'

/* eslint-env mocha */

const _ = require('lodash')
const assert = require('chai').assert
const context = require('../../contexts').integration
const sha = require('sha.js')
const uuid = require('node-uuid')

require('co-mocha')

context('Integration | Service | Validator', function () {
  let sut

  before(function * () {
    sut = make('App/Services/Validator')
  })

  describe('Validator emailHash', function () {
    const validEmailHashes = [
      sha('sha256').update('valid').digest('hex')
    ]
    const invalidEmailHashes = [
      0,
      'abc',
      sha('sha256').update('valid').digest('hex') + 'a'
    ]

    it('Raw validator should pass for valid email hashes', function * () {
      assertRawPass('emailHash', validEmailHashes)
    })

    it('Raw validator should fail for invalid email hashes', function * () {
      assertRawFail('emailHash', invalidEmailHashes)
    })

    it('Schema validator should pass for valid email hashes', function * () {
      yield assertSchemaPass('email_hash', validEmailHashes)
    })

    it('Schema validator should fail for invalid email hashes', function * () {
      yield assertSchemaFail('email_hash', invalidEmailHashes)
    })
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

    it('Raw validator should pass for valid passwords', function * () {
      assertRawPass('password', validPasswords)
    })

    it('Raw validator should fail for invalid passwords', function * () {
      assertRawFail('password', invalidPasswords)
    })

    it('Schema validator should pass for valid passwords', function * () {
      yield assertSchemaPass('password', validPasswords)
    })

    it('Schema validator should fail for invalid passwords', function * () {
      yield assertSchemaFail('password', invalidPasswords)
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

    it('Raw validator should pass for valid tokens', function * () {
      assertRawPass('token', validTokens)
    })

    it('Raw validator should fail for invalid tokens', function * () {
      assertRawFail('token', invalidTokens)
    })

    it('Schema validator should pass for valid tokens', function * () {
      yield assertSchemaPass('token', validTokens)
    })

    it('Schema validator should fail for invalid tokens', function * () {
      yield assertSchemaFail('token', invalidTokens)
    })
  })

  function assertRawPass (validator, values) {
    for (let each of values) {
      assert.isTrue(sut.is[ validator ](each), each)
    }
  }

  function assertRawFail (validator, values) {
    for (let each of values) {
      assert.isFalse(sut.is[ validator ](each), each)
    }
  }

  function * assertSchemaPass (field, values) {
    for (let each of values) {
      let validation = yield sut.validate({ field: each }, { field: field })
      assert.isTrue(validation)
    }
  }

  function * assertSchemaFail (field, values) {
    for (let each of values) {
      try {
        yield sut.validate({ field: each }, { field: field })
        assert(false)
      } catch (error) {
        assert.equal(error.name, 'ValidationException', 'Each: ' + each)
        assert.deepEqual(error.fields, [
          { field: 'field', message: `${field} validation failed on field`, validation: field }
        ])
      }
    }
  }

  describe('Sanitazor normalizeLocale', function () {
    describe('Raw sanitazor', function () {
      it('should ignore undefined', function () {
        assert.equal(sut.sanitizor.normalizeLocale(), undefined)
      })

      it('should lower case language code and upper case country code', function () {
        assert.equal(sut.sanitizor.normalizeLocale('EN-us'), 'en-US')
      })
    })

    describe('Schema sanitazor', function () {
      it('should lower case langauge code and upper case country code', function * () {
        const actual = yield sut.sanitize({ locale: 'EN-us' }, { locale: 'normalize_locale' })
        assert.equal(actual.locale, 'en-US')
      })
    })
  })
})
