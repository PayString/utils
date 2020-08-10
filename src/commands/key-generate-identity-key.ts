import { JWK } from 'jose'

import Command from './Command'
import { writeFile } from './files'

/**
 * Generates an identity key, loads the key into local storage and saves the key
 * to file in pem format.
 */
export default class GenerateIdentityKeyCommand extends Command {
  /**
   * @override
   */
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
    this.localStorage.setSigningKey('identity-key', key.toJWK(true))
  }

  /**
   * @override
   */
  protected command(): string {
    return 'keys generate identity-key'
  }

  /**
   * @override
   */
  protected description(): string {
    return 'generates and saves a new identity key'
  }
}
