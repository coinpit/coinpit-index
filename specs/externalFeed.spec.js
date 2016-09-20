var expect   = require('expect.js')
var mockFeed = require('../src/mockProvider')
var feed     = require("../src/index")
var sinon    = require('sinon')
var config   = require('config')
var clock
describe('External Feed test', function () {

  before(function () {
  })
  beforeEach(function () {
    feed.reset()
    clock = sinon.useFakeTimers();
  })

  afterEach(function () {
    feed.reset()
    clock.restore()
  })

  it('getPrice when there is no feed', function () {
    // mockFeed.priceReceived(undefined)
    var index = feed.getIndex()
    expect(index).to.be.eql({})
  })

  it('current price based on external feed', function () {
    mockFeed.priceReceived(10.2)
    var index = feed.getIndex()
    expect(index).to.be.eql({
                              price       : 10.2,
                              lastProvider: 'mockProvider',
                              used        : 1,
                              providers   : { mockProvider: { price: 10.2, time: 0 } }
                            })
  })

  it('feed expired', function () {

    mockFeed.priceReceived(10.2)
    clock.tick(config.expiryTime * 60000 + 1)
    var index = feed.getIndex()
    expect(index).to.be.eql({
                              "lastProvider": "mockProvider",
                              price         : undefined,
                              "providers"   : { "mockProvider": { "expired": true, "price": 10.2, "time": 0 } },
                              "used"        : 0
                            })
  })
})