#!/usr/bin/env node

import * as Vorpal from 'vorpal'

import PayIdToUrlCommand from './commands/payid-to-url'
import UrlToPayidCommand from './commands/url-to-payid'
import LocalStorage from './commands/localstorage'
import BuildPayIdCommand from './commands/payid-init'
import AddCryptoAddressCommand from './commands/crypto-address-add'
import RemoveCryptoAddressCommand from './commands/crypto-address-remove'
import LoadPayIdCommand from './commands/payid-load'
import ClearStorageCommand from './commands/clear-storage'
import GenerateIdentityKeyCommand from './commands/key-generate-identity-key'
import ListKeysCommand from './commands/list-keys'
import LoadIdentityKeyCommand from './commands/key-load-identity-key'
import LoadServerKeyCommand from './commands/key-load-server-key'
import SignPayIdCommand from './commands/payid-sign'

const vorpal = new Vorpal();

vorpal.history('payid')

const localStorage = new LocalStorage('payid', vorpal)
new PayIdToUrlCommand(vorpal, localStorage).setup()
new UrlToPayidCommand(vorpal, localStorage).setup()
new BuildPayIdCommand(vorpal, localStorage).setup()
new AddCryptoAddressCommand(vorpal, localStorage).setup()
new RemoveCryptoAddressCommand(vorpal, localStorage).setup()
new LoadPayIdCommand(vorpal, localStorage).setup()
new ClearStorageCommand(vorpal, localStorage).setup()
new GenerateIdentityKeyCommand(vorpal, localStorage).setup()
new ListKeysCommand(vorpal, localStorage).setup()
new LoadIdentityKeyCommand(vorpal, localStorage).setup()
new LoadServerKeyCommand(vorpal, localStorage).setup()
new SignPayIdCommand(vorpal, localStorage).setup()

if (process.argv.length > 2) {
  vorpal
    .parse(process.argv)
}
else {
  vorpal
    .delimiter('$')
    .show()
}

