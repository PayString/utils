import Command from './Command';
import {
  Address,
  CertificateChainValidator,
  ProtectedHeaders,
  verifySignedAddress
} from '../verifiable'
import { JWK, JWS } from 'jose'
import GeneralJWS = JWS.GeneralJWS
import * as Vorpal from 'vorpal'
import LocalStorage from './localstorage'
import { extractX5CCertificates } from '../verifiable/certificate-chain-validator'
import { KeyObject } from "crypto"

export default class InspectPayIdCommand extends Command {

  readonly validator: CertificateChainValidator

  constructor(vorpal: Vorpal, localStorage: LocalStorage) {
    super(vorpal, localStorage)
    this.validator = new CertificateChainValidator()
  }

  async action() {
    const info = this.getPaymentInfo()
    const payId = info.payId
    if (!payId) {
      this.vorpal.log('missing payid')
      return
    }
    info.verifiedAddresses.forEach(verifiedAddress => {
      const address = JSON.parse(verifiedAddress.payload).payIdAddress as Address
      const cryptoAddress = ('address' in address.addressDetails) ? address.addressDetails.address : ''
      this.vorpal.log(`Found verified ${address.paymentNetwork} ${address.environment} address ${cryptoAddress}`)
      this.vorpal.log(`- Signed with ${verifiedAddress.signatures.length} signature(s)`)
      verifiedAddress.signatures.forEach((recipient, rIndex) => {
        const headers: ProtectedHeaders =
          JSON.parse(Buffer.from(recipient.protected, 'base64').toString('utf-8'))
        const jwsWithSingleSignature = <GeneralJWS>{
          payload: verifiedAddress.payload,
          signatures: [
            {
              signature: recipient.signature,
              protected: recipient.protected,
            }
          ]
        }
        const jwk = JWK.asKey(headers.jwk as KeyObject)
        this.vorpal.log(`- Signature ${rIndex+1} is a ${jwk.kty} ${headers.name}`)
        const validSignature = verifySignedAddress(payId, jwsWithSingleSignature, false)
        this.vorpal.log(`  - Signature ${validSignature ? 'is' : 'is NOT '} valid`)
        if (headers.name === 'serverKey') {
          const validChain = this.validator.verifyCertificateChainJWS(jwsWithSingleSignature)
          this.vorpal.log(`  - Certificate chain ${validChain ? 'is' : 'is NOT '} valid`)
          extractX5CCertificates(recipient).forEach((cert, cIndex) => {
            const owner = cert.subject.getField('CN').value
            const issuedBy = cert.issuer.getField('CN').value
            this.vorpal.log(`     - Certificate ${cIndex + 1} for ${owner}, issued by ${issuedBy}`)
          })
        }
      })
      this.vorpal.log('')
    })
  }

  command(): string {
    return 'payid inspect-signatures'
  }

  description(): string {
    return 'Inspect signatures on the loaded PayID'
  }
}
