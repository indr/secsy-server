'use strict'

const Base = require('./Base')

class EmailToken extends Base {
  user () {
    return this.belongsTo('App/Model/User')
  }

  static boot () {
    super.boot()
    this.addHook('beforeCreate', 'EmailToken.createToken')
  }
}

module.exports = EmailToken
