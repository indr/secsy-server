'use strict'

const Env = use('Env')
const Event = use('Event')
const Key = use('App/Model/Key')
const RateLimiter = use('RateLimiter')
const Validator = use('App/Services/Validator')

class AuthController {

  * login (request, response) {
    const ipAddress = request.request.socket.remoteAddress
    yield RateLimiter.perform(ipAddress, 'login-min', 6, 60)
    yield RateLimiter.perform(ipAddress, 'login-hr', 30, 3600)

    const identifier = Validator.sanitizor.normalizeEmail(request.input('identifier'), [])
    const password = request.input('password')

    let user
    try {
      user = yield request.auth.validate(identifier, password, true)
    } catch (UserNotFoundException) {
      response.forbidden({ status: 403, message: 'invalid-username-or-password' })
      return
    }

    if (!user.confirmed) {
      response.forbidden({ status: 403, message: 'user-not-confirmed' })
      return
    }

    let login = yield request.auth.login(user)
    if (!login) {
      response.forbidden({ status: 403, message: 'invalid-username-or-password' })
      return
    }

    const key = yield Key.findBy('owned_by', user.id)
    const result = user.toJSON()
    result.hash_salt = Env.get('HASH_SALT')
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
