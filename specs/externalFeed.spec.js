var expect   = require('expect.js')
var sinon    = require('sinon')
var config   = require('config')
var mocksock = require('./mocksock')
var bluebird = require('bluebird')
var feed
var clock

require('mocha-generators').install()

describe('External Feed test', function () {

  var MINUTE = 60000

  before(function () {

  })
  beforeEach(function () {
    mocksock.mock()
    clock = sinon.useFakeTimers();
    feed = require("../src/index.core")(config)
  })

  afterEach(function () {
    mocksock.stop()
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
                              providers   : [ { "name": "mock1", "type": "socket", price: 10.2, time: 0 } ]
                            })
  })

  it.skip('feed expired', function* () {
    feed.components['mock1'].priceReceived(10.2)
    clock.tick(config.expiryTime * MINUTE + config.startupDelay + 1)
    yield bluebird.delay(1)
    var index = feed.getIndex()
    expect(index).to.be.eql({
                              "lastProvider": "mock1",
                              price         : undefined,
                              "providers"   : [ { "name": "mock1", "type": "socket", "expired": true, "price": 10.2, "time": 0 } ],
                              "used"        : 0
                            })
  })
})
