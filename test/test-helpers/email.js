'use strict'

/*
 |--------------------------------------------------------------------------
 | Email Parser
 |--------------------------------------------------------------------------
 |
 | This parser is used under tests to assert emails written to log file.
 |
 | https://github.com/adonisjs/adonis-rally/blob/c7378d2c3984bffba1049f50e771318ea447107c/tests/parsers/email.js
 */

const _ = require('lodash')
const assert = require('chai').assert
const fs = require('co-fs')
const MailParser = require('mailparser').MailParser

class MailBody {

  constructor () {
    this.parsedMail = null
  }

  /**
   * returns parsed email to
   *
   * @return {Array}
   *
   * @public
   */
  get to () {
    return this.parsedMail.to
  }

  /**
   * returns parsed email from
   *
   * @return {Array}
   *
   * @public
   */
  get from () {
    return this.parsedMail.from
  }

  get subject () {
    return this.parsedMail.subject
  }

  /**
   * retruns parsed email body
   *
   * @return {String}
   *
   * @public
   */
  get htmlBody () {
    return this.parsedMail.html
  }

  get textBody () {
    return this.parsedMail.text
  }

  /**
   * parses email body by initiating Mailparser
   * instance and reading email from the
   * stream.
   *
   * @param  {String} body
   *
   * @public
   */
  parseBody (body) {
    return new Promise((resolve, reject) => {
      const mailParser = new MailParser()
      mailParser.on('end', (mail) => {
        this.parsedMail = mail
        resolve()
      })
      mailParser.on('error', reject)
      mailParser.write(body)
      mailParser.end()
    })
  }
}

const emailParser = module.exports = {}

/**
 * returns MailBody instance by parsing mail.eml
 * file and picking a specific email by
 * position.
 *
 * @param  {String} emailFile
 * @param  {String|Number} position
 *
 * @return {Object}
 *
 * @example
 * emailParser.getEmail
 *
 * @public
 */
emailParser.getEmail = function * (emailFile, position, filter) {
  position = position || 'recent'
  const emailContents = yield fs.readFile(emailFile, 'utf8')
  let emailTokens = emailContents.trim().split(/\-\s*EMAIL END\s*-\n\n/g)
  if (filter) {
    emailTokens = _.filter(emailTokens, filter)
  }
  let email = position === 'recent' ? emailTokens[ emailTokens.length - 1 ] : emailTokens[ position - 1 ]

  const emailStartRegex = /\-\s*EMAIL START\s*-/
  assert.match(email, emailStartRegex)
  email = email.replace(emailStartRegex, '').trim()
  const mailBody = new MailBody()
  yield mailBody.parseBody(email)
  return mailBody
}

/**
 * cleans the email log file
 *
 * @param {String} emailFile
 *
 * @throws {Error} If unable to write to file
 *
 * @yield {Boolean}
 */
emailParser.clean = function * (emailFile) {
  return yield fs.writeFile(emailFile, '')
}
