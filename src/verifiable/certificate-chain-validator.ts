import { promises } from 'fs'
import * as tls from 'tls'

import { JWS } from 'jose'
import * as forge from 'node-forge'

import { getJwkFromRecipient, isX5C } from './keys'

import certificateFromPem = forge.pki.certificateFromPem
import { ProtectedHeaders } from './signatures'

/**
 * Service to validate the certificate chain (using web PKI) for Verifiable PayIDs
 * signed with a a server key.
 */
export default class CertificateChainValidator {
  public caStore: forge.pki.CAStore

  public constructor() {
    this.caStore = forge.pki.createCaStore([])
    this.importNodeRootCertficates()
  }

  /**
   * Verifies the certificate chain for any x5c certificates inside the JWS protected section.
   *
   * @param jws - The JWS to verify.
   * @returns True if verified.
   */
  public verifyCertificateChainJWS(jws: JWS.GeneralJWS): boolean {
    return jws.signatures
      .map((recipient) => this.verifyCertificateChainRecipient(recipient))
      .every((val) => val)
  }

  /**
   * Verifies the chain within the recipient.
   *
   * @param recipient - The recipient to verify.
   * @returns True if verified.
   */
  public verifyCertificateChainRecipient(recipient: JWS.JWSRecipient): boolean {
    if (!recipient.protected) return false
    const headers: ProtectedHeaders =
      JSON.parse(Buffer.from(recipient.protected, 'base64').toString('utf-8'))
    if (headers.name === 'serverKey') {
      return this.verifyCertificateChain(extractX5CCertificates(recipient))
    }
    return true
  }

  /**
   * Verifies the chain within the list of certificates.
   *
   * @param chain - The list of certificates.
   * @returns True if verified.
   */
  public verifyCertificateChain(chain: forge.pki.Certificate[]): boolean {
    if (chain.length === 0) return false
    try {
      return forge.pki.verifyCertificateChain(this.caStore, chain)
    } catch {
      return false
    }
  }

  /**
   * Adds a root certificate to be included in certificate chain validation.
   *
   * @param certificate - The certificate text in PEM format.
   */
  public addRootCertificate(certificate: string): void {
    const cert = forge.pki.certificateFromPem(certificate)
    this.caStore.addCertificate(cert)
  }

  /**
   * Adds a root certificate to be included in certificate chain validation.
   *
   * @param path - Path to certificate file in PEM format.
   */
  public async addRootCertificateFile(path: string): Promise<void> {
    this.addRootCertificate(await promises.readFile(path, 'ascii'))
  }

  /**
   * Imports the Root certificates from Node into the CA store used for certificate chain validation.
   */
  private importNodeRootCertficates(): void {
    for (const rootCert of tls.rootCertificates) {
      try {
        this.addRootCertificate(rootCert)
      } catch {
        // unsupported cert. just skip.
      }
    }
  }
}

/**
 * Extract X5C certificates from the JWS protected section.
 *
 * @param recipient - The recipient to parse.
 * @returns List of certificates.
 */
export function extractX5CCertificates(
  recipient: JWS.JWSRecipient,
): forge.pki.Certificate[] {
  const jwk = getJwkFromRecipient(recipient)
  if (jwk && isX5C(jwk) && jwk.x5c) {
    return jwk.x5c.map((pem) =>
      certificateFromPem(
        `-----BEGIN CERTIFICATE-----${pem}-----END CERTIFICATE-----`,
      ),
    )
  }
  return []
}
