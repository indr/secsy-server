'use strict'

const EmailToken = use('App/Model/EmailToken')
const Exceptions = use('App/Exceptions')
const Hash = use('Hash')
const Mailer = use('App/Services/UserNotificationMailer')
const User = use('App/Model/User')
const Validator = use('App/Services/Validator')

class UserService {

  static get inject () {
    return [ 'Event' ]
  }

  constructor (Event) {
    this.Event = Event
  }

  * signup (data) {
    data = data || {}
    data.username = data.email
    yield Validator.validateAll(data, User.signupRules)

    let user = yield User.create({ email: data.email, password: data.password })
    let emailToken = yield user.emailTokens().create({ email: user.email })

    yield Mailer.sendAccountActivation(user, emailToken.token)

    this.Event.fire('user.signed-up', user)

    return user
  }

  * confirm (token) {
    yield Validator.validateAll({ token }, { token: 'required|token' })

    const emailToken = (yield EmailToken.query().where('token', token).fetch()).first()
    if (!emailToken) {
      throw new Exceptions.ModelNotFoundException('token-not-found')
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

  * resend (email) {
    yield Validator.validateAll({ email }, { email: 'required|email' })

    const user = (yield User.query().where('email', email).andWhere('confirmed', false).fetch()).first()
    if (!user) {
      throw new Exceptions.ModelNotFoundException('email-not-found')
    }

    let emailToken = yield user.emailTokens().create({ email: user.email })

    yield Mailer.sendAccountActivation(user, emailToken.token)
  }

  * forgot (email) {
    yield Validator.validateAll({ email }, { email: 'required|email' })

    const user = (yield User.query().where('email', email).fetch()).first()
    if (!user) {
      throw new Exceptions.ModelNotFoundException('email-not-found')
    }

    let emailToken = yield user.emailTokens().create({ email: user.email })

    yield Mailer.sendResetPassword(user, emailToken.token)
  }

  * reset (token, password) {
    yield Validator.validateAll({ token, password }, User.resetPasswordRules)

    const emailToken = (yield EmailToken.query().where('token', token).fetch()).first()
    if (!emailToken) {
      throw new Exceptions.ModelNotFoundException('token-not-found')
    }

    const user = yield emailToken.user().fetch()
    if (emailToken.confirm()) {
      // TODO: Add some salt and pepper?
      user.password = yield Hash.make(password)
      // TODO: Throw ApplicationException
      yield user.save()
      yield emailToken.save()
    }
  }
}

module.exports = UserService