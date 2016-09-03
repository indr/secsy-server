'use strict'

const Base = require('./Base')

class Token extends Base {
  user () {
    return this.belongsTo('App/Model/User')
  }
}

module.exports = Token
