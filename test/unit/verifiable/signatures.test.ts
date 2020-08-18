import 'mocha'

import { assert } from 'chai'
import { JWK } from 'jose'

import IdentityKeySigningParams from '../../../src/verifiable/identity-key-signing-params'
import {
  sign,
  signWithKeys,
  verifyPayId,
  verifySignedAddress,
} from '../../../src/verifiable/signatures'
import {
  Address,
  AddressDetailsType,
  CryptoAddressDetails,
} from '../../../src/verifiable/verifiable-payid'

describe('sign()', function () {
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
    const params = new IdentityKeySigningParams(key, 'ES256K')
    const jws = sign(payId, address, params)

    const expectedPayload =
      '{"payId":"alice$payid.example","payIdAddress":{"environment":"TESTNET","paymentNetwork":"XRPL","addressDetailsType":"CryptoAddressDetails","addressDetails":{"address":"rP3t3JStqWPYd8H88WfBYh3v84qqYzbHQ6"}}}'

    assert.equal(jws.payload, expectedPayload)
    assert.equal(jws.signatures.length, 1)
    assert.isTrue(verifySignedAddress(payId, jws))
  })

  it('signs and verifies with using multiple signatures', async function () {
    const identityKey1 = await JWK.generate('EC', 'secp256k1')
    const identityKey2 = await JWK.generate('EC', 'secp256k1')
    const jws = signWithKeys(payId, address, [
      new IdentityKeySigningParams(identityKey1, 'ES256K'),
      new IdentityKeySigningParams(identityKey2, 'ES256K'),
    ])

    const expectedPayload =
      '{"payId":"alice$payid.example","payIdAddress":{"environment":"TESTNET","paymentNetwork":"XRPL","addressDetailsType":"CryptoAddressDetails","addressDetails":{"address":"rP3t3JStqWPYd8H88WfBYh3v84qqYzbHQ6"}}}'

    assert.equal(jws.payload, expectedPayload)
    assert.equal(jws.signatures.length, 2)
    assert.isTrue(verifySignedAddress(payId, jws))
  })

  it('cannot be verified if payload tampered with', async function () {
    const key = await JWK.generate('EC', 'secp256k1')
    const jws = sign(
      payId,
      address,
      new IdentityKeySigningParams(key, 'ES256K'),
    )
    jws.payload = jws.payload.replace(xrpAddress, 'hackedXrpAdddress')
    assert.isFalse(verifySignedAddress(payId, jws))
  })

  it('verification fails if payid does not match payload', async function () {
    const key = await JWK.generate('EC', 'secp256k1')
    const jws = sign(
      payId,
      address,
      new IdentityKeySigningParams(key, 'ES256K'),
    )
    assert.isFalse(verifySignedAddress('hacked$payid.example', jws))
  })

  it('PayID with verifiedAddresses can be verified if valid', async function () {
    const json = `    
{
  "payId": "alice$foo",
  "addresses": [],
  "verifiedAddresses": [
    {
      "signatures" : [ 
        {
          "protected" : "eyJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdLCJraWQiOiJkMGFlNTllNi1iZDIwLTQ3NzYtOGMwMi0zYTYzMDYwYjU0NjkiLCJuYW1lIjoiaWRlbnRpdHlLZXkiLCJ0eXAiOiJKT1NFK0pTT04iLCJhbGciOiJFUzI1NksiLCJqd2siOnsia3R5IjoiRUMiLCJ1c2UiOiJzaWciLCJjcnYiOiJzZWNwMjU2azEiLCJraWQiOiJkMGFlNTllNi1iZDIwLTQ3NzYtOGMwMi0zYTYzMDYwYjU0NjkiLCJ4IjoiWkMzZDdzRS1BdDE2cEpBMUZ0bFg4dXJ3UWx3LWlUYW43M3RrazluZFo0VSIsInkiOiJBaUlab2tyU05qd2tYZ0FVNmJCY3Nrbnd1WFAyNGkycUdvU3EwZmU5Z09vIiwiYWxnIjoiRVMyNTZLIn19",
          "signature" : "AxpRFkNnymCFrOLPGsVBtJ3Re7oMhDKHEWLTlYyre0HKpfGJdEDzFDGKtud3dJUOL67A-IyKZMKT8MQSzDUeeg"
        } 
      ],
      "payload" : "{\\"payId\\":\\"alice$foo\\",\\"payIdAddress\\":{\\"paymentNetwork\\":\\"XRPL\\",\\"environment\\":\\"TESTNET\\",\\"addressDetailsType\\":\\"CryptoAddressDetails\\",\\"addressDetails\\":{\\"address\\":\\"123\\",\\"tag\\":\\"\\"}}}"
    }
  ]  
}`
    assert.isTrue(verifyPayId(json))
  })
})
