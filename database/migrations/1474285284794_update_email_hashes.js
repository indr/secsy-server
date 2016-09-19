'use strict'

const sha = require('sha.js')

const Env = use('Env')
const Schema = use('Schema')
const Db = use('Database')

function sha256 (value, salt) {
  salt = salt || Env.get('HASH_SALT')
  return sha('sha256').update(salt + value).digest('hex')
}

class UpdateEmailHashesSchema extends Schema {

  up () {
    this.update()
  }

  down () {
    this.update('v07k2x0zgR')
  }

  update (salt) {
    const self = this
    return Db.raw('SELECT email, email_sha256 FROM public.users').then(function (result) {
      for (var row of result.rows) {
        const hash = sha256(row.email, salt)
        self.raw(`UPDATE public.keys SET email_sha256 = '${hash}' WHERE email_sha256 = '${row.email_sha256}'`)
        self.raw(`UPDATE public.updates SET from_email_sha256 = '${hash}' WHERE from_email_sha256 = '${row.email_sha256}'`)
        self.raw(`UPDATE public.updates SET to_email_sha256 = '${hash}' WHERE to_email_sha256 = '${row.email_sha256}'`)
        self.raw(`UPDATE public.users SET email_sha256 = '${hash}' WHERE email = '${row.email}'`)
      }
    })
  }
}

module.exports = UpdateEmailHashesSchema
