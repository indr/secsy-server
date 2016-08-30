'use strict'

const Contact = use('App/Model/Contact')

const Addressbook = exports = module.exports = {}

Addressbook.createMeContact = function * (user) {
  // this.emitter gives access to the event instance

  const data = {
    created_by: null,
    owned_by: user.id,
    me: true,
    encrypted_: getEncrypted(user)
  }

  // TODO: What happens if this fails?
  yield Contact.create(data)
}

Addressbook.updateMeContact = function * (user, key) {
  // this.emitter gives access to the event instance

  // TODO: What happens if event listener fail?
  let contact = yield Contact.query().me(user.id).first()
  contact.encrypted_ = getEncrypted(user)
  yield contact.save()
}

function getEncrypted (user) {
  const decoded = {
    email_address$: user.email
  }
  const encoded = new Buffer(JSON.stringify(decoded)).toString('base64')

  return 'base64///' + encoded
}
