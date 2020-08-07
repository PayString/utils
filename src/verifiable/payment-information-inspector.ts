import { Address, PaymentInformation, VerifiedAddress } from './verifiable-payid'
import { ProtectedHeaders, verifySignedAddress } from './signatures'
import { JWK, JWS } from 'jose'
import { KeyObject } from "crypto"
import { extractX5CCertificates } from './certificate-chain-validator'
import GeneralJWS = JWS.GeneralJWS
import { CertificateChainValidator } from './index'
import JWSRecipient = JWS.JWSRecipient
import { pki } from 'node-forge'

export default class PaymentInformationInspector {

  certificateChainValidator: CertificateChainValidator

  constructor() {
    this.certificateChainValidator = new CertificateChainValidator()
  }


  public inspect(paymentInfo: PaymentInformation): PaymentInformationInspectionResult {
    const payId = paymentInfo.payId
    if (!payId) {
      throw new Error('payId property is empty')
    }
    const verifiedAddressesResults = paymentInfo.verifiedAddresses
      .map((address) => this.inspectVerifiedAddress(payId, address))
    const isVerified = verifiedAddressesResults.every(result => result.isVerified)
    return {
      payId,
      isVerified,
      verifiedAddressesResults
    }
  }

  private inspectVerifiedAddress(payId: string, verifiedAddress: VerifiedAddress): VerifiedAddressInspectionResult {
    const address = JSON.parse(verifiedAddress.payload).payIdAddress as Address
    const signaturesResults = verifiedAddress.signatures.map((recipient) => {
      const jwsWithSingleSignature = <GeneralJWS>{
        payload: verifiedAddress.payload,
        signatures: [
          {
            signature: recipient.signature,
            protected: recipient.protected,
          }
        ]
      }
      return this.inspectSignature(payId, jwsWithSingleSignature, recipient)
    })
    const isVerified = signaturesResults.every(result => result.isSignatureValid && result.isChainValid)
    return {
      isVerified,
      address,
      signaturesResults
    }
  }

  private inspectSignature(payId: string, jws: GeneralJWS, recipient: JWSRecipient): SignatureInspectionResult {
    if (!recipient.protected) {
      return {
        isSignatureValid: false,
        isChainValid: false
      }
    }
    const headers: ProtectedHeaders =
      JSON.parse(Buffer.from(recipient.protected, 'base64').toString('utf-8'))
    const jwk = JWK.asKey(headers.jwk as KeyObject)
    const isSignatureValid = verifySignedAddress(payId, jws, false)
    if (headers.name === 'serverKey') {
      const certificateChainResult = this.inspectCertificateChain(recipient)
      return {
        isSignatureValid,
        isChainValid: certificateChainResult.isChainValid,
        keyType: headers.name,
        jwk,
        certificateChainResult
      }
    }
    return {
      isSignatureValid,
      isChainValid: true,
      keyType: headers.name,
      jwk
    }
  }

  private inspectCertificateChain(recipient: JWSRecipient): CertificateChainInspectionResult {
    const isChainValid = this.certificateChainValidator.verifyCertificateChainRecipient(recipient)
    const certificateResults = extractX5CCertificates(recipient).map((cert) => {
      return inspectCertificate(cert)
    })
    return {
      isChainValid,
      certificateResults,
    }
  }

}


function inspectCertificate(certificate: pki.Certificate): CertificateInspectionResult {
  const issuedTo = certificate.subject.getField('CN').value
  const issuedBy = certificate.issuer.getField('CN').value
  return {
    issuedTo,
    issuedBy,
    certificate
  }
}


export interface PaymentInformationInspectionResult {
  payId: string
  // if all the addresses in the PaymentInformation object passed verification
  readonly isVerified: boolean
  verifiedAddressesResults: VerifiedAddressInspectionResult[]
}

export interface VerifiedAddressInspectionResult {
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

export interface CertificateInspectionResult {
  // whom the certificate was issue to (CommonName)
  issuedTo: string
  // who issued the certificate (CommonName)
  issuedBy: string
  certificate: pki.Certificate
}



