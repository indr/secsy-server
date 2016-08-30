'use strict'

const Schema = use('Schema')

class UserSchema extends Schema {

  up () {
    this.create('users', (table) => {
      table.uuid('id').primary().index()
      table.timestamps()
      table.string('username', 80).notNullable().unique().index()
      table.string('email', 254).notNullable().unique()
      table.string('password', 60).notNullable()
      table.string('email_sha256', 64).notNullable()
    })
  }

  down () {
    this.drop('users')
  }

}

module.exports = UserSchema
