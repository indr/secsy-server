'use strict'

/* eslint-env mocha */

const assert = require('chai').assert
const setup = require('./../setup')
const sha = require('sha.js')
require('co-mocha')

describe('Integration | Service | Hash', function () {
  let Env, sut, sha256

  before(function * () {
    yield setup.loadProviders()
    yield setup.start()

    Env = use('Env')
    sut = use('App/Services/Hash')
    sha256 = function (value) {
      return sha('sha256').update(value).digest('hex')
    }
  })

  describe('sha256', function () {
    it('should create hash with env HASH_SALT', function () {
      const salt = Env.get('HASH_SALT')
      assert.lengthOf(salt, 32)
      const actual = sut.sha256.make('value')

      assert.equal(actual, sha256(salt + 'value'))
    })

    it('should create hash with provided salt', function () {
      const actual = sut.sha256.make('value', 'salt')

      assert.equal(actual, sha256('saltvalue'))
    })

    it('should verify', function () {
      const hash = sut.sha256.make('value')

      assert.isTrue(sut.sha256.verify('value', hash))
      assert.isFalse(sut.sha256.verify('wrong', hash))
    })
  })
})
