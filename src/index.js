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

  function init() {
    config.feed.forEach(feedProvider => {
      feedProviders[feedProvider] = require('./' + feedProvider)
      feedProviders[feedProvider].on('price', function (feed) {
        prices[feedProvider] = feed
        priceChanged(feedProvider)
      })
    })

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

  function priceChanged(feedProvider) {
    var list = []
    Object.keys(prices).forEach(provider => {
      var feed = prices[provider]
      if (feed.expired) return
      list.push(feed.price)
    })
    // externalPrice = list.length === 0 ? undefined : median(list).toFixed(config.ticksize) - 0
    var price = list.length < config.minExternalProviders ? undefined : median(list).toFixed(config.ticksize) - 0
    index     = { price: price, lastProvider: feedProvider, used: list.length, providers: prices }
    if (config.logExternalPrice) util.log('coinpit-index:', JSON.stringify(index))
    if (io) io.emit(TOPIC, index)
  }

  function handler(req, res) {

  }

  feed.getIndex = function () {
    return index
  }
  feed.reset    = function () {
    index = {}
  }
  init()
  return feed
})()
