'use strict'

class SinglePageApplication {

  * handle (request, response, next) {
    if (request.url().match(/^\/app/)) {
      return response.download('public/app/index.html')
    }

    yield next
  }

}

module.exports = SinglePageApplication
