'use strict'

const Lucid = use('Lucid')

class User extends Lucid {

  apiTokens () {
    return this.hasMany('App/Model/Token')
  }

  static boot () {
    super.boot()
    this.addHook('beforeCreate', 'Base.generateId')
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

  static get rules () {
    return {
      username: 'required|email|min:5|unique:users',
      email: 'required|email|unique:users',
      password: 'required|min:8'
    }
  }
}

module.exports = User
