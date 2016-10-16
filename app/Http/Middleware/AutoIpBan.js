'use strict'

const RateLimiter = use('RateLimiter')

class AutoIpBan {
  * handle (request, response, next) {
    const ipAddress = request.request.socket.remoteAddress
    const minuteLimiter = RateLimiter.make(ipAddress, 'auto-ip-ban-min', 10, 60)
    const hourLimiter = RateLimiter.make(ipAddress, 'auto-ip-ban-hr', 60, 3600)

    if ((yield minuteLimiter.isUnderLimit()) && (yield hourLimiter.isUnderLimit())) {
      yield next
    } else {
      response.tooManyRequests({ status: 429, message: 'Too many suspicious requests' })
      return
    }

    if (response.response.statusCode >= 400) {
      yield minuteLimiter.add()
      yield hourLimiter.add()
    }
  }
}

module.exports = AutoIpBan
