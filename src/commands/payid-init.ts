import * as Vorpal from 'vorpal'

import { PaymentInformation } from '../verifiable'

import Command from './Command'

/**
 * Initializes a new PayID PaymentInformation object that can be decorated with addresses and signed using
 * signing keys.
 */
export default class InitPayIdCommand extends Command {
  /**
   * @override
   */
  protected async action(args: Vorpal.Args): Promise<void> {
    const info: PaymentInformation = {
      payId: args.payid,
      addresses: [],
      verifiedAddresses: [],
    }
    this.localStorage.setPaymentInfo(info)
    this.logPaymentInfo(info)
  }

  /**
   * @override
   */
  protected command(): string {
    return 'payid init <payid>'
  }

  /**
   * @override
   */
  protected description(): string {
    return 'initializes a new PayID'
  }
}
