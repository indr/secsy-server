'use strict'

const User = use('App/Model/User')
const UserService = make('App/Services/User')
const Key = use('App/Model/Key')
const Validator = use('App/Services/Validator')

class UsersController {

  * store (request, response) {
    const raw = request.only('email', 'password')
    const data = yield Validator.sanitize(raw, User.sanitations)

    const user = yield UserService.signUp(data)

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
