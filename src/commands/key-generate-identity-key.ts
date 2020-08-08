import { JWK } from 'jose'

import Command from './Command'
import { writeFile } from './files'

export default class GenerateIdentityKeyCommand extends Command {
  protected async action(): Promise<void> {
    const key = await JWK.generate('EC', 'secp256k1')
    const pem = key.toPEM(true)
    try {
      const filename = await writeFile('./identity-key.pem', key.toPEM(true))
      this.vorpal.log(`wrote key to ${filename}`)
    } catch {
      this.vorpal.log('failed to write key, outputting instead')
      this.vorpal.log(pem)
    }
    this.localStorage.setJsonWebKey('identity-key', key.toJWK(true))
  }

  protected command(): string {
    return 'keys generate identity-key'
  }

  protected description(): string {
    return 'generates and saves a new identity key'
  }
}
