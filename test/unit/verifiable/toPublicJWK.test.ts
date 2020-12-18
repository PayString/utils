import 'mocha'

import { assert } from 'chai'

import { generateNewKey, toPublicJWK } from '../../../src/verifiable/keys'

describe('toPublicJWK()', function () {
  it('removes private key from JWK', async function () {
    const key = toPublicJWK(await generateNewKey())
    assert.equal(key.kty, 'EC')
    assert.equal(key.crv, 'P-256')
    // x and y properties are the public key parts of the JWK
    assert.isDefined(key.x)
    assert.isDefined(key.y)
    // 'd' property is only present for JWK generated from a private key
    assert.isUndefined(key.d)
  })
})
