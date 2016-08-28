'use strict'

class Logger {

  * handle (request, response, next) {
    console.log(`${request.method()} ${request.url()}`)

    yield next
  }

}

module.exports = Logger
