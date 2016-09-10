'use strict'

const User = use('App/Model/User')
const Validator = use('App/Services/Validator')

class UserService {

  static get inject () {
    return [ 'Event' ]
  }

  constructor (Event) {
    this.Event = Event
  }

  * getEvent () {
    return this.Event
  }

  * signUp (data) {
    data.username = data.email
    yield Validator.validateAll(data, User.rules)

    let user = yield User.create({ email: data.email, password: data.password })

    this.Event.fire('user.signed-up', user)

    return user
  }
}

module.exports = UserService
