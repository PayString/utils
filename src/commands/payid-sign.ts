import Command from './Command';
import {
  IdentityKeySigningParams,
  ServerKeySigningParams,
  signWithKeys
} from '../verifiable'
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

    info.verifiedAddresses = info.addresses.map(address => {
      const jws = signWithKeys(payId, address, signingKeys)
      return <VerifiedAddress>{
        payload: jws.payload,
        signatures: jws.signatures
      }
    })
    this.localStorage.setItem('payid', info)
    this.vorpal.log(JSON.stringify(info, null, 2))
  }

  private getSigningKeys(): Array<IdentityKeySigningParams | ServerKeySigningParams> {
    let params: Array<IdentityKeySigningParams | ServerKeySigningParams> = []
    const serverKey = this.localStorage.getItem('server-key')
    const serverCert = this.localStorage.getItem('server-cert')
    const identityKey = this.localStorage.getItem('identity-key')
    if (serverKey && serverCert) {
      console.log(JSON.stringify(serverKey))
      console.log(JSON.stringify(serverCert))
      params = params.concat(new ServerKeySigningParams(serverKey, 'RS256', serverCert))
    }
    if (identityKey) {
      console.log(JSON.stringify(identityKey))
      params = params.concat(new IdentityKeySigningParams(JWK.asKey(identityKey), 'ES256K'))
    }
    return params
  }

  command(): string {
    return 'payid sign'
  }

  description(): string {
    return 'sign payid'
  }
}
