'use strict'

const colors = require('colors/safe')
const Env = use('Env')
const printf = require('printf')

const colorStatus = function (status) {
  let colorFn = status >= 500 ? colors.red // red
    : status >= 400 ? colors.yellow // yellow
    : status >= 300 ? colors.cyan // cyan
    : status >= 200 ? colors.green // green
    : null // no color

  return colorFn ? colorFn(status) : status
}

class Logger {
  * handle (request, response, next) {
    let t = process.hrtime()

    if (Env.get('HTTP_DELAY')) {
      yield new Promise((resolve) => {
        setTimeout(resolve, Env.get('HTTP_DELAY'))
      })
    }

    yield next

    t = process.hrtime(t)
    const status = colorStatus(response.response.statusCode)
    const ms = printf('%.3f ms', (t[ 0 ] * 1000 + t[ 1 ] / 1000) / 1000)
    console.log(`${request.method()} ${request.url()} ${status} ${ms}`)
  }
}

module.exports = Logger
