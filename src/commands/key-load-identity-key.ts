import * as Vorpal from 'vorpal'

import * as utils from '../index'

import Command from './Command'

export default class LoadIdentityKeyCommand extends Command {
  protected async action(args: Vorpal.Args): Promise<void> {
    const filePath: string = args.filePath
    this.vorpal.log(`loading identity-key from ${filePath}`)
    const key = await utils.getSigningKeyFromFile(filePath)
    this.vorpal.log(`loaded identity-key from ${filePath}. Sign away.`)
    this.localStorage.setJsonWebKey('identity-key', key.toJWK(true))
  }

  protected command(): string {
    return 'keys load identity-key <filePath>'
  }

  protected description(): string {
    return 'load identity-key from file'
  }
}
