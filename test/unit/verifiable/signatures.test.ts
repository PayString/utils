import 'mocha'

import { assert } from 'chai'
import { JWK } from 'jose'

import IdentityKeySigningParams from '../../../src/verifiable/identity-key-signing-params'
import getKeyFromFile from '../../../src/verifiable/keys'
import ServerKeySigningParams from '../../../src/verifiable/server-key-signing-params'
import {
  sign,
  signWithKeys,
  signWithServerKey,
  verifySignedAddress,
} from '../../../src/verifiable/signatures'
import {
  Address,
  AddressDetailsType,
  CryptoAddressDetails,
} from '../../../src/verifiable/verifiable-payid'

import ECKey = JWK.ECKey
import RSAKey = JWK.RSAKey
import OctKey = JWK.OctKey
import OKPKey = JWK.OKPKey

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
    const params = new IdentityKeySigningParams(key, 'ES256K')
    const jws = sign(payId, address, params)

    const expectedPayload =
      '{"payId":"alice$payid.example","payIdAddress":{"environment":"TESTNET","paymentNetwork":"XRPL","addressDetailsType":"CryptoAddressDetails","addressDetails":{"address":"rP3t3JStqWPYd8H88WfBYh3v84qqYzbHQ6"}}}'

    assert.equal(jws.payload, expectedPayload)
    assert.equal(jws.signatures.length, 1)
    assert.isTrue(verifySignedAddress(payId, jws))
  })

  it('sign - sign from PEM with x5c', async function () {
    const publicKey = await getPublicKeyFromCert()
    const privateKey = await getPrivateKeyFromPem()
    const jws = signWithServerKey(
      payId,
      address,
      new ServerKeySigningParams(privateKey, 'RS256', publicKey),
    )

    const expectedPayload =
      '{"payId":"alice$payid.example","payIdAddress":{"environment":"TESTNET","paymentNetwork":"XRPL","addressDetailsType":"CryptoAddressDetails","addressDetails":{"address":"rP3t3JStqWPYd8H88WfBYh3v84qqYzbHQ6"}}}'
    assert.equal(jws.payload, expectedPayload)
    assert.equal(jws.signatures.length, 1)
    assert.isTrue(verifySignedAddress(payId, jws))
  })

  it('sign - verification fails if server key and cert dont match', async function () {
    const publicKey = await getPublicKeyFromCert()
    const fakeServerKey = await JWK.generate('RSA', KEY_SIZE)
    const jws = signWithServerKey(
      payId,
      address,
      new ServerKeySigningParams(fakeServerKey, 'RS256', publicKey),
    )

    const expectedPayload =
      '{"payId":"alice$payid.example","payIdAddress":{"environment":"TESTNET","paymentNetwork":"XRPL","addressDetailsType":"CryptoAddressDetails","addressDetails":{"address":"rP3t3JStqWPYd8H88WfBYh3v84qqYzbHQ6"}}}'

    assert.equal(jws.payload, expectedPayload)
    assert.equal(jws.signatures.length, 1)
    assert.isFalse(verifySignedAddress(payId, jws))
  })

  it('sign - supports multiple signatures', async function () {
    const identityKey = await JWK.generate('EC', 'secp256k1')

    const jws = signWithKeys(payId, address, [
      new ServerKeySigningParams(
        await getPrivateKeyFromPem(),
        'RS256',
        await getPublicKeyFromCert(),
      ),
      new IdentityKeySigningParams(identityKey, 'ES256K'),
    ])

    const expectedPayload =
      '{"payId":"alice$payid.example","payIdAddress":{"environment":"TESTNET","paymentNetwork":"XRPL","addressDetailsType":"CryptoAddressDetails","addressDetails":{"address":"rP3t3JStqWPYd8H88WfBYh3v84qqYzbHQ6"}}}'

    assert.equal(jws.payload, expectedPayload)
    assert.equal(jws.signatures.length, 2)
    assert.isTrue(verifySignedAddress(payId, jws))
  })

  it('verifySignedAddress - fails if payload tampered with', async function () {
    const key = await JWK.generate('EC', 'secp256k1')
    const jws = sign(
      payId,
      address,
      new IdentityKeySigningParams(key, 'ES256K'),
    )
    jws.payload = jws.payload.replace(xrpAddress, 'hackedXrpAdddress')
    assert.isFalse(verifySignedAddress(payId, jws))
  })

  it('verifySignedAddress - fails if payid does not match payload', async function () {
    const key = await JWK.generate('EC', 'secp256k1')
    const jws = sign(
      payId,
      address,
      new IdentityKeySigningParams(key, 'ES256K'),
    )
    assert.isFalse(verifySignedAddress('hacked$payid.example', jws))
  })

  /**
   * Reads the default private key from the test pem file.
   *
   * @returns The JWK key for the private pem.
   */
  async function getPrivateKeyFromPem(): Promise<
    RSAKey | ECKey | OKPKey | OctKey
  > {
    return getKeyFromFile('test/unit/verifiable/self-signed.pem')
  }

  /**
   * Reads the default public key from the test cert file.
   *
   * @returns The JWK key for the public cert.
   */
  async function getPublicKeyFromCert(): Promise<
    RSAKey | ECKey | OKPKey | OctKey
  > {
    return getKeyFromFile('test/unit/verifiable/self-signed.cert')
  }
})
