import axios from 'axios'
import * as Vorpal from 'vorpal'

import Command from './Command';
import { PaymentInformation } from '../verifiable'
import * as utils from '../index'

export default class LoadPayIdCommand extends Command {

  async action(args: Vorpal.Args) {
    const payid = args.payid
    const url = utils.convertPayIdToUrl(payid).href
    await axios
      .get(url, {
        headers: {
          'PayID-Version': '1.0',
          accept: 'application/payid+json',
        }
      })
      .then((response) => {
        if (response.status !== 200) {
          this.vorpal.log(`Received HTTP status ${response.status} on ${url}`)
          return;
        }
        const info: PaymentInformation = response.data
        this.localStorage.setItem('payid', info)
        this.logJson(info)
      })
  }

  command(): string {
    return 'payid load <payid>'
  }

  description(): string {
    return 'loads a PayID from PayID server'
  }

}