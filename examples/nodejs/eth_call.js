// Example of calling JSON RPC's eth_call with Justpound.js
const Justpound = require('../../dist/nodejs/index.js');

const cEthAddress = Justpound.util.getAddress(Justpound.cETH);

(async function() {

  const srpb = await Justpound.eth.read(
    cEthAddress,
    'function supplyRatePerBlock() returns (uint256)',
    // [], // [optional] parameters
    // {}  // [optional] call options, provider, network, plus ethers "overrides"
  );

  console.log('cETH market supply rate per block:', srpb.toString());

})().catch(console.error);
