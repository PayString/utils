import Command from './Command';

export default class ShowPayIdCommand extends Command {

  async action() {
    const info = this.getPaymentInfo()
    this.prettyLog(info)
  }

  command(): string {
    return 'payid show'
  }

  description(): string {
    return 'Shows the currently loaded PayID'
  }
}
