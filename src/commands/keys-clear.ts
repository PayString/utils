import Command from './Command'

export default class ClearKeysCommand extends Command {
  protected async action(): Promise<void> {
    this.localStorage.removeItem('identity-key')
    this.localStorage.removeItem('server-key')
    this.localStorage.removeItem('server-cert')
    this.vorpal.log('cleared')
  }

  protected command(): string {
    return 'keys clear'
  }

  protected description(): string {
    return 'clears all loaded keys'
  }
}
