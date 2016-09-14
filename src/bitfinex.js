module.exports = (function () {
  var WebSocket = require('ws');
  var util      = require('util')
  var affirm    = require('affirm.js')
  var channel
  var bitfinex = require('./feeder')('bitfinex')

  function init() {
    try {
      var ws = new WebSocket("wss://api2.bitfinex.com:3000/ws");
      ws.on('open', function open() {
        try {
          util.log('bitfinex: connected')
          var subscriptionMessage = { "event": "subscribe", "channel": "trades", "pair": "BTCUSD" }
          ws.send(JSON.stringify(subscriptionMessage))
        } catch (e) {
          console.log(e)
        }
      });

      ws.onmessage = function (msg) {
        try {
          var message = JSON.parse(msg.data)
          if (message.event === 'subscribed' && message.channel === 'trades') {
            util.log('bitfinex: subscribed to trades')
            channel = message.chanId
          }
          if (Array.isArray(message) && message[0] === channel) {
            updateCurrentPrice(message)
          }
        } catch (e) {
          console.log(e)
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  function updateCurrentPrice(message) {
    if (message[1] === 'hb') return bitfinex.heartbeat()
    if (message[1] !== 'te') return
    bitfinex.priceReceived(message[4])
  }

  init()
  return bitfinex
})()