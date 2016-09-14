'use strict'

const Env = use('Env')
const Mail = use('Mail')

const UserNotificationMailer = exports = module.exports = {}

UserNotificationMailer.sendAccountActivation = function * (user, emailToken) {
  if (!user || typeof (user.toJSON) !== 'function') {
    throw new Error('Mailer expects a valid instance of User Model')
  }
  if (!emailToken || emailToken.length !== 36) {
    throw new Error('Mailer expects a valid email token')
  }

  const model = {
    base_url: Env.get('BASE_URL'),
    email_token: emailToken
  }
  return yield Mail.send([ null, 'emails/user_notifications/account-activation' ], model, function (message) {
    message.to(user.email)
    message.from(Env.get('MAIL_FROM_EMAIL'), Env.get('MAIL_FROM_NAME'))
    message.subject('Confirm your new account')
  })
}

UserNotificationMailer.sendResetPassword = function * (user, emailToken) {
  if (!user || typeof (user.toJSON) !== 'function') {
    throw new Error('Mailer expects a valid instance of User Model')
  }
  if (!emailToken || emailToken.length !== 36) {
    throw new Error('Mailer expects a valid email token')
  }

  const model = {
    base_url: Env.get('BASE_URL'),
    email_token: emailToken
  }
  return yield Mail.send([ null, 'emails/user_notifications/reset-password' ], model, function (message) {
    message.to(user.email)
    message.from(Env.get('MAIL_FROM_EMAIL'), Env.get('MAIL_FROM_NAME'))
    message.subject('Reset password')
  })
}
