import * as Vorpal from 'vorpal'

import * as payid from '../index'

import Command from './Command'

export default class PayIdToUrlCommand extends Command {
  protected async action(args: Vorpal.Args): Promise<void> {
    const url = payid.convertPayIdToUrl(args.payid).href
    this.vorpal.log(url)
  }

  protected command(): string {
    return 'payid to-url <payid>'
  }

  protected description(): string {
    return 'converts PayID to url'
  }
}
