import { Address, PaymentInformation, verifyPayId } from '../verifiable'

import Command from './Command'

export default class VerifyPayIdCommand extends Command {
  protected async action(): Promise<void> {
    const info = this.getPaymentInfo()
    const copy: PaymentInformation = JSON.parse(JSON.stringify(info))
    if (verifyPayId(info)) {
      copy.addresses = copy.verifiedAddresses.map((address) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- because JSON
        return JSON.parse(address.payload).payIdAddress as Address
      })
      copy.verifiedAddresses = []
      this.logPaymentInfo(copy)
      this.vorpal.log(`Successfully verified ${copy.payId}`)
    } else {
      this.vorpal.log(`Failed to verify ${copy.payId}`)
    }
  }

  protected command(): string {
    return 'payid verify'
  }

  protected description(): string {
    return 'Verify the loaded PayID'
  }
}
