import { splitPayIdString } from '../helpers'

import Command from './Command'
import { overwriteFile } from './files'

export default class SavePayIdCommand extends Command {
  protected async action(): Promise<void> {
    const info = this.getPaymentInfo()
    if (info.payId) {
      const userHost = splitPayIdString(info.payId)
      const filename = `${userHost[0]}.json`
      await overwriteFile(filename, JSON.stringify(info, null, 2))
      this.vorpal.log(`Saved to ${filename}`)
    } else {
      this.vorpal.log(`missing payID`)
    }
  }

  protected command(): string {
    return 'payid save'
  }

  protected description(): string {
    return 'Save the currently loaded PayID'
  }
}
