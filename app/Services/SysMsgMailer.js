'use strict'

const Env = use('Env')
const Mail = use('Mail')

class SysMsgMailer {

  * sendUserLoggedIn (user) {
    SysMsgMailer.assertIsModel(user, 'User')

    return yield this.send('Notification: User logged in', 'user-logged-in', user.toJSON())
  }

  * sendUserSignedUp (user) {
    SysMsgMailer.assertIsModel(user, 'User')

    return yield this.send('Notification: User signed up', 'user-signed-up', user.toJSON())
  }

  * sendAccountDeleted (user, message) {
    SysMsgMailer.assertIsModel(user, 'User')

    message = message ? message.trim() : ''
    const model = {
      user: user.toJSON(),
      message: message === '' ? '(No message)' : message
    }

    return yield this.send('Notification: Account deleted', 'account-deleted', model)
  }

  * send (subject, template, model) {
    try {
      return yield Mail.send([ null, 'emails/system_messages/' + template ], model, function (message) {
        message.to('admin@secsy.io')
        message.from(Env.get('MAIL_FROM_EMAIL'), Env.get('MAIL_FROM_NAME'))
        message.subject(subject)
      })
    } catch (error) {
      console.error(error.stack)
      throw error
    }
  }

  static assertIsModel (instance, modelName) {
    if (!instance || typeof (instance.toJSON) !== 'function') {
      throw new Error(`Mailer expects a valid instance of ${modelName} model`)
    }
  }
}

module.exports = SysMsgMailer
