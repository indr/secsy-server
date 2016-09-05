'use strict'

const User = use('App/Model/User')
const Key = use('App/Model/Key')
const Event = use('Event')
const Validator = use('Validator')

class UsersController {

  * store (request, response) {
    const raw = request.only('email', 'password')
    const data = yield Validator.sanitize(raw, User.sanitations)
    data.username = data.email

    const validation = yield Validator.validateAll(data, User.rules)

    if (validation.fails()) {
      response.badRequest(validation.messages())
      return
    }

    const user = yield User.create(data)
    Event.fire('user.signed-up', user)

    response.created(user.toJSON())
  }

  * me (request, response) {
    const user = yield request.auth.getUser()

    if (!user) {
      response.unauthorized('You must login to to get your user')
      return
    }

    const key = yield Key.findBy('owned_by', user.id)

    let result = user.toJSON()
    result.private_key = key ? key.private_key : null
    result.public_key = key ? key.public_key : null

    response.ok(result)
  }
}

module.exports = UsersController
