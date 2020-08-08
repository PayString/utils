import * as Vorpal from 'vorpal'

import {
  Address,
  AddressDetailsType,
  CryptoAddressDetails,
} from '../verifiable'

import Command from './Command'

export default class AddCryptoAddressCommand extends Command {
  protected async action(args: Vorpal.Args): Promise<void> {
    const info = this.getPaymentInfo()
    const paymentNetwork: string = args.paymentNetwork
    const environment: string = args.environment
    const address: Address = {
      paymentNetwork: paymentNetwork.toUpperCase(),
      environment: environment.toUpperCase(),
      addressDetailsType: AddressDetailsType.CryptoAddress,
      addressDetails: {
        address: args.address,
        tag: args.tag,
      } as CryptoAddressDetails,
    }
    info.addresses = info.addresses.concat(address)

    this.localStorage.setPaymentInfo(info)
    this.logPaymentInfo(info)
  }

  protected command(): string {
    return 'crypto-address add <paymentNetwork> <environment> <address> [tag]'
  }

  protected description(): string {
    return 'start building a new PayID'
  }
}
