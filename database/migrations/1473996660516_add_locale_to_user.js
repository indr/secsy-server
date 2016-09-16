'use strict'

const Schema = use('Schema')

class AddLocaleToUserSchema extends Schema {

  up () {
    this.table('users', (table) => {
      table.string('locale', 5).notNullable().defaultsTo('en-US')
    })
    this.raw(`UPDATE public.users SET locale = 'de-DE'`)
  }

  down () {
    this.table('users', (table) => {
      table.dropColumn('locale')
    })
  }

}

module.exports = AddLocaleToUserSchema
