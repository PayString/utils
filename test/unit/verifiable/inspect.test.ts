import 'mocha'

import { promises } from 'fs'

import { assert } from 'chai'

import {
  PaymentInformation,
  PaymentInformationInspector,
} from '../../../src/verifiable'
import { convertJsonToPaymentInformation } from '../../../src/verifiable/converters'

describe('inspects()', function () {
  let inspector = new PaymentInformationInspector()

  beforeEach(function () {
    inspector = new PaymentInformationInspector()
  })

  it('contains inspection results for signatures', async function () {
    const info = await loadInfoFromFile(
      'test/unit/verifiable/signed-paystring.json',
    )
    const result = inspector.inspect(info)
    assert.isTrue(result.isVerified)
    assert.lengthOf(result.verifiedAddressesResults, 1)
    assert.lengthOf(result.verifiedAddressesResults[0].signaturesResults, 2)

    const serverSignature =
      result.verifiedAddressesResults[0].signaturesResults[0]
    assert.equal(serverSignature.keyType, 'serverKey')
    const identitySignature =
      result.verifiedAddressesResults[0].signaturesResults[1]
    assert.equal(identitySignature.keyType, 'identityKey')
  })

  /**
   * Reads the content of a file as a certificate.
   *
   * @param path - The path to the file.
   * @returns File content.
   */
  async function loadInfoFromFile(path: string): Promise<PaymentInformation> {
    return convertJsonToPaymentInformation(
      await promises.readFile(path, 'ascii'),
    )
  }
})
