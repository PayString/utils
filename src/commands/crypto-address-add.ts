import * as Vorpal from 'vorpal'

import { Address, AddressDetailsType } from '../verifiable'

import Command from './Command'

/**
 * Command to add a crypto address to the current PayID in scope.
 */
export default class AddCryptoAddressCommand extends Command {
  /**
   * @override
   */
  protected async action(args: Vorpal.Args): Promise<void> {
    const info = this.getPaymentInfo()
    const paymentNetwork: string = args.paymentNetwork
    const environment: string = args.environment
    const cryptoAddress: string = args.address
    const tag: string | undefined = args.tag

    const address: Address = {
      paymentNetwork: paymentNetwork.toUpperCase(),
      environment: environment.toUpperCase(),
      addressDetailsType: AddressDetailsType.CryptoAddress,
      addressDetails: {
        address: cryptoAddress,
        tag,
      },
    }
    info.addresses = info.addresses.concat(address)

    this.localStorage.setPaymentInfo(info)
    this.logPaymentInfo(info)
  }

  /**
   * @override
   */
  protected command(): string {
    return 'crypto-address add <paymentNetwork> <environment> <address> [tag]'
  }

  /**
   * @override
   */
  protected description(): string {
    return 'start building a new PayID'
  }
}
