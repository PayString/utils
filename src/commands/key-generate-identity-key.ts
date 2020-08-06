import Command from './Command';
import { JWK } from 'jose'
import { writeFile } from './files'

export default class GenerateIdentityKeyCommand extends Command {

  async action() {
    const key = await JWK.generate('EC', 'secp256k1')
    const pem = key.toPEM(true)
    try {
      const filename = await writeFile('./identity-key.pem', key.toPEM(true))
      this.vorpal.log(`wrote key to ${filename}`)
    } catch (e) {
      this.vorpal.log('failed to write key, outputting instead')
      this.vorpal.log(pem)
    }
    this.localStorage.setItem('identity-key', key.toJWK(true))
  }

  command(): string {
    return 'keys generate identity-key'
  }

  description(): string {
    return 'generates and saves a new identity key'
  }

}