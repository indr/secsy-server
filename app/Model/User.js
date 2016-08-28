'use strict'

const Lucid = use('Lucid')

class User extends Lucid {

  apiTokens () {
    return this.hasMany('App/Model/Token')
  }

  static boot () {
    super.boot()
    this.addHook('beforeCreate', 'User.encryptPassword')
  }

}

module.exports = User
