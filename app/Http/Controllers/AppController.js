'use strict'

class AppController {
  * index (request, response) {
    response.download('public/app/index.html')
  }
}

module.exports = AppController
