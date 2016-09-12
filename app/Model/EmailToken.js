'use strict'

const moment = require('moment')
const Exceptions = use('App/Exceptions')

const Base = require('./Base')

class EmailToken extends Base {
  user () {
    return this.belongsTo('App/Model/User')
  }

  confirm () {
    if (this.confirmed) {
      throw new Exceptions.ValidationException('Email token is already confirmed')
    }
    if (moment().subtract(2, 'days').isAfter(this.created_at)) {
      throw new Exceptions.ValidationException('Email token has expired')
    }
    this.confirmed = true
    return true
  }

  static boot () {
    super.boot()
    this.addHook('beforeCreate', 'EmailToken.createToken')
    this.addHook('afterCreate', 'EmailToken.expirePreviousTokens')
  }
}

module.exports = EmailToken
