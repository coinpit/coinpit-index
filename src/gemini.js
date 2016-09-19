module.exports = (function () {
  var WebSocket = require('ws');
  var util      = require('util')
  var affirm    = require('affirm.js')
  var rest      = require('rest.js')
  var gemini    = require('./feeder')('gemini')
  var ws

  gemini.reconnect = function () {
    updatePriceFromTicker()
    require('./wsReconnect').reconnect(ws, init)
  }

  function updatePriceFromTicker() {
    rest.get("https://api.gemini.com/v1/pubticker/btcusd", { "Content-Type": "application/json" }).then(function (ticker) {
      gemini.priceReceived(ticker.body.last)
    })
  }

  function init() {
    try {
      updatePriceFromTicker()
      ws = new WebSocket("wss://api.gemini.com/v1/marketdata/btcusd");
      ws.on('open', function open() {
        try {
          util.log('gemini: connected')
        } catch (e) {
          console.log(e)
        }
      });
      ws.on('error', function (e) {
        console.log('gemini connection failure', e)
      })
      ws.onmessage = function (msg) {
        try {
          var message = JSON.parse(msg.data)
          // console.log(JSON.stringify(message))
          message.events.forEach(event => {
            if (event.type === 'trade') {
              gemini.priceReceived(event.price)
            }
          })
        } catch (e) {
          console.log(e)
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  init()
  return gemini
})()