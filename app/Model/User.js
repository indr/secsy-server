'use strict'

const omit = require('lodash').omit
const Lucid = use('Lucid')

class User extends Lucid {

  apiTokens () {
    return this.hasMany('App/Model/Token')
  }

  toJSON (values) {
    return omit(super.toJSON(values), 'password')
  }

  static boot () {
    super.boot()
    this.addHook('beforeCreate', 'Base.generateId')
    this.addHook('beforeCreate', 'User.setUsername')
    this.addHook('beforeCreate', 'User.encryptPassword')
    this.addHook('beforeCreate', 'User.setEmailSha256')
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
