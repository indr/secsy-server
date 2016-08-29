'use strict'

const Contact = use('App/Model/Contact')

class ContactsController {
  * index (request, response) {
    const user = yield request.auth.getUser()
    const contacts = yield Contact.query().where('user_id', user.id)

    response.ok(contacts)
  }

  * store (request, response) {
    const user = yield request.auth.getUser()
    const data = request.only('encrypted_')
    data.user_id = user.id
    data.me = false

    const contact = yield Contact.create(data)

    response.created(contact)
  }

  * show (request, response) {
    response.notImplemented()
  }

  * update (request, response) {
    response.notImplemented()
  }

  * destroy (request, response) {
    response.notImplemented()
  }
}

module.exports = ContactsController
