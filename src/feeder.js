module.exports = function (name) {
  var util    = require('util')
  var config  = require('config')
  var Emitter = require('events').EventEmitter;
  var emitter = new Emitter();
  var feeder  = {}
  var lastTime = Date.now()
  feeder.on   = emitter.on.bind(emitter)
  feeder.once = emitter.once.bind(emitter)

  var currentPrice, timer

  feeder.resetClockToClearPrice = function () {
    lastTime = Date.now()
    if (timer) clearTimeout(timer)
    timer = setTimeout(feeder.clearPrice.bind(feeder), config.expiryTime * 60 * 1000)
  }

  feeder.heartbeat = function () {
    feeder.resetClockToClearPrice()
  }

  feeder.priceReceived = function (price) {
    price        = price - 0
    currentPrice = price && !isNaN(price) ? price : undefined;
    emitter.emit('price', currentPrice)
    feeder.resetClockToClearPrice()
  }

  feeder.clearPrice = function () {
    currentPrice = undefined
    emitter.emit('price', undefined)
  }

  feeder.getCurrentPrice = function () {
    return currentPrice
  }

  setInterval(function () {
    if (Date.now() - lastTime > 150000) {
      console.log('Reconnecting', name )
      feeder.reconnect()
    }
  }, 100000)


  return feeder
}