var mangler  = require('mangler')
var median   = require('median')
var util     = require("util")
var _        = require('lodash')

module.exports = function(config) {
  var defauldConfig = {
    feed                : ["bitfinex", "bitstamp", "okcoin"],
    minExternalProviders: 1, // if less than 1 provider, band will return undefined
    ticksize            : 1, // up to 1 decimal place
    bandUpperLimit      : 2, // upper limit on the band from the median external price
    bandLowerLimit      : 2, // lower limit on the band from the median external price
    logExternalPrice    : true // logs price, min and max
  }
  config            = config || {}
  config            = _.assignIn(defauldConfig, config)
  var prices        = {};
  var feedProviders = {}

  function init() {
    config.feed.forEach(feedProvider => {
      feedProviders[feedProvider] = require('./src/' + feedProvider)
      feedProviders[feedProvider].on('price', function (price) {
        if (!price || isNaN(price)) price = undefined
        prices[feedProvider] = price
        priceChanged(feedProvider)
      })
    })
  }

  var externalPrice
  var Emitter = require('events').EventEmitter;
  var emitter = new Emitter();
  var feed    = {}
  feed.on     = emitter.on.bind(emitter)
  feed.once   = emitter.once.bind(emitter)

  function priceChanged(feedProvider) {
    var list = []
    Object.keys(prices).forEach(provider => {
      var price = prices[provider]
      if (!price || isNaN(price)) return
      list.push(price)
    })
    // externalPrice = list.length === 0 ? undefined : median(list).toFixed(config.ticksize) - 0
    externalPrice = list.length < config.minExternalProviders ? undefined : median(list).toFixed(config.ticksize) - 0
    if (config.logExternalPrice) util.log('externalPrice:', externalPrice, JSON.stringify(prices), feedProvider)
    emitter.emit('price', externalPrice)
  }

  feed.getPrices = function () {
    return prices
  }

  feed.getBand = function () {
    if (!externalPrice) return { max: undefined, min: undefined }
    return {
      max  : mangler.fixed(externalPrice + config.bandUpperLimit),
      price: mangler.fixed(externalPrice),
      min  : mangler.fixed(externalPrice - config.bandLowerLimit)
    }
  }

  feed.reset = function () {
    externalPrice = undefined
    prices        = {}
  }

  init()
  return feed
}
