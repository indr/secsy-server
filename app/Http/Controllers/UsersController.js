'use strict'

const _ = require('lodash')
const Validator = use('Validator')
const User = use('App/Model/User')

class UsersController {

  * store (request, response) {
    const data = request.only('email', 'password')
    data.username = data.email

    const validation = yield Validator.validate(data, User.rules)

    if (validation.fails()) {
      response.badRequest(validation.messages())
      return
    }

    const user = yield User.create(data)

    response.created(_.omit(user.toJSON(), 'password'))
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
