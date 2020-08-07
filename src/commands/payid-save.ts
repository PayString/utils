import Command from './Command';
import { writeFile } from './files'
import { splitPayIdString } from '../helpers'

export default class SavePayIdCommand extends Command {

  async action() {
    const info = this.getPaymentInfo()
    if (info.payId) {
      const userHost = splitPayIdString(info.payId)
      const filename = await writeFile(`${userHost[0]}.json`, JSON.stringify(info, null, 2))
      this.vorpal.log(`Saved to ${filename}`)
    } else {
      this.vorpal.log(`missing payID`)
    }
  }

  command(): string {
    return 'payid save'
  }

  description(): string {
    return 'Save the currently loaded PayID'
  }
}
