import Command from './Command';
// import { JWK } from 'jose'

export default class ListKeysCommand extends Command {

  async action() {
    this.printKey('identity-key')
    this.printKey('server-key')
    this.printKey('server-cert')
  }

  private printKey(type: string) {
    const key = this.localStorage.getItem(type)
    // const jwk = JWK.asKey(key)
    if (key) {
      if (key.kty === 'RSA') {
        this.vorpal.log(`${type}: type=${key.kty}, id=${key.kid}`)
      } else {
        this.vorpal.log(`${type}: type=${key.kty}, type=${key.crv}, id=${key.kid}`)
      }
    }
  }

  command(): string {
    return 'keys list'
  }

  description(): string {
    return 'lists keys that have been loaded'
  }

}