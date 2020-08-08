import axios, { AxiosResponse } from 'axios'
import * as Vorpal from 'vorpal'

import * as utils from '../index'
import { PaymentInformation } from '../verifiable'

import Command from './Command'

export default class LoadPayIdCommand extends Command {
  protected async action(args: Vorpal.Args): Promise<void> {
    const payid = args.payid
    const url = utils.convertPayIdToUrl(payid).href
    await axios
      .get(url, {
        headers: {
          'payid-version': '1.0',
          accept: 'application/payid+json',
        },
      })
      .then((response) => {
        const info: PaymentInformation = response.data
        this.localStorage.setPaymentInfo(info)
        this.logPaymentInfo(info)
      })
      .catch((error) => {
        const {
          response,
          message,
        }: { response?: AxiosResponse; message: string } = error
        if (response) {
          this.vorpal.log(`Received HTTP status ${response.status} on ${url}`)
          return
        }
        this.vorpal.log(`Bad request ${url}. Error: ${message}.`)
      })
  }

  protected command(): string {
    return 'payid load <payid>'
  }

  protected description(): string {
    return 'loads a PayID from PayID server'
  }
}
