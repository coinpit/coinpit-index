module.exports = (function () {
  var WebSocket = require('ws');
  var util      = require('util')
  var coinbase  = require('./feeder')('coinbase')

  function init() {
    try {
      var ws = new WebSocket("wss://ws-feed.gdax.com");
      ws.on('open', function open() {
        try {
          util.log('coinbase: connected')
          var subscriptionMessage = {
            "type"      : "subscribe",
            "product_id": "BTC-USD"
          }
          ws.send(JSON.stringify(subscriptionMessage))
        } catch (e) {
          console.log(e)
        }
      });

      ws.onmessage = function (msg) {
        try {
          var message = JSON.parse(msg.data)
          if(message.type !== 'match') return
          coinbase.priceReceived(message.price)
        } catch (e) {
          console.log(e)
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  init()
  return coinbase
})()