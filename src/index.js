var mangler = require('mangler')
var median  = require('median')
var util    = require("util")
var config  = require('config')
var _       = require('lodash')

module.exports = (function () {
  var prices        = {};
  var feedProviders = {}
  var TOPIC         = "coinpit-index#BTCUSD"
  var index, app, io
  var feed          = {}

  function init() {
    config.feed.forEach(feedProvider => {
      feedProviders[feedProvider] = require('./' + feedProvider)
      feedProviders[feedProvider].on('price', function (price) {
        if (!price || isNaN(price)) price = undefined
        prices[feedProvider] = price
        priceChanged(feedProvider)
      })
    })

    if (!config.test) {
      io  = require('socket.io')(config.port);
      io.on('connection', function (socket) {
        socket.emit(TOPIC, index)
      })
      // app.listen(config.port)
    }
  }

  function priceChanged(feedProvider) {
    var list = []
    Object.keys(prices).forEach(provider => {
      var price = prices[provider]
      if (!price || isNaN(price)) return
      list.push(price)
    })
    // externalPrice = list.length === 0 ? undefined : median(list).toFixed(config.ticksize) - 0
    var price = list.length < config.minExternalProviders ? undefined : median(list).toFixed(config.ticksize) - 0
    index     = _.assign({ price: price, lastProvider: feedProvider }, prices)
    if (config.logExternalPrice) util.log('coinpit-index:', JSON.stringify(index))
    if (io) io.emit(TOPIC, index)
  }

  function handler(req, res) {

  }

  feed.getIndex = function () {
    return index
  }
  feed.reset = function(){
    index = {}
  }
  init()
  return feed
})()
