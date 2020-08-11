import {
  getDefaultAlgorithm,
  IdentityKeySigningParams,
  ServerKeySigningParams,
  signWithKeys,
  toKey,
} from '../verifiable'
import { convertToVerifiedAddress } from '../verifiable/converters'

import Command from './Command'

/**
 * Signs the currently loaded PayID PaymentInformation using the loaded signings keys.
 */
export default class SignPayIdCommand extends Command {
  protected async action(): Promise<void> {
    const info = this.getPaymentInfo()
    const payId = info.payId
    if (!payId) {
      this.vorpal.log('missing payid')
      return
    }
    const signingKeys = this.getSigningKeys()
    if (signingKeys.length === 0) {
      this.vorpal.log(
        'you must generate or load a key before signing using ' +
          `keys generate 'identity-key' or 'keys load identity-key'`,
      )
      return
    }

    const updatedAddresses = info.addresses.map((address) => {
      const jws = signWithKeys(payId, address, signingKeys)
      return convertToVerifiedAddress(jws)
    })
    const updated = {
      payId: info.payId,
      addresses: info.addresses,
      verifiedAddresses: updatedAddresses,
    }

    this.localStorage.setPaymentInfo(updated)
    this.logPaymentInfo(updated)
  }

  /**
   * @override
   */
  protected command(): string {
    return 'payid sign'
  }

  /**
   * @override
   */
  protected description(): string {
    return 'sign the loaded PayID with the loaded signing keys'
  }

  /**
   * Gets the list of signing keys and converts them to SigningKeyParams.
   *
   * @returns List of keys.
   */
  private getSigningKeys(): Array<
    IdentityKeySigningParams | ServerKeySigningParams
  > {
    let params: Array<IdentityKeySigningParams | ServerKeySigningParams> = []
    const serverKey = this.localStorage.getSigningKey('server-key')
    const serverCert = this.localStorage.getSigningKey('server-cert')
    const identityKey = this.localStorage.getSigningKey('identity-key')
    if (serverKey) {
      if (serverCert) {
        params = params.concat(
          new ServerKeySigningParams(
            toKey(serverKey),
            getDefaultAlgorithm(serverKey),
            serverCert,
          ),
        )
      }
    }
    if (identityKey) {
      params = params.concat(
        new IdentityKeySigningParams(
          toKey(identityKey),
          getDefaultAlgorithm(identityKey),
        ),
      )
    }
    return params
  }
}
