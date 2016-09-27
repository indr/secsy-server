'use strict'

const RateLimiter = use('App/Services/RateLimiter')

class IpBan {
  * handle (request, response, next) {
    const ipAddress = request.request.socket.remoteAddress
    const minuteLimiter = new RateLimiter(ipAddress, 'auto-ip-ban-ms', 10, 60)
    const hourLimiter = new RateLimiter(ipAddress, 'auto-ip-ban-hr', 60, 3600)

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

module.exports = IpBan
