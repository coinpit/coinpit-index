var expect = require('expect.js')

describe('Coinpit Index', function() {
  it('should return price from socket.io if socket connected')
  it('should return price from REST if socket is unconnected')
  it('should drop provider price after configured minutes of no updated prices')
  it('should send undefined price if number of providers online less than configured min')
  it('should wait for configured startup time to get as many providers online as practical')
  it('should return median price of all online providers')
})
