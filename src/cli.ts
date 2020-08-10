#!/usr/bin/env node

import * as Vorpal from 'vorpal'

import * as cmd from './commands'

const vorpal = new Vorpal()

vorpal.history('payid')

const localStorage = new cmd.LocalStorage('payid', vorpal)
new cmd.ClearCommand(vorpal, localStorage).setup()
new cmd.AddCryptoAddressCommand(vorpal, localStorage).setup()
new cmd.RemoveCryptoAddressCommand(vorpal, localStorage).setup()
new cmd.InitPayIdCommand(vorpal, localStorage).setup()
new cmd.LoadPayIdCommand(vorpal, localStorage).setup()
new cmd.ShowPayIdCommand(vorpal, localStorage).setup()
new cmd.PayIdToUrlCommand(vorpal, localStorage).setup()
new cmd.SavePayIdCommand(vorpal, localStorage).setup()
new cmd.UrlToPayIdCommand(vorpal, localStorage).setup()

if (process.argv.length > 2) {
  vorpal.parse(process.argv)
} else {
  vorpal.delimiter('$').show()
}
