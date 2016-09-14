'use strict'

const User = use('App/Model/User')
const UserService = make('App/Services/UserService')
const Key = use('App/Model/Key')
const Validator = use('App/Services/Validator')

class UsersController {

  * store (request, response) {
    const raw = request.only('email', 'password')
    const data = yield Validator.sanitize(raw, User.sanitations)

    const user = yield UserService.signup(data)

    response.created(user.toJSON())
  }

  * confirm (request, response) {
    const token = request.input('token')
    if (!token) {
      response.badRequest({ status: 400 })
      return
    }

    yield UserService.confirm(token)
    return response.ok({ status: 200 })
  }

  * resend (request, response) {
    const raw = request.only('email')
    const email = (yield Validator.sanitize(raw, User.sanitations)).email

    if (!email) {
      response.badRequest({ status: 400, message: 'invalid-email' })
      return
    }

    yield UserService.resend(email)
    return response.ok({ status: 200 })
  }

  * forgotPassword (request, response) {
    const raw = request.only('email')
    const email = (yield Validator.sanitize(raw, User.sanitations)).email

    if (!email) {
      response.badRequest({ status: 400, message: 'invalid-email' })
      return
    }

    yield UserService.forgot(email)
    return response.ok({ status: 200 })
  }

  * resetPassword (request, response) {
    const data = request.only('token', 'password')

    // if (!data.token) {
    //   response.badRequest({ status: 400, message: 'invalid-token' })
    //   return
    // }
    // if (!data.password) {
    //   response.badRequest({ status: 400, message: 'invalid-password' })
    //   return
    // }

    yield UserService.reset(data.token, data.password)
    return response.ok({ status: 200 })
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
