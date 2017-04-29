var mangler = require('mangler')
var median  = require('median')
var util    = require("util")
var config  = require('config')

module.exports = (function () {
  var prices        = {};
  var feedProviders = {}
  var TOPIC         = "coinpit-index#BTCUSD"
  var index, io
  var feed          = {}
  var startTime

  function init() {
    config.feed.forEach(feedProvider => {
      feedProviders[feedProvider] = require('./' + feedProvider)
      feedProviders[feedProvider].on('price', function (data) {
        prices[feedProvider] = data
        feed.priceChanged(feedProvider)
      })
    })
    util.log('started')
    startTime = Date.now()
    if (!config.test) {
      io = require('socket.io')(config.port);
      io.on('connection', function (socket) {
        socket.emit(TOPIC, index)
      })
    }
    process.on('uncaughtException', (err) => {
      console.log("################################## uncaught exception ######################################")
      util.log(err.stack)
      console.log("################################## uncaught exception ######################################")
    })
  }

  function getActivePriceList() {
    var list = []
    Object.keys(prices).forEach(provider => {
      var feed = prices[provider]
      if (feed.expired) return
      list.push(feed.price)
    })
    return list
  }

  function publishFeed(list, feedProvider) {
    console.log(feedProvider)
    var price = list.length < config.minExternalProviders ? undefined : median(list).toFixed(config.ticksize) - 0
    index     = { price: price, lastProvider: feedProvider, used: list.length, providers: prices }
    if (config.logExternalPrice) util.log('coinpit-index:', JSON.stringify(index))
    if (io) io.emit(TOPIC, index)
  }

  feed.priceChanged = function(feedProvider, timeoutMessage) {
    var list             = getActivePriceList()
    var readyToSendPrice = delayedResponder.isReadyToSendPrice(feedProvider, list.length, timeoutMessage)
    if (readyToSendPrice) publishFeed(list, feedProvider)
  }

  var delayedResponder = (function () {
    var responder = {}
    var timer

    responder.isReadyToSendPrice = function (feedProvider, count, timeoutMessage) {
      if (timer) clearTimeout(timer)
      if (timeoutMessage) util.log(timeoutMessage)
      if (count === config.feed.length || isWaitTimeDone()) return true
      timer = setTimeout(function () {
        feed.priceChanged(feedProvider, 'called after wait')
      }, Date.now() - startTime)
      return false
    }

    function isWaitTimeDone() {
      return Date.now() - startTime > 60000
    }

    return responder
  })()

  feed.getIndex = function () {
    return index
  }
  feed.reset    = function () {
    index = {}
  }
  init()
  return feed
})()
