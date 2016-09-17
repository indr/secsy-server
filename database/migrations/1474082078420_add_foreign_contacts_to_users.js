'use strict'

const Schema = use('Schema')

class AddForeignContactsToUsersSchema extends Schema {

  up () {
    this.table('contacts', (table) => {
      table.foreign('owned_by').references('id').inTable('users')
    })
  }

  down () {
    this.table('contacts', (table) => {
      table.dropForeign('owned_by')
    })
  }

}

module.exports = AddForeignContactsToUsersSchema
