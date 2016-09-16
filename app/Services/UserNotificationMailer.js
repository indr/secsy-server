'use strict'

const Env = use('Env')
const Mail = use('Mail')

class UserNotificationMailer {

  * sendAccountActivation (user, emailToken) {
    UserNotificationMailer.assertIsModel(user, 'User')
    UserNotificationMailer.assertIsToken(emailToken)

    const model = {
      base_url: Env.get('BASE_URL'),
      email_token: emailToken
    }

    return yield this.send('Confirm your new account', 'account-activation', model, user)
  }

  * sendResetPassword (user, emailToken) {
    UserNotificationMailer.assertIsModel(user, 'User')
    UserNotificationMailer.assertIsToken(emailToken)

    const model = {
      base_url: Env.get('BASE_URL'),
      email_token: emailToken
    }

    return yield this.send('Reset password', 'reset-password', model, user)
  }

  * sendAccountDeleted (user) {
    UserNotificationMailer.assertIsModel(user, 'User')

    return yield this.send('Account deleted', 'account-deleted', user.toJSON(), user)
  }

  * send (subject, template, model, user) {
    return yield Mail.send([ null, 'emails/user_notifications/' + template ], model, function (message) {
      message.to(user.email)
      message.from(Env.get('MAIL_FROM_EMAIL'), Env.get('MAIL_FROM_NAME'))
      message.subject(subject)
    })
  }

  static assertIsModel (instance, modelName) {
    if (!instance || typeof (instance.toJSON) !== 'function') {
      throw new Error(`Mailer expects a valid instance of ${modelName} model`)
    }
  }

  static assertIsToken (token) {
    if (!token || token.length !== 36) {
      throw new Error('Mailer expects a valid token')
    }
  }
}

module.exports = UserNotificationMailer
