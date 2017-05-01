var rest     = require('rest.js')
var affirm   = require('affirm.js')
var url      = require('url')
var util     = require('util')
var bluebird = require('bluebird')

module.exports = function (providerUrl, path) {
  affirm(providerUrl && url.parse(providerUrl), 'Invalid provider url')
  affirm(path && Array.isArray(path), 'path must be an array')

  var index      = {}
  index.getPrice = bluebird.coroutine(function*() {
    try {
      var response = yield rest.get(providerUrl)
      affirm(response && response.body, 'Invalid response: ' + response.statusCode)
      var data = response.body
      if (typeof data === 'string') data = JSON.parse(data)
      var price = getPriceUsingPath(data, path) - 0
      affirm(!isNaN(price) && price !== Infinity && price !== null && price > 0, 'Invalid price[' + price + "]")
      return price
    } catch (e) {
      util.log(e.stack)
      // todo: error handling
    }
  })

  function getPriceUsingPath(data, path) {
    if (path.length === 0) return data
    var key = path[0]
    path    = path.slice(1)
    data    = data[key]
    affirm(data, 'key [' + key + '] not found in data retrieved from provider. ' + JSON.stringify(data))
    return getPriceUsingPath(data, path)
  }

  return index
}