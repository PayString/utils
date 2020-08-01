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
  IdentityKeySigningParams, ServerKeySigningParams,
  signWithKeys, signWithServerKey,
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

  it('sign - sign from PEM with x5c', async function () {
    const publicKey = getPublicKeyFromCert()
    const privateKey = getPrivateKeyFromPem()
    const jws = signWithServerKey(payId, address, {
      key: privateKey,
      alg: 'RS256',
      x5c: publicKey,
    } as ServerKeySigningParams)

    const expectedPayload =
      '{"payId":"alice$payid.example","payIdAddress":{"environment":"TESTNET","paymentNetwork":"XRPL","addressDetailsType":"CryptoAddressDetails","addressDetails":{"address":"rP3t3JStqWPYd8H88WfBYh3v84qqYzbHQ6"}}}'

    assert.equal(jws.payload, expectedPayload)
    assert.equal(jws.signatures.length, 1)
    assert.isTrue(verifySignedAddress(payId, jws))
  })

  it('sign - verification fails if server key and cert dont match', async function () {
    const publicKey = getPublicKeyFromCert()
    const fakeServerKey = await JWK.generate('RSA', KEY_SIZE)
    const jws = signWithServerKey(payId, address, {
      key: fakeServerKey,
      alg: 'RS256',
      x5c: publicKey,
    } as ServerKeySigningParams)

    const expectedPayload =
      '{"payId":"alice$payid.example","payIdAddress":{"environment":"TESTNET","paymentNetwork":"XRPL","addressDetailsType":"CryptoAddressDetails","addressDetails":{"address":"rP3t3JStqWPYd8H88WfBYh3v84qqYzbHQ6"}}}'

    assert.equal(jws.payload, expectedPayload)
    assert.equal(jws.signatures.length, 1)
    assert.isFalse(verifySignedAddress(payId, jws))
  })

  it('sign - supports multiple signatures', async function () {
    const identityKey = await JWK.generate('EC', 'secp256k1')

    const jws = signWithKeys(payId, address, [
      {
        key: getPrivateKeyFromPem(),
        alg: 'RS256',
        x5c: getPublicKeyFromCert(),
      } as ServerKeySigningParams,
      {
        key: identityKey,
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

  function getPrivateKeyFromPem(): JWK.Key {
    const pem = readFileSync('test/unit/verifiable/self-signed.pem').toString(
      'ascii',
    )
    return JWK.asKey(pem)
  }

  function getPublicKeyFromCert(): JWK.Key {
    const cert = readFileSync('test/unit/verifiable/self-signed.cert').toString('ascii')
    return JWK.asKey(cert)
  }
})
