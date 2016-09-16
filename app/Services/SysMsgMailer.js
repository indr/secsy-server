'use strict'

const Env = use('Env')
const Mail = use('Mail')

// TODO: Refactor to class

const SysMsgMailer = exports = module.exports = {}

SysMsgMailer.sendUserLoggedIn = function * (user) {
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

SysMsgMailer.sendUserSignedUp = function * (user) {
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
SysMsgMailer.sendAccountDeleted = function * (user, message) {
  try {
    if (!user || typeof (user.toJSON) !== 'function') {
      throw new Error('Mailer expects a valid instance of User Model.')
    }

    message = message ? message.trim() : ''
    const model = {
      user: user.toJSON(),
      message: message === '' ? '(No message)' : message
    }
    return yield Mail.send([ null, 'emails/system_messages/account-deleted' ], model, function (message) {
      message.to('admin@secsy.io')
      message.from(Env.get('MAIL_FROM_EMAIL'), Env.get('MAIL_FROM_NAME'))
      message.subject('Notification: Account deleted')
    })
  } catch (err) {
    console.log(err)
    throw err
  }
}
