import Command from './Command'

export default class ShowPayIdCommand extends Command {
  protected async action(): Promise<void> {
    const info = this.getPaymentInfo()
    this.logPaymentInfo(info)
  }

  protected command(): string {
    return 'payid show'
  }

  protected description(): string {
    return 'Shows the currently loaded PayID'
  }
}
