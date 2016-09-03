'use strict'

const Schema = use('Schema')

class TokenSchema extends Schema {

  up () {
    this.create('tokens', (table) => {
      table.uuid('id').primary().index()
      table.uuid('user_id').references('id').inTable('users')
      table.string('token', 40).notNullable().unique()
      table.boolean('forever').defaultTo(false)
      table.boolean('is_revoked').defaultTo(false)
      table.timestamp('expiry')
      table.timestamps()
    })
  }

  down () {
    this.drop('tokens')
  }

}

module.exports = TokenSchema
