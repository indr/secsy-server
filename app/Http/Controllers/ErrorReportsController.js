'use strict'

const RateLimiter = use('RateLimiter')
const Redis = use('Redis')

class ErrorReportsController {
  * index (request, response) {
    const ipAddress = request.request.socket.remoteAddress
    const currentUser = request.currentUser
    if (!(ipAddress === '127.0.0.1' || (currentUser && currentUser.email === 'mail@indr.ch'))) {
      response.forbidden({ status: 403 })
      return
    }

    const reports = yield Redis.lrange('error-reports', 0, 100) || []

    return response.ok(reports.map(JSON.parse))
  }

  * store (request, response) {
    const ipAddress = request.request.socket.remoteAddress
    yield RateLimiter.perform(ipAddress, 'error-report-min', 6, 60)
    yield RateLimiter.perform(ipAddress, 'error-report-hr', 30, 3600)

    const report = request.only('occuredAt', 'instanceOfError', 'errorName', 'errorMessage', 'errorStack', 'agent', 'language', 'source')
    report.createdAt = new Date()
    report.ipAddress = ipAddress

    const key = 'error-reports'
    yield Redis.lpush(key, JSON.stringify(report))
    yield Redis.ltrim(key, 0, 100)
    yield Redis.expire(key, 3600 * 24)

    return response.created({ status: 201 })
  }
}

module.exports = ErrorReportsController
