var mangler   = require('mangler')
var median    = require('median')
var util      = require("util")
var RestIndex = require('./restIndex')

module.exports = function (config) {
  var index = {}
  var TOPIC = "coinpit-index#BTCUSD"
  var io    = require('socket.io')(config.port)

  var prices        = {}
  var feedProviders = index.components = {}
  var restPrices    = {}
  var priceIndex    = {}

  var startTime


  function configureSocket(name, socketModule) {
    if(!socketModule) return
    feedProviders[name] = require(socketModule)()
    feedProviders[name].on('price', function (data) {
      prices[name] = data
      index.priceChanged(name)
    })
  }

  index.init = function() {
    config.components.forEach(component => {
      configureSocket(component.name, component.socketModule)
      // var restIndex = RestIndex(restProvider)
    })
    util.log('started', startTime = Date.now())
    io.on('connection', function (socket) {
      socket.emit(TOPIC, priceIndex)
    })
  }

  function getActivePriceList() {
    var list = []
    Object.keys(prices).forEach(provider => {
      var indexPrice = prices[provider] || restPrices[provider]
      if (indexPrice.expired || indexPrice.price === undefined) return
      list.push(indexPrice.price)
    })
    return list
  }

  function publishFeed(list, feedProvider) {
    var price = list.length < config.minExternalProviders ? undefined : median(list).toFixed(config.ticksize) - 0
    priceIndex     = { price: price, lastProvider: feedProvider, used: list.length, providers: prices }
    if (config.logExternalPrice) util.log('coinpit-index:', JSON.stringify(priceIndex))
    if (io) io.emit(TOPIC, priceIndex)
  }

  var delayedResponder = (function () {
    var responder = {}
    var timer

    responder.isReadyToSendPrice = function (feedProvider, count, timeoutMessage) {
      if (timer) clearTimeout(timer)
      if (timeoutMessage) util.log(timeoutMessage)
      if (count === Object.keys(feedProviders).length || isWaitTimeDone()) return true
      timer = setTimeout(function () {
        index.priceChanged(feedProvider, 'called after wait')
      }, config.startupDelay -(Date.now() - startTime))
      return false
    }

    function isWaitTimeDone() {
      return Date.now() - startTime > config.startupDelay
    }

    return responder
  })()

  index.priceChanged = function(feedProvider, timeoutMessage) {
    var list             = getActivePriceList()
    var readyToSendPrice = delayedResponder.isReadyToSendPrice(feedProvider, list.length, timeoutMessage)
    if (readyToSendPrice) publishFeed(list, feedProvider)
  }

  index.getIndex = function () {
    return priceIndex
  }
  index.reset    = function () {
    priceIndex = {}
  }

  index.init()

  return index
}
