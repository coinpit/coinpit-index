var expect   = require('expect.js')
var mockFeed = require('../src/mockProvider')
var feed     = require("../src/index")

describe('External Feed test', function () {

  before(function () {
  })
  beforeEach(function () {
  })

  afterEach(function () {
    feed.reset()
  })

  it('getPrice when there is no feed', function () {
    mockFeed.priceReceived(undefined)
    var index = feed.getIndex()
    expect(index).to.be.eql({
                              price       : undefined,
                              lastProvider: 'mockProvider',
                              mockProvider: undefined
                            })
  })

  it('current price based on external feed', function () {
    mockFeed.priceReceived(10.2)
    var index = feed.getIndex()
    expect(index).to.be.eql({
                              price       : 10.2,
                              lastProvider: 'mockProvider',
                              mockProvider: 10.2
                            })
  })

  it('after reseting price from feeder', function () {
    mockFeed.priceReceived(10.2)
    mockFeed.priceReceived(undefined)
    var index = feed.getIndex()
    expect(index).to.be.eql({
                              price       : undefined,
                              lastProvider: 'mockProvider',
                              mockProvider: undefined
                            })
  })
})