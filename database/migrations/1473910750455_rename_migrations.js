'use strict'

const Schema = use('Schema')

const migrations = {
  '1472423749506_User': 'create_users',
  '1472423749507_Token': 'create_tokens',
  '1472482262607_Key': 'create_keys',
  '1472485792599_Contact': 'create_contacts',
  '1472545974511_Update': 'create_updates'
}

class RenamesSchema extends Schema {

  up () {
    Object.keys(migrations).forEach((key) => {
      const oldName = key
      const newName = key.substr(0, 14) + migrations[ key ]
      this.raw(`UPDATE public.adonis_schema SET name = '${newName}' WHERE name = '${oldName}'`)
    })
  }

  down () {
  }

}

module.exports = RenamesSchema
