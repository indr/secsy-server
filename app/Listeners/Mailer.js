'use strict'

const Mail = use('Mail')

const Mailer = exports = module.exports = {}

Mailer.sendSystemMessageUserSignedUp = function * (user) {
  try {
    if (!user || typeof (user.toJSON) !== 'function') {
      throw new Error('Mailer expects a valid instance of User Model.')
    }

    yield Mail.send([ null, 'emails/system_messages/user-signed-up' ], user.toJSON(), function (message) {
      // message.to(user.email, user.name)
      message.to('admin@secsy.io')
      message.from('no-reply@secsy.io')
      message.subject('Notification: User signed up')
    })
  } catch (err) {
    console.log(err)
    throw err
  }
}
