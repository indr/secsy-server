'use strict'

const _ = require('lodash')

const Key = use('App/Model/Key')

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

    if (!login) {
      // Should not make it in here actually
      response.forbidden()
      return
    }
    const user = yield request.auth.getUser()
    const key = yield Key.findBy('user_id', user.id)

    const result = _.omit(user.toJSON(), 'password')
    result.private_key = key ? key.private_key : null
    result.public_key = key ? key.public_key : null

    response.send(result)
  }

  * logout (request, response) {
    yield request.auth.logout()

    response.ok()
  }
}

module.exports = AuthController
