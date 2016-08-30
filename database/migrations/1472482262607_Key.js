'use strict'

const Schema = use('Schema')

class KeySchema extends Schema {

  up () {
    this.create('keys', (table) => {
      table.uuid('id').primary()
      table.timestamps()
      table.uuid('created_by')
      table.uuid('owned_by')

      table.string('email_sha256', 64).notNullable()
      table.boolean('is_public').defaultsTo(false)
      table.text('private_key').notNullable()
      table.text('public_key').notNullable()
    })
  }

  down () {
    this.drop('keys')
  }

}

module.exports = KeySchema
