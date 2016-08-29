/**
 * Copyright 2016 Reto Inderbitzin
 */
'use strict'

const Lucid = use('Lucid')

class Contact extends Lucid {
  static boot () {
    super.boot()
    this.addHook('beforeCreate', 'Base.generateId')
  }
}

module.exports = Contact
