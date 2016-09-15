'use strict'

const Schema = use('Schema')

class UpdateSchema extends Schema {

  up () {
    this.create('updates', (table) => {
      table.uuid('id').primary().index()
      table.timestamps()
      table.uuid('created_by')
      table.uuid('owned_by')

      table.string('from_email_sha256', 64).notNullable()
      table.string('to_email_sha256', 64).notNullable().index()
      table.text('encrypted_').notNullable()
    })
  }

  down () {
    this.drop('updates')
  }

}

module.exports = UpdateSchema
