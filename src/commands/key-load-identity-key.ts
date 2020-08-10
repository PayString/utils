import * as Vorpal from 'vorpal'

import * as utils from '../index'

import Command from './Command'

/**
 * Loads an identity key from a PEM file.
 * The loaded key is placed in local storage for use by the sign command.
 */
export default class LoadIdentityKeyCommand extends Command {
  /**
   * @override
   */
  protected async action(args: Vorpal.Args): Promise<void> {
    const filePath: string = args.filePath
    this.vorpal.log(`loading identity-key from ${filePath}`)
    const key = await utils.getSigningKeyFromFile(filePath)
    this.vorpal.log(`loaded identity-key from ${filePath}. Sign away.`)
    this.localStorage.setSigningKey('identity-key', key.toJWK(true))
  }

  /**
   * @override
   */
  protected command(): string {
    return 'keys load identity-key <filePath>'
  }

  /**
   * @override
   */
  protected description(): string {
    return 'load identity-key from file'
  }
}
