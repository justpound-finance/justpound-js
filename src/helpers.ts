let request: any;
let http: any;
let https: any;

/**
 * This function acts like a decorator for all methods that interact with the
 *     blockchain. In order to use the correct Justpound protocol addresses, the
 *     Justpound.js SDK must know which network its provider points to. This
 *     function holds up a transaction until the main constructor has determined
 *     the network ID.
 *
 * @hidden
 *
 * @param {Justpound} _Justpound The instance of the Justpound.js SDK.
 *
 */
export async function netId(_Justpound) {
  if (_Justpound._networkPromise) {
    await _Justpound._networkPromise;
  }
}
