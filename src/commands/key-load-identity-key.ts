import * as Vorpal from 'vorpal'

import Command from './Command';
import * as utils from '../index'

export default class LoadIdentityKeyCommand extends Command {

  async action(args: Vorpal.Args) {
    this.vorpal.log(`loading identity-key from ${args.filePath}`)
    const key = await utils.getSigningKeyFromFile(args.filePath)
    this.vorpal.log(`loaded identity-key from ${args.filePath}. Sign away.`)
    this.localStorage.setItem('identity-key', key.toJWK(true))
  }

  command(): string {
    return 'keys load-identity-key <filePath>'
  }

  description(): string {
    return 'load identity-key from file'
  }

}