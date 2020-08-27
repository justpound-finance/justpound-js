import { ethers } from 'ethers';
import * as eth from './eth';
import * as util from './util';
import * as comptroller from './comptroller';
import * as cToken from './cToken';
import * as priceFeed from './priceFeed';
import * as comp from './comp';
import * as gov from './gov';
import * as api from './api';
import { constants, decimals } from './constants';

// Turn off Ethers.js warnings
ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR);

/**
 * Creates an instance of the Justpound.js SDK.
 *
 * @param {any{} | string} [provider] Optional Ethereum network provider.
 *     Defaults to Ethers.js fallback mainnet provider.
 * @param {any{}} [options] Optional provider options.
 *
 * @example
 * ```
 * var Justpound = new Justpound(window.ethereum); // web browser
 * 
 * var Justpound = new Justpound('http://127.0.0.1:8545'); // HTTP provider
 * 
 * var Justpound = new Justpound(); // Uses Ethers.js fallback mainnet (for testing only)
 * 
 * var Justpound = new Justpound('ropsten'); // Uses Ethers.js fallback (for testing only)
 * 
 * // Init with private key (server side)
 * var Justpound = new Justpound('https://mainnet.infura.io/v3/_your_project_id_', {
 *   privateKey: '0x_your_private_key_', // preferably with environment variable
 * });
 * 
 * // Init with HD mnemonic (server side)
 * var Justpound = new Justpound('mainnet' {
 *   mnemonic: 'clutch captain shoe...', // preferably with environment variable
 * });
 * ```
 *
 * @returns {object} Returns an instance of Justpound.js SDK.
 */
const Justpound = function(provider: any='mainnet', options: any={}) {
  options.provider = provider || options.provider;
  provider = eth._createProvider(options);

  const instance: any = {
    _provider: provider,
    ...comptroller,
    ...cToken,
    ...priceFeed,
    ...gov,
    claimComp: comp.claimComp,
    delegate: comp.delegate,
    delegateBySig: comp.delegateBySig,
  };

  // Instance needs to know which network the provider connects to, so it can
  //     use the correct contract addresses.
  instance._networkPromise = eth.getProviderNetwork(provider).then((network) => {
    delete instance._networkPromise;
    instance._network = network;
  });

  return instance;
};

Justpound.eth = eth;
Justpound.api = api;
Justpound.util = util;
Justpound._ethers = ethers;
Justpound.decimals = decimals;
Justpound.comp = {
  getCompBalance: comp.getCompBalance,
  getCompAccrued: comp.getCompAccrued,
};
Object.assign(Justpound, constants);

export = Justpound;
