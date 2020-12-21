import 'mocha'

import { assert } from 'chai'

import { generateNewKey, getDefaultAlgorithm } from '../../../src/verifiable'
import IdentityKeySigningParams from '../../../src/verifiable/identity-key-signing-params'
import {
  sign,
  signWithKeys,
  verifyPayString,
  verifySignedAddress,
} from '../../../src/verifiable/signatures'
import {
  Address,
  AddressDetailsType,
  CryptoAddressDetails,
} from '../../../src/verifiable/verifiable-paystring'

describe('sign()', function () {
  const payString = 'alice$payString.example'
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

  it('Signed PayString returns JWS', async function () {
    const key = await generateNewKey()
    const params = new IdentityKeySigningParams(key, getDefaultAlgorithm(key))
    const jws = await sign(payString, address, params)
    const expectedPayload =
      '{"payId":"alice$payString.example","payIdAddress":{"environment":"TESTNET","paymentNetwork":"XRPL","addressDetailsType":"CryptoAddressDetails","addressDetails":{"address":"rP3t3JStqWPYd8H88WfBYh3v84qqYzbHQ6"}}}'

    assert.equal(jws.payload, expectedPayload)
    assert.equal(jws.signatures.length, 1)
    assert.isTrue(await verifySignedAddress(payString, jws))
  })

  it('signs and verifies with using multiple signatures', async function () {
    const identityKey1 = await generateNewKey()
    const identityKey2 = await generateNewKey()
    const jws = await signWithKeys(payString, address, [
      new IdentityKeySigningParams(
        identityKey1,
        getDefaultAlgorithm(identityKey1),
      ),
      new IdentityKeySigningParams(
        identityKey2,
        getDefaultAlgorithm(identityKey2),
      ),
    ])

    const expectedPayload =
      '{"payId":"alice$payString.example","payIdAddress":{"environment":"TESTNET","paymentNetwork":"XRPL","addressDetailsType":"CryptoAddressDetails","addressDetails":{"address":"rP3t3JStqWPYd8H88WfBYh3v84qqYzbHQ6"}}}'

    assert.equal(jws.payload, expectedPayload)
    assert.equal(jws.signatures.length, 2)
    assert.isTrue(await verifySignedAddress(payString, jws))
  })

  it('cannot be verified if payload tampered with', async function () {
    const key = await generateNewKey()
    const jws = await sign(
      payString,
      address,
      new IdentityKeySigningParams(key, getDefaultAlgorithm(key)),
    )
    const mutatedJws = {
      payload: jws.payload.replace(xrpAddress, 'hackedXrpAdddress'),
      signatures: jws.signatures,
    }
    assert.isFalse(await verifySignedAddress(payString, mutatedJws))
  })

  it('verification fails if payString does not match payload', async function () {
    const key = await generateNewKey()
    const jws = await sign(
      payString,
      address,
      new IdentityKeySigningParams(key, getDefaultAlgorithm(key)),
    )
    assert.isFalse(await verifySignedAddress('hacked$payString.example', jws))
  })

  it('PayString with verifiedAddresses can be verified if valid', async function () {
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
    assert.isTrue(await verifyPayString(json))
  })
})
