const sha = require('sha.js')

module.exports = exports = {
  sha256: function (value, salt) {
    return sha('sha256').update(salt + value).digest('hex')
  }
}
