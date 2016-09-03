'use strict'

const Lucid = use('Lucid')

class Base extends Lucid {
  static boot () {
    super.boot()
    this.addHook('beforeCreate', 'Base.generateId')
  }

  static get dateFormat () {
    return 'YYYY-MM-DDTHH:mm:ssZ'
  }
}

module.exports = Base
