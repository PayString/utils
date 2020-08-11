import * as Vorpal from 'vorpal'

import * as utils from '../index'

import Command from './Command'

/**
 * Converts a url (eg https://xpring.money/test) to a PayID (eg test$xpring.money).
 */
export default class UrlToPayidCommand extends Command {
  /**
   * @override
   */
  protected command(): string {
    return 'payid from-url <url>'
  }

  /**
   * @override
   */
  protected description(): string {
    return 'convert a URL to a PayID'
  }

  /**
   * @override
   */
  protected async action(args: Vorpal.Args): Promise<void> {
    const payid = utils.convertUrlToPayId(args.url)
    this.vorpal.log(payid)
  }
}
