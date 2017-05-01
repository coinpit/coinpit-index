var expect    = require('expect.js')
var rest      = require('rest.js')
var sinon     = require('sinon')
var bluebird  = require('bluebird')
var restIndex = require('../src/restIndex')
var fixtures  = require("./fixtures/restIndex.spec.json")
require('mocha-generators').install()

describe('Index using rest', function () {

  afterEach(function () {
    if (rest.get.restore) rest.get.restore()
  })

  fixtures.forEach(function (test, index) {
    it('should get the price from ' + test.provider + ' using rest call', function*() {
      sinon.stub(rest, 'get').returns(bluebird.resolve({ body: test.body }))
      var provider = restIndex(test.url, test.path)
      var price  = yield provider.getPrice()
      expect(price).to.equal(test.price)
    })
  })
})
