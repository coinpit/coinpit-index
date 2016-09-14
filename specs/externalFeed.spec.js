var expect   = require('expect.js')
var mockFeed = require('../src/mockProvider')
var feed

describe('External Feed test', function () {

  before(function() {
    feed = require('../index')({
                                 feed          : ['mockProvider'],
                                 bandUpperLimit: 1,
                                 bandLowerLimit: 1,
                               })
  })
  beforeEach(function () {
    feed.reset()
  })

  afterEach(function () {
    feed.reset()
  })

  it('getBand when there is no feed', function () {
    mockFeed.priceReceived(undefined)
    var band = feed.getBand()
    expect(band.max).to.be.eql(undefined)
    expect(band.min).to.be.eql(undefined)
  })

  it('current price band based on external feed', function () {
    mockFeed.priceReceived(10.2)
    var band = feed.getBand()
    expect(band.max).to.be.eql(11.2)
    expect(band.min).to.be.eql(9.2)
  })

  it('after reseting price from feeder', function () {
    mockFeed.priceReceived(10.2)
    mockFeed.priceReceived(undefined)
    var band = feed.getBand()
    expect(band.max).to.be.eql(undefined)
    expect(band.min).to.be.eql(undefined)

  })
})