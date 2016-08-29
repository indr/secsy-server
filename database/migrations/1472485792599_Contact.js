'use strict'

const Schema = use('Schema')

class ContactSchema extends Schema {

  up () {
    this.create('contacts', (table) => {
      table.uuid('id').primary()
      table.timestamps()
      table.uuid('user_id').notNullable()
      table.boolean('me').defaultsTo(false)
      table.text('encrypted_')
    })
  }

  down () {
    this.drop('contacts')
  }

}

module.exports = ContactSchema
