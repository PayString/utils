import Command from './Command'

export default class ClearCommand extends Command {
  protected async action(): Promise<void> {
    // eslint-disable-next-line no-console -- needed to clear the cli console
    console.clear()
  }

  protected command(): string {
    return 'clear'
  }

  protected description(): string {
    return 'clear the terminal'
  }
}
