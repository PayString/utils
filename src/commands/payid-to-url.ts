import * as Vorpal from 'vorpal'

import Command from './Command';
import * as payid from '../index'

export default class PayIdToUrlCommand extends Command {

  async action(args: Vorpal.Args) {
    const url = payid.convertPayIdToUrl(args.payid).href;
    this.vorpal.log(url);
  }

  command(): string {
    return 'payid to-url <payid>'
  }

  description(): string {
    return 'converts PayID to url'
  }

}