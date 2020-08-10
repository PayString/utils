import 'mocha'

import { promises } from 'fs'

import { assert } from 'chai'

import {
  PaymentInformation,
  PaymentInformationInspector,
} from '../../../src/verifiable'
import CertificateChainValidator from '../../../src/verifiable/certificate-chain-validator'
import { convertJsonToPaymentInformation } from '../../../src/verifiable/converters'

describe('inspects()', function () {
  let validator = new CertificateChainValidator()
  let inspector = new PaymentInformationInspector()

  beforeEach(function () {
    validator = new CertificateChainValidator()
    inspector = new PaymentInformationInspector(validator)
  })

  it('contains inspection results for signatures and certificates', async function () {
    validator.addRootCertificate(
      await promises.readFile('test/certs/root.crt', 'ascii'),
    )
    const info = await loadInfoFromFile(
      'test/unit/verifiable/signed-payid.json',
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
    if (!serverSignature.certificateChainResult) {
      assert.fail('expected certificateChainResult')
    }
    assert.isTrue(serverSignature.certificateChainResult.isChainValid)
    const certificateResults =
      serverSignature.certificateChainResult.certificateResults
    assert.lengthOf(certificateResults, 2)
    assert.equal(certificateResults[0].issuedTo, 'test.payid.org')
    assert.equal(certificateResults[0].issuedBy, 'MyCompany CA')
    assert.equal(certificateResults[1].issuedTo, 'MyCompany CA')
    assert.equal(certificateResults[1].issuedBy, 'MyCompany CA')
  })

  it('isVerified is false if root cert is not trusted', async function () {
    const info = await loadInfoFromFile(
      'test/unit/verifiable/signed-payid.json',
    )
    const result = inspector.inspect(info)
    assert.isFalse(result.isVerified)

    const serverSignature =
      result.verifiedAddressesResults[0].signaturesResults[0]
    const identitySignature =
      result.verifiedAddressesResults[0].signaturesResults[1]
    assert.isTrue(serverSignature.isSignatureValid)
    assert.isFalse(serverSignature.isChainValid)
    assert.isTrue(identitySignature.isSignatureValid)
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
