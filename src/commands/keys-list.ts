import Command from './Command'

export default class ListKeysCommand extends Command {
  protected async action(): Promise<void> {
    this.printKey('identity-key')
    this.printKey('server-key')
    this.printKey('server-cert')
  }

  protected command(): string {
    return 'keys list'
  }

  protected description(): string {
    return 'lists keys that have been loaded'
  }

  private printKey(type: string): void {
    const key = this.localStorage.getSigningKey(type)
    if (key) {
      const kid = key.kid ?? 'not set'
      if ('crv' in key) {
        this.vorpal.log(`${type}: type=${key.kty}, type=${key.crv}, id=${kid}`)
      } else {
        this.vorpal.log(`${type}: type=${key.kty}, id=${kid}`)
      }
    }
  }
}
