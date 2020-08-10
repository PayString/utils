import Command from './Command'

/**
 * Clears currently loaded server and/or identity keys from local strorage.
 */
export default class ClearKeysCommand extends Command {
  /**
   * @override
   */
  protected async action(): Promise<void> {
    this.localStorage.removeItem('identity-key')
    this.localStorage.removeItem('server-key')
    this.localStorage.removeItem('server-cert')
    this.vorpal.log('cleared')
  }

  /**
   * @override
   */
  protected command(): string {
    return 'keys clear'
  }

  /**
   * @override
   */
  protected description(): string {
    return 'clears all loaded keys'
  }
}
