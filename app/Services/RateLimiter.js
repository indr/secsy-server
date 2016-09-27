'use strict'

const NE = use('node-exceptions')
const Redis = use('Redis')

class RateLimitExceededException extends NE.LogicalException {
  constructor (type, secondsToWait) {
    super(type, 429)
    this.secondsToWait = secondsToWait
  }
}

class RateLimiter {
  constructor (subject, type, max, secs) {
    this._redis = Redis
    this._subject = subject
    this._key = RateLimiter._buildKey(subject, type)
    this._type = type
    this._max = max
    this._secs = secs
  }

  static _buildKey (subject, type) {
    const KeyPrefix = 'rate-limit'
    return `${KeyPrefix}:${subject}:${type}`
  }

  get key () {
    return this._key
  }

  * perform () {
    if (this.isUnlimited()) {
      return
    }

    if (yield this.isUnderLimit()) {
      // Simple ring buffer
      yield this._redis.lpush(this._key, Math.floor(new Date().getTime() / 1000))
      yield this._redis.ltrim(this._key, 0, this._max - 1)

      // Let's ensure we expire this key at some point
      yield this._redis.expire(this._key, this._secs * 2)
    } else {
      throw new RateLimitExceededException(this._type + '-rate-limit-exceeded', yield this.getSecondsToWait())
    }
  }

  * getRemaining () {
    let arr = yield this._redis.lrange(this._key, 0, this._max) || []
    const t0 = Math.floor(new Date().getTime() / 1000)
    arr = arr.filter((a) => { return t0 - parseInt(a) <= this._secs })
    return this._max - arr.length
  }

  * getAgeOfOldest () {
    // age of oldest event in buffer, in seconds
    const a = yield this._redis.lrange(this._key, -1, -1)
    return Math.floor(new Date().getTime() / 1000) - a[ 0 ]
  }

  * getSecondsToWait () {
    return this._secs - (yield this.getAgeOfOldest())
  }

  * isUnderLimit () {
    // Number of events in buffer less than max allowed
    const numberOfEvents = yield this._redis.llen(this._key)
    console.log('number of events', numberOfEvents)
    if (numberOfEvents < this._max) {
      return true
    }

    // Age bigger than sliding window size?
    const ageOfOldest = yield this.getAgeOfOldest()
    console.log('age of oldest', ageOfOldest)
    return ageOfOldest > this._secs
  }

  isUnlimited () {
    return this._subject === '127.0.0.1'
  }
}

module.exports = RateLimiter
