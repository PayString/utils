import * as Vorpal from 'vorpal'

import * as utils from '../index'

import Command from './Command'

/**
 * Loads a server private key and public certificate from files (in PEM format).
 * The loaded keys are placed in local storage for use by the sign command.
 */
export default class LoadServerKeyCommand extends Command {
  /**
   * @override
   */
  protected async action(args: Vorpal.Args): Promise<void> {
    const keyPath: string = args.keyPath
    const key = await utils.getSigningKeyFromFile(keyPath)
    const certPath: string = args.certPath
    this.vorpal.log(`loading server-key from ${keyPath}`)
    this.vorpal.log(`loading server-cert from ${certPath}`)
    const cert = await utils.getJwkFromFile(certPath)

    this.localStorage.setSigningKey('server-key', key.toJWK(true))
    this.localStorage.setSigningKey('server-cert', cert)
    this.vorpal.log(`Success. Sign away.`)
  }

  /**
   * @override
   */
  protected command(): string {
    return 'keys load server-key <keyPath> <certPath>'
  }

  /**
   * @override
   */
  protected description(): string {
    return 'loads server key and certificate from file'
  }
}
