'use strict'

const User = use('App/Model/User')
const Validator = use('App/Services/Validator')
const Mailer = use('App/Services/UserNotificationMailer')

class UserService {

  static get inject () {
    return [ 'Event' ]
  }

  constructor (Event) {
    this.Event = Event
  }

  * signup (data) {
    data.username = data.email
    yield Validator.validateAll(data, User.rules)

    let user = yield User.create({ email: data.email, password: data.password })
    let emailToken = yield user.emailTokens().create({ email: user.email })

    yield Mailer.sendAccountActivation(user, emailToken.token)

    this.Event.fire('user.signed-up', user)

    return user
  }
}

module.exports = UserService
