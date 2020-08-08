import * as Vorpal from 'vorpal'

import { PaymentInformation } from '../verifiable'

import Command from './Command'

export default class InitPayIdCommand extends Command {
  protected async action(args: Vorpal.Args): Promise<void> {
    const info: PaymentInformation = {
      payId: args.payid,
      addresses: [],
      verifiedAddresses: [],
    }
    this.localStorage.setPaymentInfo(info)
    this.logPaymentInfo(info)
  }

  protected command(): string {
    return 'payid init <payid>'
  }

  protected description(): string {
    return 'initializes a new PayID'
  }
}
