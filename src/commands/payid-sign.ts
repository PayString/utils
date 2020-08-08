import {
  getAlgorithm,
  IdentityKeySigningParams,
  ServerKeySigningParams,
  signWithKeys,
  toKey,
} from '../verifiable'
import { VerifiedAddress } from '../verifiable/verifiable-payid'

import Command from './Command'

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
      this.vorpal.log(`you must generate or load a key before signing`)
      return
    }

    info.verifiedAddresses = info.addresses.map((address) => {
      const jws = signWithKeys(payId, address, signingKeys)
      return <VerifiedAddress>{
        payload: jws.payload,
        signatures: jws.signatures,
      }
    })
    this.localStorage.setPaymentInfo(info)
    this.logPaymentInfo(info)
  }

  protected command(): string {
    return 'payid sign'
  }

  protected description(): string {
    return 'sign the loaded PayID with the loaded signing keys'
  }

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
            getAlgorithm(serverKey),
            serverCert,
          ),
        )
      }
    }
    if (identityKey) {
      params = params.concat(
        new IdentityKeySigningParams(
          toKey(identityKey),
          getAlgorithm(identityKey),
        ),
      )
    }
    return params
  }
}
