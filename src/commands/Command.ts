import * as Vorpal from 'vorpal'
import { Args } from 'vorpal'

import { PaymentInformation } from '../verifiable'

import LocalStorage from './localstorage'

/* eslint-disable eslint-comments/no-unlimited-disable -- to many rules to disable */
/* eslint-disable -- the linter hates this import */
const { jsonBeautify } = require('beautify-json')
/* eslint-enable */

abstract class Command {
  protected readonly localStorage: LocalStorage

  protected readonly vorpal: Vorpal

  public constructor(vorpal: Vorpal, localStorage: LocalStorage) {
    this.localStorage = localStorage
    this.vorpal = vorpal
  }

  public setup(): void {
    this.vorpal.command(this.command(), this.description()).action(
      async (args: Args): Promise<void> => {
        try {
          await this.action(args)
        } catch (error) {
          this.vorpal.log(error)
        }
      },
    )
  }

  /**
   * Returns the payment information from local storage.
   *
   * @returns PaymentInfo.
   * @throws Error if no info found.
   */
  protected getPaymentInfo(): PaymentInformation {
    const info = this.localStorage.getPaymentInfo()
    if (info === undefined) {
      throw new Error(
        `please run 'payid init' or 'payid load' before adding an address`,
      )
    }
    return info
  }

  /**
   * Pretty prints JSON to the console.
   *
   * @param info - Payment info to log.
   */
  protected logPaymentInfo(info: PaymentInformation): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- no type def for this library
    jsonBeautify(JSON.stringify(info, null, 2))
  }

  /**
   * The vorpal command.
   *
   * @returns The vorpal command.
   */
  protected abstract command(): string

  /**
   * The vorpal description.
   *
   * @returns The vorpal description.
   */
  protected abstract description(): string

  protected abstract async action(args: Args): Promise<void>
}

export default Command
