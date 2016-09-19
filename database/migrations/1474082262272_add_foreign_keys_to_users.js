'use strict'

const Schema = use('Schema')

class AddForeignKeysToUsersSchema extends Schema {

  up () {
    this.table('keys', (table) => {
      table.foreign('owned_by').references('id').inTable('users')
    })
  }

  down () {
    this.table('keys', (table) => {
      table.dropForeign('owned_by')
    })
  }

}

module.exports = AddForeignKeysToUsersSchema
