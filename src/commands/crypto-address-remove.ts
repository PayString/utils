import * as Vorpal from 'vorpal'

import Command from './Command';

export default class RemoveCryptoAddressCommand extends Command {

  async action(args: Vorpal.Args) {
    const info = this.getPaymentInfo()
    const toRemove = info.addresses.find(address => {
      if ('address' in address.addressDetails) {
        return address.addressDetails.address === args.address
      }
      return false
    })
    if (!toRemove) {
      this.vorpal.log(`address ${args.address} not found`)
      return
    }
    info.addresses.splice(info.addresses.indexOf(toRemove), 1)
    this.localStorage.setItem('payid', info)
    this.vorpal.log(JSON.stringify(info, null, 2))
  }

  command(): string {
    return 'crypto-address remove <address>'
  }

  description(): string {
    return 'remove an address from the current payid'
  }

}