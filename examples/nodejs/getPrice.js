// Example of fetching prices from the Justpound protocol's open price feed using
// Justpound.js
const Justpound = require('../../dist/nodejs/index.js');
const Justpound = new Justpound();

let price;
(async function() {

  price = await Justpound.getPrice(Justpound.BAT);
  console.log('BAT in USDC', price);

  price = await Justpound.getPrice(Justpound.cBAT);
  console.log('cBAT in USDC', price);

  price = await Justpound.getPrice(Justpound.BAT, Justpound.cUSDC);
  console.log('BAT in cUSDC', price);

  price = await Justpound.getPrice(Justpound.BAT, Justpound.ETH);
  console.log('BAT in ETH', price);

})().catch(console.error);
