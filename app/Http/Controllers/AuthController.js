'use strict'

class AuthController {

  * login (request, response) {
    const identification = request.input('identification')
    const password = request.input('password')
    const login = yield request.auth.attempt(identification, password)

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
