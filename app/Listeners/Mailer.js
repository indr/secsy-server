'use strict'

const Mail = use('Mail')

const Mailer = exports = module.exports = {}

Mailer.sendWelcomeEmail = function * (user) {
  try {
    yield Mail.send('emails.welcome-en', user, function (message) {
      message.to(user.email, user.name)
      message.from('secsy@nym.hush.com')
      message.subject('Welcome to the Kitten\'s World')
    })
  } catch (err) {
    console.log(err)
    throw err
  }
}
