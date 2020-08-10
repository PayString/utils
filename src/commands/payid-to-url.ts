import * as Vorpal from 'vorpal'

import * as payid from '../index'

import Command from './Command'

/**
 * Converts a PayID (eg test$xpring.money) to it's URL (eg https://xpring.money/test).
 */
export default class PayIdToUrlCommand extends Command {
  /**
   * @override
   */
  protected async action(args: Vorpal.Args): Promise<void> {
    const url = payid.convertPayIdToUrl(args.payid).href
    this.vorpal.log(url)
  }

  /**
   * @override
   */
  protected command(): string {
    return 'payid to-url <payid>'
  }

  /**
   * @override
   */
  protected description(): string {
    return 'converts PayID to url'
  }
}
