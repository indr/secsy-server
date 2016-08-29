'use strict'

const app = require('../../bootstrap/app')
const fold = require('adonis-fold')
const Ioc = fold.Ioc
const Registrar = fold.Registrar
const path = require('path')
const packageFile = path.join(__dirname, '../../package.json')

const setup = exports = module.exports = {}

setup.loadProviders = function () {
  return Registrar.register(app.providers)
    .then(() => {
      Ioc.aliases(app.aliases)

      const Helpers = use('Helpers')
      Helpers.load(packageFile, fold.Ioc)
    })
}

setup.start = function * () {

}
