'use strict'

const Env = use('Env')
const User = use('App/Model/User')
const UserService = make('App/Services/UserService')
const Key = use('App/Model/Key')
const Validator = use('App/Services/Validator')

class UsersController {

  * store (request, response) {
    const raw = request.only('email', 'password', 'locale', 'sync_enabled')
    const data = yield Validator.sanitize(raw, User.sanitations)

    const user = yield UserService.signup(data)

    response.created(user.toJSON())
  }

  * confirm (request, response) {
    const token = request.input('token')

    yield UserService.confirm(token)
    return response.ok({ status: 200 })
  }

  * resend (request, response) {
    const raw = request.only('email')
    const email = (yield Validator.sanitize(raw, User.sanitations)).email

    yield UserService.resend(email)
    return response.ok({ status: 200 })
  }

  * forgotPassword (request, response) {
    const raw = request.only('email')
    const email = (yield Validator.sanitize(raw, User.sanitations)).email

    yield UserService.forgot(email)
    return response.ok({ status: 200 })
  }

  * resetPassword (request, response) {
    const data = request.only('token', 'password')

    yield UserService.reset(data.token, data.password)
    return response.ok({ status: 200 })
  }

  * me (request, response) {
    const user = request.currentUser

    if (!user) {
      response.unauthorized('You must login to to get your user')
      return
    }

    const key = yield Key.findBy('owned_by', user.id)

    let result = user.toJSON()
    result.hash_salt = Env.get('HASH_SALT')
    result.private_key = key ? key.private_key : null
    result.public_key = key ? key.public_key : null

    response.ok(result)
  }

  * updatePreferences (request, response) {
    const raw = request.only('locale', 'sync_enabled')
    const data = yield Validator.sanitize(raw, User.sanitations)

    yield UserService.update(request.currentUser, data)

    response.ok({ status: 200 })
  }

  * deleteAccount (request, response) {
    const data = request.only('password', 'message')

    yield UserService.deleteAccount(request.currentUser, data.password, data.message)
    response.ok({ status: 200 })
  }
}

module.exports = UsersController
