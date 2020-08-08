import * as Vorpal from 'vorpal'

import * as utils from '../index'

import Command from './Command'

export default class UrlToPayidCommand extends Command {
  protected command(): string {
    return 'url to-payid <url>'
  }

  protected description(): string {
    return 'convert a URL to a PayID'
  }

  protected async action(args: Vorpal.Args): Promise<void> {
    const payid = utils.convertUrlToPayId(args.url)
    this.vorpal.log(payid)
  }
}
