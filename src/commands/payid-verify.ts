import { PaymentInformation, verifyPayId } from '../verifiable'
import { convertJsonToVerifiedAddress } from '../verifiable/converters'

import Command from './Command'

/**
 * Verifies the signatures and certs for verified addresses of the currently loaded PayID.
 */
export default class VerifyPayIdCommand extends Command {
  protected async action(): Promise<void> {
    const info = this.getPaymentInfo()
    const copy: PaymentInformation = JSON.parse(JSON.stringify(info))
    if (verifyPayId(info)) {
      copy.addresses = copy.verifiedAddresses.map((address) => {
        return convertJsonToVerifiedAddress(address.payload)
      })
      this.logPaymentInfo(copy)
      this.vorpal.log(`Successfully verified ${copy.payId}`)
    } else {
      this.vorpal.log(`Failed to verify ${copy.payId}`)
    }
  }

  /**
   * @override
   */
  protected command(): string {
    return 'payid verify'
  }

  /**
   * @override
   */
  protected description(): string {
    return 'Verify the loaded PayID'
  }
}
