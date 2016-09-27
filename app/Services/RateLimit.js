'use strict'

const RateLimiter = use('App/Services/RateLimiter')

const RateLimit = exports = module.exports = {}

RateLimit.perform = function * (subject, key, max, secs) {
  const rateLimiter = new RateLimiter(subject, key, max, secs)
  yield rateLimiter.perform()
  return rateLimiter
}
