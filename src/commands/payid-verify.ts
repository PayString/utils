import Command from './Command';
import { Address, PaymentInformation, verifyPayId } from '../verifiable'

export default class VerifyPayIdCommand extends Command {

  async action() {
    const info = this.getPaymentInfo()
    const copy: PaymentInformation = JSON.parse(JSON.stringify(info))
    if (verifyPayId(info)) {
      copy.addresses = copy.verifiedAddresses.map(address => {
        return JSON.parse(address.payload).payIdAddress as Address
      })
      copy.verifiedAddresses = []
      this.logJson(copy)
      this.vorpal.log(`Successfully verified ${copy.payId}`)
    } else {
      this.vorpal.log(`Failed to verify ${copy.payId}`)
    }
  }

  command(): string {
    return 'payid verify'
  }

  description(): string {
    return 'Verify the loaded PayID'
  }
}
