import 'mocha'

import { promises } from 'fs'

import { assert } from 'chai'
import * as forge from 'node-forge'

import CertificateChainValidator from '../../../src/verifiable/certificate-chain-validator'

describe('verifyCertificateChain()', function () {
  let validator = new CertificateChainValidator()

  beforeEach(function () {
    validator = new CertificateChainValidator()
  })

  it('succeeds verification of chain if Root CA configured', async function () {
    validator.addRootCertificate(
      await promises.readFile('test/certs/root.crt', 'ascii'),
    )
    assert.isTrue(
      validator.verifyCertificateChain([
        await loadCertFromFile('test/certs/server.crt'),
        await loadCertFromFile('test/certs/interm.crt'),
      ]),
    )
  })

  it('cannot verify chain of certificate if Root CA not configured', async function () {
    assert.isFalse(
      validator.verifyCertificateChain([
        await loadCertFromFile('test/certs/server.crt'),
        await loadCertFromFile('test/certs/interm.crt'),
      ]),
    )
  })

  /**
   * Reads the content of a file as a certificate.
   *
   * @param path - The path to the file.
   * @returns File content.
   */
  async function loadCertFromFile(
    path: string,
  ): Promise<forge.pki.Certificate> {
    return forge.pki.certificateFromPem(await promises.readFile(path, 'ascii'))
  }
})
