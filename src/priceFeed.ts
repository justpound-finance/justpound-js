import { ethers } from 'ethers';
import * as eth from './eth';
import { netId } from './helpers';
import { constants, address, abi, cTokens, underlyings, decimals, opfAssets } from './constants';

function validateAsset(asset: string, argument: string, errorPrefix: string) {
  if (typeof asset !== 'string' || asset.length < 1) {
    throw Error(errorPrefix + 'Argument `' + argument + '` must be a non-empty string.');
  }

  const assetIsCToken = asset[0] === 'c';

  const cTokenName = assetIsCToken ? asset : 'c' + asset;
  const cTokenAddress = address[this._network.name][cTokenName];

  let underlyingName = assetIsCToken ? asset.slice(1, asset.length) : asset;
  const underlyingAddress = address[this._network.name][underlyingName];

  if (
    (!cTokens.includes(cTokenName) || !underlyings.includes(underlyingName)) &&
    !opfAssets.includes(underlyingName)
  ) {
    throw Error(errorPrefix + 'Argument `' + argument + '` is not supported.');
  }

  const underlyingDecimals = decimals[underlyingName];

  // The open price feed reveals BTC, not WBTC.
  underlyingName = underlyingName === 'WBTC' ? 'BTC' : underlyingName;

  return [assetIsCToken, cTokenName, cTokenAddress, underlyingName, underlyingAddress, underlyingDecimals];
}

async function cTokenExchangeRate(cTokenAddress, cTokenName, underlyingDecimals) {
  const address = cTokenAddress;
  const method = 'exchangeRateCurrent';
  const options = {
    _JustpoundProvider: this._provider,
    abi: cTokenName === constants.cETH ? abi.cEther : abi.cErc20,
  };
  const exchangeRateCurrent = await eth.read(address, method, [], options);
  const mantissa = 18 + parseInt(underlyingDecimals) - 8; // cToken always 8 decimals
  const oneCTokenInUnderlying = exchangeRateCurrent / Math.pow(10, mantissa);

  return oneCTokenInUnderlying;
}

/**
 * Gets an asset's price from the Justpound protocol open price feed. The price
 *    of the asset can be returned in any other supported asset value, including
 *    all cTokens and underlyings.
 *
 * @param {string} asset A string of a supported asset in which to find the
 *    current price.
 * @param {string} [inAsset] A string of a supported asset in which to express
 *    the `asset` parameter's price. This defaults to USD.
 *
 * @returns {string} Returns a string of the numeric value of the asset.
 *
 * @example
 * ```
 * const Justpound = new Justpound(window.ethereum);
 * let price;
 * 
 * (async function () {
 * 
 *   price = await Justpound.getPrice(Justpound.WBTC);
 *   console.log('WBTC in USD', price); // 6 decimals, see Open Price Feed docs
 * 
 *   price = await Justpound.getPrice(Justpound.BAT, Justpound.USDC); // supports cTokens too
 *   console.log('BAT in USDC', price);
 * 
 * })().catch(console.error);
 * ```
 */
export async function getPrice(asset: string, inAsset: string=constants.USDC) {
  await netId(this);
  const errorPrefix = 'Justpound [getPrice] | ';

  const [
    assetIsCToken, cTokenName, cTokenAddress, underlyingName, underlyingAddress, underlyingDecimals
  ] = validateAsset.bind(this)(asset, 'asset', errorPrefix);

  const [
    inAssetIsCToken, inAssetCTokenName, inAssetCTokenAddress, inAssetUnderlyingName, inAssetUnderlyingAddress, inAssetUnderlyingDecimals
  ] = validateAsset.bind(this)(inAsset, 'inAsset', errorPrefix);

  const priceFeedAddress = address[this._network.name].PriceFeed;
  const trxOptions: any = {
    _JustpoundProvider: this._provider,
    abi: abi.PriceFeed,
  };

  const assetUnderlyingPrice = await eth.read(priceFeedAddress, 'price', [ underlyingName ], trxOptions);
  const inAssetUnderlyingPrice =  await eth.read(priceFeedAddress, 'price', [ inAssetUnderlyingName ], trxOptions);

  let assetCTokensInUnderlying, inAssetCTokensInUnderlying;

  if (assetIsCToken) {
    assetCTokensInUnderlying = await cTokenExchangeRate.bind(this)(cTokenAddress, cTokenName, underlyingDecimals);
  }

  if (inAssetIsCToken) {
    inAssetCTokensInUnderlying = await cTokenExchangeRate.bind(this)(inAssetCTokenAddress, inAssetCTokenName, inAssetUnderlyingDecimals);
  }

  let result;
  if (!assetIsCToken && !inAssetIsCToken) {
    result = assetUnderlyingPrice / inAssetUnderlyingPrice;
  } else if (assetIsCToken && !inAssetIsCToken) {
    const assetInOther = assetUnderlyingPrice / inAssetUnderlyingPrice;
    result = assetInOther * assetCTokensInUnderlying;
  } else if (!assetIsCToken && inAssetIsCToken) {
    const assetInOther = assetUnderlyingPrice / inAssetUnderlyingPrice;
    result = assetInOther / inAssetCTokensInUnderlying;
  } else {
    const assetInOther = assetUnderlyingPrice / inAssetUnderlyingPrice;
    const cTokensInUnderlying = assetInOther / assetCTokensInUnderlying;
    result = inAssetCTokensInUnderlying * cTokensInUnderlying;
  }

  return result;
}
