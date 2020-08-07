import Command from './Command';
import { IdentityKeySigningParams, ServerKeySigningParams, signWithKeys } from '../verifiable'
import { VerifiedAddress } from '../verifiable/verifiable-payid'
import { JWK } from 'jose'

export default class SignPayIdCommand extends Command {

  async action() {
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

    info.verifiedAddresses = info.addresses.map(address => {
      const jws = signWithKeys(payId, address, signingKeys)
      return <VerifiedAddress>{
        payload: jws.payload,
        signatures: jws.signatures
      }
    })
    this.localStorage.setItem('payid', info)
    this.prettyLog(info)
  }

  private getSigningKeys(): Array<IdentityKeySigningParams | ServerKeySigningParams> {
    let params: Array<IdentityKeySigningParams | ServerKeySigningParams> = []
    const serverKey = this.localStorage.getItem('server-key')
    const serverCert = this.localStorage.getItem('server-cert')
    const identityKey = this.localStorage.getItem('identity-key')
    if (serverKey && serverCert) {
      params = params.concat(new ServerKeySigningParams(
        JWK.asKey(serverKey),
        this.getAlgorithm(serverKey),
        serverCert))
    }
    if (identityKey) {
      params = params.concat(new IdentityKeySigningParams(
        JWK.asKey(identityKey),
        this.getAlgorithm(identityKey)))
    }
    return params
  }

  private getAlgorithm(jwk: JWK.RSAKey | JWK.ECKey): string {
    if (jwk.kty === 'EC') {
      return 'ES256K'
    }
    return 'RS512'
  }

  command(): string {
    return 'payid sign'
  }

  description(): string {
    return 'sign the loaded PayID with the loaded signing keys'
  }
}
