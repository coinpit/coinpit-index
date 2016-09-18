module.exports = (function(){
  var WebSocket = require('ws');
  var reconnect = {}
  reconnect.reconnect = function(ws, init){
    if(ws){
      switch (ws.readyState){
        case WebSocket.CONNECTING:
        case WebSocket.OPEN:
          break;
        case WebSocket.CLOSED:
        case WebSocket.CLOSING:
          init()
      }
    } else{
      init()
    }
  }
  return reconnect
})()