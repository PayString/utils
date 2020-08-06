import * as Vorpal from 'vorpal'

import Command from './Command';
import * as utils from '../index'

export default class LoadServerKeyCommand extends Command {

  async action(args: Vorpal.Args) {
    this.vorpal.log(`loading server-key from ${args.keyPath}`)
    const key = await utils.getSigningKeyFromFile(args.keyPath)

    this.vorpal.log(`loading server-cert from ${args.certPath}`)
    const cert = await utils.getJwkFromFile(args.certPath)

    this.localStorage.setItem('server-key', key.toJWK(true))
    this.localStorage.setItem('server-cert', cert)
    this.vorpal.log(`Success. Sign away.`)
  }

  command(): string {
    return 'keys load-server-key <keyPath> <certPath>'
  }

  description(): string {
    return 'loads server key and certificate from file'
  }

}