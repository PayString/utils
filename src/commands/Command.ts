import * as Vorpal from 'vorpal'
import { Args } from 'vorpal'
import LocalStorage from './localstorage'
import { PaymentInformation } from '../verifiable'

abstract class Command {

  protected readonly localStorage: LocalStorage

  protected readonly vorpal: Vorpal

  constructor(vorpal: Vorpal, localStorage: LocalStorage) {
    this.localStorage = localStorage
    this.vorpal = vorpal
  }

  public setup(): void {
    const instance = this
    this.vorpal
      .command(instance.command(), instance.description())
      .action(async function (args: Args) {
        try {
          await instance.action(args)
        } catch (error) {
          instance.vorpal.log(error.message)
        }
      });
  }

  getPaymentInfo(): PaymentInformation {
    const info = this.localStorage.getItem('payid') as PaymentInformation
    if (!info) {
      throw new Error(`please run 'payid init' or 'payid load' before adding an address`)
    }
    return info
  }

  abstract command(): string

  abstract description(): string

  async abstract action(args: Args): Promise<void>

}

export default Command;