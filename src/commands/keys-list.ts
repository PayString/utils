import Command from './Command'

/**
 * Prints, to console, a summary of the identity and server keys that are currently loaded in
 * local storage and available to use for signing.
 */
export default class ListKeysCommand extends Command {
  /**
   * @override
   */
  protected async action(): Promise<void> {
    this.printKey('identity-key')
    this.printKey('server-key')
    this.printKey('server-cert')
  }

  /**
   * @override
   */
  protected command(): string {
    return 'keys list'
  }

  /**
   * @override
   */
  protected description(): string {
    return 'lists keys that have been loaded'
  }

  /**
   * Prints a key summary to the console.
   *
   * @param name - The name of the key to print.
   */
  private printKey(name: string): void {
    const key = this.localStorage.getSigningKey(name)
    if (key) {
      const kid = key.kid ?? 'not set'
      if ('crv' in key) {
        this.vorpal.log(`${name}: type=${key.kty}, type=${key.crv}, id=${kid}`)
      } else {
        this.vorpal.log(`${name}: type=${key.kty}, id=${kid}`)
      }
    }
  }
}
