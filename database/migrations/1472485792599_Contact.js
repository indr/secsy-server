'use strict'

const Schema = use('Schema')

class ContactSchema extends Schema {

  up () {
    this.create('contacts', (table) => {
      table.uuid('id').primary().index()
      table.timestamps()
      table.uuid('created_by')
      table.uuid('owned_by')

      table.boolean('me').defaultsTo(false)
      table.text('encrypted_')
    })
  }

  down () {
    this.drop('contacts')
  }

}

module.exports = ContactSchema
