var util      = require("util")
var config    = require('config')

module.exports = (function () {

  process.on('uncaughtException', (err) => {
    console.log("################################## uncaught exception ######################################")
    util.log(err.stack)
    console.log("################################## uncaught exception ######################################")
  })

  var index = require('./index.core')(config)
})()
