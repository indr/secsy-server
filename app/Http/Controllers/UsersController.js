'use strict'

const User = use('App/Model/User')

class UsersController {
  * store (request, response) {
    const data = request.only('email', 'password')
    data.username = data.email;

    const user = yield User.create(data)

    response.created(user)
  }

  * me (request, response) {
    const user = yield request.auth.getUser()

    if (!user) {
      response.unauthorized('You must login to to get your user')
      return
    }

    response.ok(user)
  }
}

module.exports = UsersController
