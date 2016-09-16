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

    return yield this.send('account-activation', model, user)
  }

  * sendResetPassword (user, emailToken) {
    UserNotificationMailer.assertIsModel(user, 'User')
    UserNotificationMailer.assertIsToken(emailToken)

    const model = {
      base_url: Env.get('BASE_URL'),
      email_token: emailToken
    }

    return yield this.send('reset-password', model, user)
  }

  * sendAccountDeleted (user) {
    UserNotificationMailer.assertIsModel(user, 'User')

    return yield this.send('account-deleted', user.toJSON(), user)
  }

  * send (key, model, user) {
    const template = UserNotificationMailer.template(key, user.locale)
    return yield Mail.send([ null, template ], model, function (message) {
      message.to(user.email)
      message.from(Env.get('MAIL_FROM_EMAIL'), Env.get('MAIL_FROM_NAME'))
      message.subject(UserNotificationMailer.t(key, user.locale))
    })
  }

  static template (key, locale) {
    locale = locale ? locale.substr(0, 2).toLocaleLowerCase() : 'en'
    const locales = { 'en': 'en', 'de': 'de' }
    locale = locales[ locale ] || 'en'
    return 'emails/user_notifications/' + locale + '/' + key
  }

  static t (key, locale) {
    locale = locale ? locale.substr(0, 2).toLowerCase() : 'en'

    const translations = {
      'en': {
        'account-activation': 'Confirm your new account',
        'reset-password': 'Reset password',
        'account-deleted': 'Account deleted'
      },
      'de': {
        'account-activation': 'Bestätigen Sie Ihr neues Konto',
        'reset-password': 'Passwort-Zurücksetzung',
        'account-deleted': 'Konto entfernt'
      }
    }

    return translations[ locale ][ key ]
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
