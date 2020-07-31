import 'mocha'
import { readFileSync } from 'fs'

import { assert } from 'chai'
import { JWK } from 'jose'

import {
  Address,
  AddressDetailsType,
  CryptoAddressDetails,
} from '../../../src/verifiable/payid'
import sign, {
  IdentityKeySigningParams,
  signWithKeys,
  verifySignedAddress,
} from '../../../src/verifiable/signatures'

describe('signPayId()', function () {
  const KEY_SIZE = 512
  const payId = 'alice$payid.example'
  const xrpAddress = 'rP3t3JStqWPYd8H88WfBYh3v84qqYzbHQ6'
  const addressDetails: CryptoAddressDetails = {
    address: xrpAddress,
  }

  let address: Address

  beforeEach(function () {
    address = {
      environment: 'TESTNET',
      paymentNetwork: 'XRPL',
      addressDetailsType: AddressDetailsType.CryptoAddress,
      addressDetails,
    }
  })

  it('Signed PayID returns JWS', async function () {
    const key = await JWK.generate('EC', 'secp256k1')
    const jws = sign(payId, address, {
      key,
      alg: 'ES256K',
    } as IdentityKeySigningParams)

    const expectedPayload =
      '{"payId":"alice$payid.example","payIdAddress":{"environment":"TESTNET","paymentNetwork":"XRPL","addressDetailsType":"CryptoAddressDetails","addressDetails":{"address":"rP3t3JStqWPYd8H88WfBYh3v84qqYzbHQ6"}}}'

    assert.equal(jws.payload, expectedPayload)
    assert.equal(jws.signatures.length, 1)
    assert.isTrue(verifySignedAddress(payId, jws))
  })

  it('sign - sign from PEM', async function () {
    const pem = readFileSync('test/unit/verifiable/testkey.pem')
    const key = JWK.asKey(pem)
    const jws = sign(payId, address, {
      key,
      alg: 'RS256',
    } as IdentityKeySigningParams)

    const expectedPayload =
      '{"payId":"alice$payid.example","payIdAddress":{"environment":"TESTNET","paymentNetwork":"XRPL","addressDetailsType":"CryptoAddressDetails","addressDetails":{"address":"rP3t3JStqWPYd8H88WfBYh3v84qqYzbHQ6"}}}'

    assert.equal(jws.payload, expectedPayload)
    assert.equal(jws.signatures.length, 1)
    assert.isTrue(verifySignedAddress(payId, jws))
  })


  it('signWithIdentityKey - supports multiple signatures', async function () {
    const key1 = await JWK.generate('RSA', KEY_SIZE)
    const key2 = await JWK.generate('EC', 'secp256k1')

    const jws = signWithKeys(payId, address, [
      {
        key: key1,
        alg: 'RS256',
      } as IdentityKeySigningParams,
      {
        key: key2,
        alg: 'ES256K',
      } as IdentityKeySigningParams,
    ])

    const expectedPayload =
      '{"payId":"alice$payid.example","payIdAddress":{"environment":"TESTNET","paymentNetwork":"XRPL","addressDetailsType":"CryptoAddressDetails","addressDetails":{"address":"rP3t3JStqWPYd8H88WfBYh3v84qqYzbHQ6"}}}'

    assert.equal(jws.payload, expectedPayload)
    assert.equal(jws.signatures.length, 2)
    assert.isTrue(verifySignedAddress(payId, jws))
  })

  it('verifySignedAddress - fails if payload tampered with', async function () {
    const key = await JWK.generate('EC', 'secp256k1')
    const jws = sign(payId, address, {
      key,
      alg: 'ES256K',
    } as IdentityKeySigningParams)
    jws.payload = jws.payload.replace(xrpAddress, 'hackedXrpAdddress')
    assert.isFalse(verifySignedAddress(payId, jws))
  })

  it('verifySignedAddress - fails if payid does not match payload', async function () {
    const key = await JWK.generate('EC', 'secp256k1')
    const jws = sign(payId, address, {
      key,
      alg: 'ES256K',
    } as IdentityKeySigningParams)
    assert.isFalse(verifySignedAddress('hacked$payid.example', jws))
  })
})
