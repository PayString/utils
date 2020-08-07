import * as Vorpal from 'vorpal'

import Command from './Command';
import { PaymentInformation } from '../verifiable'

export default class InitPayIdCommand extends Command {

  async action(args: Vorpal.Args) {
    const info: PaymentInformation = {
      payId: args.payid,
      addresses: [],
      verifiedAddresses: [],
    }
    this.localStorage.setItem('payid', info)
    this.prettyLog(info)
  }

  command(): string {
    return 'payid init <payid>'
  }

  description(): string {
    return 'initializes a new PayID'
  }

}