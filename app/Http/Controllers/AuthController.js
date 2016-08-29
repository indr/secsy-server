'use strict'

const _ = require('lodash')

class AuthController {

  * login (request, response) {
    const identifier = request.input('identifier')
    const password = request.input('password')

    let login
    try {
      login = yield request.auth.attempt(identifier, password)
    } catch (UserNotFoundException) {
      response.forbidden()
      return
    }

    if (login) {
      const user = yield request.auth.getUser()
      response.send(_.omit(user.toJSON(), 'password'))
      return
    }

    // Should not make it until here actually
    response.forbidden()
  }

  * logout (request, response) {
    yield request.auth.logout()

    response.ok()
  }
}

module.exports = AuthController
