'use strict'

const Schema = use('Schema')

class AddSyncEnabledToUsersSchema extends Schema {

  up () {
    this.table('users', (table) => {
      table.boolean('sync_enabled').notNullable().defaultsTo(false)
    })
  }

  down () {
    this.table('users', (table) => {
      table.dropColumn('sync_enabled')
    })
  }

}

module.exports = AddSyncEnabledToUsersSchema
