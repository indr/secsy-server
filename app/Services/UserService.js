'use strict'

const EmailToken = use('App/Model/EmailToken')
const Exceptions = use('App/Exceptions')
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

  * confirm (token) {
    const emailToken = (yield EmailToken.query().where('token', token).fetch()).first()
    if (!emailToken) {
      throw new Exceptions.ValidationException('Email token not found', 404)
    }
    const user = yield emailToken.user().fetch()

    if (emailToken.confirm()) {
      user.confirmed = true
      // TODO: Throw ApplicationException
      yield user.save()
      yield emailToken.save()

      this.Event.fire('user.confirmed', user)
    }
  }
}

module.exports = UserService
