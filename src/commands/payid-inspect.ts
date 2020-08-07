import Command from './Command';
import { PaymentInformationInspector } from '../verifiable'
import * as Vorpal from 'vorpal'
import LocalStorage from './localstorage'

export default class InspectPayIdCommand extends Command {

  readonly paymentInformationInspector: PaymentInformationInspector

  constructor(vorpal: Vorpal, localStorage: LocalStorage) {
    super(vorpal, localStorage)
    this.paymentInformationInspector = new PaymentInformationInspector()
  }

  async action() {
    const info = this.getPaymentInfo()
    const result = this.paymentInformationInspector.inspect(info)
    this.vorpal.log(`${info.payId} ${validString(result.isVerified)}`)
    result.verifiedAddressesResults.forEach(addressResult => {
      const address = addressResult.address
      const cryptoAddress = ('address' in address.addressDetails) ? address.addressDetails.address : ''
      this.vorpal.log(`Found verified ${address.paymentNetwork} ${address.environment} address ${cryptoAddress}`)
      this.vorpal.log(`- Signed with ${addressResult.signaturesResults.length} signature(s)`)
      addressResult.signaturesResults.forEach((signatureResult, sigIndex) => {
        this.vorpal.log(`- Signature ${sigIndex+1} ${validString(signatureResult.isSignatureValid)}`)
        if (signatureResult.jwk) {
          const thumbprint = signatureResult.jwk.thumbprint
          this.vorpal.log(`  - Signed with ${signatureResult.jwk.kty} ${signatureResult.keyType} with thumbprint ${thumbprint}`)
        }
        if (signatureResult.certificateChainResult) {
          this.vorpal.log(`  - Certificate chain ${validString(signatureResult.certificateChainResult.isChainValid)}`)
          signatureResult.certificateChainResult.certificateResults.forEach((chainResult, chainIndex) => {
            this.vorpal.log(`     - Certificate ${chainIndex + 1} for ${chainResult.issuedTo}, issued by ${chainResult.issuedBy}`)
          })
        }
      })
    })
  }

  command(): string {
    return 'payid inspect-signatures'
  }

  description(): string {
    return 'Inspect signatures on the loaded PayID'
  }
}

function validString(valid: boolean) {
  return `${valid ? 'is' : 'is NOT'} verified`
}