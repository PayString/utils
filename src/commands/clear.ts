import Command from './Command';

export default class ClearCommand extends Command {

  async action() {
    console.clear()
  }

  command(): string {
    return 'clear'
  }

  description(): string {
    return 'clear the terminal'
  }

}