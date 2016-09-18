'use strict'

const Env = use('Env')

class Logger {

  * handle (request, response, next) {
    console.log(`${request.method()} ${request.url()}`)

    if (Env.get('HTTP_DELAY')) {
      yield new Promise((resolve) => {
        setTimeout(resolve, Env.get('HTTP_DELAY'))
      })
    }

    yield next
  }

}

module.exports = Logger
