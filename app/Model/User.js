'use strict'

const Base = require('./Base')

class User extends Base {
  apiTokens () {
    return this.hasMany('App/Model/Token')
  }

  emailTokens () {
    return this.hasMany('App/Model/EmailToken')
  }

  static boot () {
    super.boot()
    this.addHook('beforeCreate', 'User.setUsername')
    this.addHook('beforeCreate', 'User.encryptPassword')
    this.addHook('beforeCreate', 'User.setEmailSha256')
  }

  static get hidden () {
    return [ 'password' ]
  }

  static get sanitations () {
    return {
      email: 'normalize_email'
    }
  }

  static get signupRules () {
    return {
      username: 'required|email|min:5|unique:users',
      email: 'required|email|unique:users',
      password: 'required|password',
      locale: 'required|regex:^[a-z]{2}\\-[A-Z]{2}$'
    }
  }

  static get resetPasswordRules () {
    return {
      token: 'required|token',
      password: 'required|password'
    }
  }
}

module.exports = User
