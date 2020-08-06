import Command from './Command';

export default class ClearKeysCommand extends Command {

  async action() {
    this.localStorage.removeItem('identity-key')
    this.localStorage.removeItem('server-key')
    this.localStorage.removeItem('server-cert')
    this.vorpal.log('cleared')
  }

  command(): string {
    return 'keys clear'
  }

  description(): string {
    return 'clears all loaded keys'
  }

}