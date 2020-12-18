import 'mocha'

import { assert } from 'chai'

import { generateNewKey } from '../../../src/verifiable/keys'

describe('generateNewKey()', function () {
  it('generates an EC key', async function () {
    const key = await generateNewKey()
    assert.equal(key.kty, 'EC')
    assert.equal(key.crv, 'P-256')
    // 'd' property is only present for JWK generated from a private key
    assert.isDefined(key.d)
  })
})
