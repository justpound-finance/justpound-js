// Example of fetching a Justpound protocol contract address with Justpound.js
const Justpound = require('../../dist/nodejs/index.js');

const batAddress = Justpound.util.getAddress(Justpound.BAT);
const cbatAddress = Justpound.util.getAddress(Justpound.cBAT);
const cEthAddressRopsten = Justpound.util.getAddress(Justpound.cETH, 'ropsten');

console.log('BAT (mainnet)', batAddress);
console.log('cBAT (mainnet)', cbatAddress);

console.log('cETH (ropsten)', cEthAddressRopsten);
