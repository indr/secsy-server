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

  static get rules () {
    return {
      username: 'required|unique:users',
      email: 'required|unique:users',
      password: 'required'
    }
  }
}

module.exports = User
