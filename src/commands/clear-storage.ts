import Command from './Command';

export default class ClearStorageCommand extends Command {

  async action() {
    this.localStorage.clear()
    this.vorpal.log('cleared')
  }

  command(): string {
    return 'clear-storage'
  }

  description(): string {
    return 'clear all stored values'
  }

}