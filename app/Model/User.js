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

  // TODO: Rename to signupRules
  static get rules () {
    return {
      username: 'required|email|min:5|unique:users',
      email: 'required|email|unique:users',
      // TODO: Add strong validator
      password: 'required|min:8'
    }
  }

  static get resetPasswordRules () {
    return {
      // TODO: Add guid validator
      token: 'required|min:36',
      password: 'required|min:8'
    }
  }
}

module.exports = User
