'use strict'

const _ = require('lodash')
const Validator = use('Validator')
const User = use('App/Model/User')
const Key = use('App/Model/Key')

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

    const key = yield Key.findBy('user_id', user.id)

    let result = user.toJSON()
    result = _.merge(result, key ? _.pick(key.toJSON(), 'private_key', 'public_key')
      : { private_key: null, public_key: null })

    response.ok(result)
  }
}

module.exports = UsersController
