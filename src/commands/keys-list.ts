import Command from './Command';

export default class ListKeysCommand extends Command {

  async action() {
    this.printKey('identity-key')
    this.printKey('server-key')
    this.printKey('server-cert')
  }

  private printKey(type: string) {
    const key = this.localStorage.getItem(type)
    if (key) {
      if (key.kty === 'RSA') {
        this.vorpal.log(`${type}: type=${key.kty}, thumbprint=${key.thumbprint}`)
      } else {
        this.vorpal.log(`${type}: type=${key.kty}, type=${key.crv}, thumbprint=${key.thumbprint}`)
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