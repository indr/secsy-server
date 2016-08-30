'use strict'

const Contact = use('App/Model/Contact')

const Addressbook = exports = module.exports = {}

Addressbook.createMeContact = function * (user) {
  // this.emitter gives access to the event instance

  const decoded = {
    emailAddress$: user.email
  }
  const encoded = new Buffer(JSON.stringify(decoded)).toString('base64')

  const data = {
    created_by: null,
    owned_by: user.id,
    me: true,
    encrypted_: 'base64///' + encoded
  }

  try {
    yield Contact.create(data)
  } catch (ex) {
    // TODO: Proper logging
    console.log(ex)
  }
}

Addressbook.updateMeContact = function (user) {
  // this.emitter gives access to the event instance

}
