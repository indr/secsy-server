'use strict'

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
      response.send('Logged in successfully')
      return
    }

    response.unauthorized('Invalid credentials')
  }

  * logout (request, response) {
    yield request.auth.logout()

    response.ok()
  }
}

module.exports = AuthController
