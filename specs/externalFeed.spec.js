var expect   = require('expect.js')
var feed
var sinon    = require('sinon')
var config   = require('config')
var clock
var mock = require('mock-require')
mock('socket.io', function() {
  return {
    "on": function() {},
    "emit": function() {}
  }
})

describe('External Feed test', function () {

  var MINUTE = 60000

  before(function () {

  })
  beforeEach(function () {
    clock = sinon.useFakeTimers();
    feed = require("../src/index.core")(config)
  })

  afterEach(function () {
    clock.restore()
  })

  it('getPrice when there is no feed', function () {
    var index = feed.getIndex()
    expect(index).to.be.eql({})
  })

  it('current price based on external feed', function () {
    feed.components['mock1'].priceReceived(10.2)
    var index = feed.getIndex()
    expect(index).to.be.eql({
                              price       : 10.2,
                              lastProvider: 'mock1',
                              used        : 1,
                              providers   : { mock1: { price: 10.2, time: 0 } }
                            })
  })

  it('feed expired', function () {

    feed.components['mock1'].priceReceived(10.2)
    clock.tick(config.expiryTime * MINUTE + config.startupDelay + 1)
    var index = feed.getIndex()
    expect(index).to.be.eql({
                              "lastProvider": "mock1",
                              price         : undefined,
                              "providers"   : { "mock1": { "expired": true, "price": 10.2, "time": 0 } },
                              "used"        : 0
                            })
  })
})
