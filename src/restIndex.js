var rest     = require('rest.js')
var affirm   = require('affirm.js')
var url      = require('url')
var util     = require('util')
var bluebird = require('bluebird')
var _        = require('lodash')

module.exports = function (restProvider) {
  var index = _.assign({}, restProvider)
  affirm(index.url && url.parse(index.url), 'Invalid provider url')
  affirm(index.path && Array.isArray(index.path), 'path must be an array')

  index.getPrice = bluebird.coroutine(function*() {
    try {
      var response = yield rest.get(index.url)
      affirm(response && response.body, 'Invalid response: ' + response.statusCode)
      var data = response.body
      if (typeof data === 'string') data = JSON.parse(data)
      var price = getPriceUsingPath(data, index.path) - 0
      affirm(!isNaN(price) && price !== Infinity && price !== null && price > 0, 'Invalid price[' + price + "]")
      return price
    } catch (e) {
      util.log(e.stack)
      return undefined
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
