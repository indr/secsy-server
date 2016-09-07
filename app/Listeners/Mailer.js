'use strict'

const Env = use('Env')
const Mail = use('Mail')

const Mailer = exports = module.exports = {}

Mailer.sendSystemMessageUserLoggedIn = function * (user) {
  try {
    if (!user || typeof (user.toJSON) !== 'function') {
      throw new Error('Mailer expects a valid instance of User Model.')
    }

    return yield Mail.send([ null, 'emails/system_messages/user-logged-in' ], user.toJSON(), function (message) {
      message.to('admin@secsy.io')
      message.from(Env.get('MAIL_FROM_EMAIL'), Env.get('MAIL_FROM_NAME'))
      message.subject('Notification: User logged in')
    })
  } catch (err) {
    console.log(err)
    throw err
  }
}

Mailer.sendSystemMessageUserSignedUp = function * (user) {
  try {
    if (!user || typeof (user.toJSON) !== 'function') {
      throw new Error('Mailer expects a valid instance of User Model.')
    }

    return yield Mail.send([ null, 'emails/system_messages/user-signed-up' ], user.toJSON(), function (message) {
      message.to('admin@secsy.io')
      message.from(Env.get('MAIL_FROM_EMAIL'), Env.get('MAIL_FROM_NAME'))
      message.subject('Notification: User signed up')
    })
  } catch (err) {
    console.log(err)
    throw err
  }
}
