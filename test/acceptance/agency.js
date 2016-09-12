/* eslint-env mocha */
'use strict'

const _ = require('lodash')
const emailParser = require('./../test-helpers/email')
const uuid = require('node-uuid')
const request = require('supertest-as-promised')
const ctx = require('./bootstrap')
const co = require('co')

const defaultAgency = new Agency()
module.exports = defaultAgency
module.exports.Agency = Agency

function nextAgentNr () {
  return uuid.v4().substring(0, 8)
}

function Agency (app) {
  return {
    anon: createFactory(app),
    guest: createFactory(app, { prefix: 'guest', signup: true, confirm: true }),
    user: createFactory(app, { prefix: 'user', login: true, key: true }),
    admin: createFactory(app, { prefix: 'admin', login: true, key: true, admin: true })
  }
}

function createFactory (app, defaultOptions) {
  return function (options) {
    app = app || ctx.http
    defaultOptions = defaultOptions || {}
    options = _.assign(defaultOptions, options)

    return new Promise(function (resolve) {
      resolve(createAgent(app, options.prefix || 'agent'))
    }).then(function (agent) {
      if (options.signup || options.login) {
        return agent.signup()
      }
      return agent
    }).then(function (agent) {
      if (options.confirm || options.login) {
        return co(agent.confirm())
      }
      return agent
    }).then(function (agent) {
      if (options.login) {
        return agent.login()
      }
      return agent
    }).then(function (agent) {
      if (options.key) {
        return agent.generateKey()
      }
      return agent
    }).then(function (agent) {
      // if (options.admin) {
      //   return agent.role('admin')
      // }
      return agent
    })
  }
}

function createAgent (app, prefix) {
  const agentNr = nextAgentNr()
  const agent = request.agent(app)
  agent.email = `${prefix}-${agentNr}@example.com`
  agent.username = agent.email
  agent.password = `password${agentNr}`
  agent.signup = signup.bind(agent)
  agent.login = login.bind(agent)
  agent.logout = logout.bind(agent)
  agent.generateKey = generateKey.bind(agent)
  agent.prefix = prefix
  agent.role = prefix
  agent.confirm = confirm.bind(agent)
  agent.getEmail = getEmail.bind(agent)
  // agent.role = role.bind(agent)
  return agent
}

function signup () {
  const self = this
  return new Promise(function (resolve, reject) {
    const data = {
      email: self.email,
      password: self.password
    }
    self.post('/api/users')
      .send(data)
      .end(function (err, res) {
        if (err) return reject(err)
        self.id = res.body.id
        self.emailSha256 = res.body.email_sha256
        return resolve(self)
      })
  })
}

function login () {
  const self = this
  return new Promise(function (resolve, reject) {
    const data = {
      identifier: self.email,
      password: self.password
    }
    self.post('/auth/local')
      .send(data)
      .expect(200)
      .end(function (err, res) {
        if (err) return reject(err)
        return resolve(self)
      })
  })
}

function logout () {
  const self = this
  return new Promise(function (resolve, reject) {
    self.post('/auth/logout')
      .end(function (err) {
        if (err) return reject(err)
        return resolve(self)
      })
  })
}

function generateKey () {
  const self = this
  return new Promise(function (resolve, reject) {
    const data = {
      is_public: true,
      private_key: 'BEGIN PRIVATE KEY...',
      public_key: 'BEGIN PUBLIC KEY...'
    }
    self.post('/api/keys')
      .send(data)
      .end(function (err) {
        if (err) return reject(err)
        return resolve(self)
      })
  })
}

function * getEmail () {
  const email = yield emailParser.getEmail(use('Config').get('mail.log.toPath'), 'recent')
  return email
}

function * confirm () {
  const email = yield this.getEmail()
  const token = email.textBody.match(/\/activate\/([a-z0-9\-].*)/i)[ 1 ]
  yield this.post('/api/users/confirm')
    .send({ token: token })
    .expect(200)
  return this
}
