import { JWK, JWS } from 'jose'
import { pki } from 'node-forge'

import CertificateChainValidator, {
  extractX5CCertificates,
} from './certificate-chain-validator'
import { toKey } from './keys'
import { verifySignedAddress } from './signatures'
import {
  Address,
  PaymentInformation,
  ProtectedHeaders,
  UnsignedVerifiedAddress,
  VerifiedAddress,
  // eslint-disable-next-line import/max-dependencies -- this class brings all the worlds together so has more deps
} from './verifiable-payid'

/**
 * Service to inspect a PaymentInformation object's signatures and certificates.
 */
export default class PaymentInformationInspector {
  private readonly chainValidator: CertificateChainValidator

  /**
   * Constructs new inspector.
   *
   * @param chainValidator - The chain validator to use for certificate chains.
   */
  public constructor(chainValidator = new CertificateChainValidator()) {
    this.chainValidator = chainValidator
  }

  /**
   * Inspects the signatures and certificate for the given paymentInformation.
   *
   * @param paymentInfo - The object to inspect.
   * @returns The inspection result.
   * @throws Error - If paymentInfo is missing expected fields.
   */
  public inspect(
    paymentInfo: PaymentInformation,
  ): PaymentInformationInspectionResult {
    const payId = paymentInfo.payId
    if (!payId) {
      throw new Error('payId property is empty')
    }
    const verifiedAddressesResults = paymentInfo.verifiedAddresses.map(
      (address) => this.inspectVerifiedAddress(payId, address),
    )
    const isVerified = verifiedAddressesResults.every(
      (result) => result.isVerified,
    )
    return {
      payId,
      isVerified,
      verifiedAddressesResults,
    }
  }

  /**
   * Inspect signature on verified addresses.
   *
   * @param payId - The PayID this address belongs to.
   * @param verifiedAddress - The verified address to inspect.
   * @returns The inspection result.
   */
  private inspectVerifiedAddress(
    payId: string,
    verifiedAddress: VerifiedAddress,
  ): VerifiedAddressInspectionResult {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- because JSON
    const address: UnsignedVerifiedAddress = JSON.parse(verifiedAddress.payload)
    const signaturesResults = verifiedAddress.signatures.map((recipient) => {
      const jwsWithSingleSignature = {
        payload: verifiedAddress.payload,
        signatures: [
          {
            signature: recipient.signature,
            protected: recipient.protected,
          },
        ],
      }
      return this.inspectSignature(payId, jwsWithSingleSignature, recipient)
    })
    const isVerified = signaturesResults.every(
      (result) => result.isSignatureValid && result.isChainValid,
    )
    return {
      isVerified,
      address: address.payIdAddress,
      signaturesResults,
    }
  }

  /**
   * Inspects the signature.
   *
   * @param payId - The payId this signature belongs to.
   * @param jws - The JWS that contains the recipient.
   * @param recipient - The recipient signature to inspect.
   * @returns The inspection result.
   */
  private inspectSignature(
    payId: string,
    jws: JWS.GeneralJWS,
    recipient: JWS.JWSRecipient,
  ): SignatureInspectionResult {
    if (!recipient.protected) {
      return { isSignatureValid: false, isChainValid: false }
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- because JSON
    const headers: ProtectedHeaders = JSON.parse(
      Buffer.from(recipient.protected, 'base64').toString('utf-8'),
    )
    const jwk = toKey(headers.jwk)
    const isSignatureValid = verifySignedAddress(payId, jws)
    if (headers.name === 'serverKey') {
      const certificateChainResult = this.inspectCertificateChain(recipient)
      return {
        isSignatureValid,
        isChainValid: certificateChainResult.isChainValid,
        keyType: headers.name,
        jwk,
        certificateChainResult,
      }
    }
    return { isSignatureValid, isChainValid: true, keyType: headers.name, jwk }
  }

  /**
   * Inspects the certificate chain.
   *
   * @param recipient - The recipient/signature to inspect.
   * @returns The result of inspection.
   */
  private inspectCertificateChain(
    recipient: JWS.JWSRecipient,
  ): CertificateChainInspectionResult {
    const isChainValid = this.chainValidator.verifyCertificateChainRecipient(
      recipient,
    )
    const certificateResults = extractX5CCertificates(recipient).map((cert) => {
      return inspectCertificate(cert)
    })
    return {
      isChainValid,
      certificateResults,
    }
  }
}

/**
 * Inspects a certificate.
 *
 * @param certificate - The certificate to inspect.
 * @returns The certificate to inspect.
 */
function inspectCertificate(
  certificate: pki.Certificate,
): CertificateInspectionResult {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access -- not typed
  const issuedTo: string = certificate.subject.getField('CN').value ?? 'unknown'
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access -- not typed
  const issuedBy: string = certificate.issuer.getField('CN').value ?? 'unknown'
  return {
    issuedTo,
    issuedBy,
    certificate,
  }
}

interface PaymentInformationInspectionResult {
  payId: string
  // if all the addresses in the PaymentInformation object passed verification
  readonly isVerified: boolean
  verifiedAddressesResults: VerifiedAddressInspectionResult[]
}

interface VerifiedAddressInspectionResult {
  // if all the signatures in the PaymentInformation object passed verification
  readonly isVerified: boolean
  readonly address: Address
  signaturesResults: SignatureInspectionResult[]
}

export interface SignatureInspectionResult {
  // if the signature passed verification
  readonly isSignatureValid: boolean
  readonly isChainValid: boolean
  readonly keyType?: string
  readonly jwk?: JWK.RSAKey | JWK.ECKey | JWK.OKPKey | JWK.OctKey
  readonly certificateChainResult?: CertificateChainInspectionResult
}

export interface CertificateChainInspectionResult {
  // indicates if the certificate chain is valid and trusted
  readonly isChainValid: boolean
  readonly certificateResults: CertificateInspectionResult[]
}

interface CertificateInspectionResult {
  // whom the certificate was issue to (CommonName)
  issuedTo: string
  // who issued the certificate (CommonName)
  issuedBy: string
  certificate: pki.Certificate
}
