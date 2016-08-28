/* eslint-env mocha */
'use strict'

const assert = require('chai').assert
const supertest = require('supertest')
const ctx = require('./../bootstrap')

describe('Acceptance | Controller | RootController', function () {
  let agent = null

  before(function (done) {
    agent = supertest(ctx.http)
    done()
  })

  function assertFrontPage (lang, done) {
    return function (err, res) {
      assert.isNull(err)
      assert.equal(res.text.match(/<html lang="([^"]+)">/)[ 1 ], lang)
      assert.match(res.text, /<h1 id="homeHeading">/)
      done()
    }
  }

  describe('GET /', function () {
    it('returns front page in english', function (done) {
      agent.get('/')
        .expect(200)
        .end(assertFrontPage('en', done))
    })

    describe('respects accept-language')
    const locales = {
      'en': 'en',
      'en-US': 'en',
      'en-GB': 'en',
      'de': 'de',
      'de-DE': 'de',
      'de-CH': 'de',
      'de-CH,de,en-US,en;q=0.5': 'de'
    }
    Object.keys(locales).forEach((locale) => {
      it(locale + ' -> ' + locales[ locale ], function (done) {
        agent.get('/')
          .set('accept-language', locale)
          .expect(200)
          .end(assertFrontPage(locales[ locale ], done))
      })
    })
  })

  describe('GET /:lang', function () {
    [ 'en', 'de' ].forEach(function (lang) {
      it('supports ' + lang, function (done) {
        agent.get('/' + lang).expect(200)
          .end(assertFrontPage(lang, done))
      })
    })

    it('returns 404 for unsupported languages', function (done) {
      agent.get('/zz').expect(404, done)
    })
  })
})
