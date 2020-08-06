import * as Vorpal from 'vorpal'

import Command from './Command';
import * as utils from '../index'

export default class UrlToPayidCommand extends Command {

  command(): string {
    return 'url to-payid <url>'
  }

  description(): string {
    return 'convert a URL to a PayID'
  }

  async action(args: Vorpal.Args) {
    const payid = utils.convertUrlToPayId(args.url);
    this.vorpal.log(payid);
  }

}