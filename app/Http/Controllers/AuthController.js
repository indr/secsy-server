'use strict'

const Event = use('Event')
const Key = use('App/Model/Key')

class AuthController {

  * login (request, response) {
    const identifier = request.input('identifier')
    const password = request.input('password')

    let login
    try {
      login = yield request.auth.attempt(identifier, password)
    } catch (UserNotFoundException) {
      response.forbidden({ status: 403, message: 'invalid-username-or-password' })
      return
    }

    if (!login) {
      // Should not make it in here actually
      response.forbidden({ status: 403, message: 'invalid-username-or-password' })
      return
    }

    const user = yield request.auth.getUser()
    if (!user.confirmed) {
      response.forbidden({ status: 403, message: 'user-not-confirmed' })
      return
    }

    const key = yield Key.findBy('owned_by', user.id)
    const result = user.toJSON()
    result.private_key = key ? key.private_key : null
    result.public_key = key ? key.public_key : null

    Event.fire('user.logged-in', user)

    response.send(result)
  }

  * logout (request, response) {
    yield request.auth.logout()

    response.ok()
  }
}

module.exports = AuthController
