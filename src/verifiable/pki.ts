import * as tls from 'tls'

import { JWS } from 'jose'
import * as forge from 'node-forge'

import { getJwkFromRecipient, isX5C } from './keys'

import GeneralJWS = JWS.GeneralJWS
import JWSRecipient = JWS.JWSRecipient
import certificateFromPem = forge.pki.certificateFromPem

export default class CertificateValidator {
  public caStore: forge.pki.CAStore

  public constructor() {
    this.caStore = forge.pki.createCaStore([])
  }

  /**
   * Verifies the certificate chain for any x5c certificates inside the JWS protected section.
   *
   * @param jws - The JWS to verify.
   * @returns True if verified.
   */
  public verifyCertificateChain(jws: GeneralJWS): boolean {
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
  public verifyCertificateChainRecipient(recipient: JWSRecipient): boolean {
    const chain = this.extractX5CCertificates(recipient)
    return (
      chain.length === 0 ||
      forge.pki.verifyCertificateChain(this.caStore, chain)
    )
  }

  public importCAsNodeRoot(): void {
    for (const rootCert of tls.rootCertificates) {
      try {
        const cert = forge.pki.certificateFromPem(rootCert)
        this.caStore.addCertificate(cert)
      } catch {
        // unsupported cert. just skip.
      }
    }
  }

  /**
   * Extract X5C certificates from the JWS protected section.
   *
   * @param recipient - The recipient to parse.
   * @returns List of certificates.
   */
  private extractX5CCertificates(
    recipient: JWSRecipient,
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
}
