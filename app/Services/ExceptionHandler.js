'use strict'

// https://github.com/adonisjs/adonis-rally/blob/e3a63e726681cebd831bf1beaf401804ac227f2b/app/Services/ExceptionParser.js

const ExceptionHandler = exports = module.exports = {}

const handlers = {
  ValidationException: function (error, request, response) {
    const fields = error.fields
    const status = error.status || 400
    const message = error.message
    return { status, message, fields }
  },

  default: function (error, request, response) {
    const message = error.message || 'Something went wrong'
    const status = error.status || 500
    return { status, message }
  }
}

ExceptionHandler.send = function * (error, request, response) {
  const handler = handlers[ error.name ] || handlers.default
  const data = handler(error, request, response)

  if (data.status === 500) {
    console.error(error.stack)
  }

  const accept = request.accepts('json', 'html')
  switch (accept) {
    case 'html':
      yield response.status(data.status).sendView('errors/index', { error: data })
      break

    case 'json':
      response.status(data.status).send(data)
      break
  }
}
