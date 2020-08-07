import * as Vorpal from 'vorpal'

import Command from './Command';
import { Address, AddressDetailsType, CryptoAddressDetails } from '../verifiable'

export default class AddCryptoAddressCommand extends Command {

  async action(args: Vorpal.Args) {
    const info = this.getPaymentInfo()
    const address: Address = {
      paymentNetwork: args.paymentNetwork.toUpperCase(),
      environment: args.environment.toUpperCase(),
      addressDetailsType: AddressDetailsType.CryptoAddress,
      addressDetails: {
        address: args.address,
        tag: args.tag
      } as CryptoAddressDetails
    }
    info.addresses = info.addresses.concat(address)

    this.localStorage.setItem('payid', info)
    this.prettyLog(info)
  }

  command(): string {
    return 'crypto-address add <paymentNetwork> <environment> <address> [tag]'
  }

  description(): string {
    return 'start building a new PayID'
  }
}
