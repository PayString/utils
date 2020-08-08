import * as Vorpal from 'vorpal'

import * as utils from '../index'

import Command from './Command'

export default class LoadServerKeyCommand extends Command {
  protected async action(args: Vorpal.Args): Promise<void> {
    const keyPath: string = args.keyPath
    const key = await utils.getSigningKeyFromFile(keyPath)
    const certPath: string = args.certPath
    this.vorpal.log(`loading server-key from ${keyPath}`)
    this.vorpal.log(`loading server-cert from ${certPath}`)
    const cert = await utils.getJwkFromFile(certPath)

    this.localStorage.setJsonWebKey('server-key', key.toJWK(true))
    this.localStorage.setJsonWebKey('server-cert', cert)
    this.vorpal.log(`Success. Sign away.`)
  }

  protected command(): string {
    return 'keys load server-key <keyPath> <certPath>'
  }

  protected description(): string {
    return 'loads server key and certificate from file'
  }
}
