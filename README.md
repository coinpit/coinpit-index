# coinpit-index
This module listens to BTC/USD spot prices from different exchanges. (currently supported providers: Bitfinex, OKCoin, BitStamp)

## install: npm intsall coinpit-index --save

## usage

```javascript
var config = {
    feed                : ["bitfinex", "bitstamp", "okcoin"], 
    minExternalProviders: 1, // if less than 1 provider, band will return undefined
    ticksize            : 1, // up to 1 decimal place
    bandUpperLimit      : 2, // upper limit on the band from the median external price
    bandLowerLimit      : 2, // lower limit on the band from the median external price
    logExternalPrice    : true // logs price, min and max
}

var coinpitIndex = yield require('coinpit-index')(config)

// returns current external spot price band. {price:<price>, max:<max>, min:<min>
var band = feed.getBand() 

// listen to coinpitIndex when externalSpotPrice changes.
coinpitIndex.on('price', function(band){
    var externalSpotPrice = band.price
    var upperLimitSpotPrice = band.max
    var lowerLimitSpotPrice = band.min
)

```