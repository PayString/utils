import 'mocha'

import { promises } from 'fs'

import { assert } from 'chai'

import { splitCerts } from '../../../src/verifiable'

describe('splitCert()', function () {
  it('splits full chain cert into multiple entries', async function () {
    assert.lengthOf(
      splitCerts(
        await promises.readFile('test/certs/server.fullchain.crt', 'ascii'),
      ),
      2,
    )
  })

  it('splits single cert into 1 entry', async function () {
    assert.lengthOf(
      splitCerts(await promises.readFile('test/certs/server.crt', 'ascii')),
      1,
    )
  })
})
