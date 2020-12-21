import { JWK } from 'jose/webcrypto/types'

import { verifySignedAddress } from './signatures'
import {
  Address,
  PaymentInformation,
  ProtectedHeaders,
  UnsignedVerifiedAddress,
  VerifiedAddress,
  VerifiedAddressSignature,
} from './verifiable-paystring'

/**
 * Service to inspect a PaymentInformation object's signatures and certificates.
 */
export default class PaymentInformationInspector {
  /**
   * Inspects the signatures and certificate for the given paymentInformation.
   *
   * @param paymentInfo - The object to inspect.
   * @returns The inspection result.
   * @throws Error - If paymentInfo is missing expected fields.
   */
  public async inspect(
    paymentInfo: PaymentInformation,
  ): Promise<PaymentInformationInspectionResult> {
    const payString = paymentInfo.payId
    if (!payString) {
      throw new Error('payString property is empty')
    }
    const verifiedAddressesResults = paymentInfo.verifiedAddresses.map(
      async (address) => this.inspectVerifiedAddress(payString, address),
    )
    return Promise.all(verifiedAddressesResults).then((results) => {
      const isVerified = results.every((result) => result.isVerified)
      return {
        payString,
        isVerified,
        verifiedAddressesResults: results,
      }
    })
  }

  /**
   * Inspect signature on verified addresses.
   *
   * @param payString - The PayString this address belongs to.
   * @param verifiedAddress - The verified address to inspect.
   * @returns The inspection result.
   */
  private async inspectVerifiedAddress(
    payString: string,
    verifiedAddress: VerifiedAddress,
  ): Promise<VerifiedAddressInspectionResult> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- because JSON
    const address: UnsignedVerifiedAddress = JSON.parse(verifiedAddress.payload)
    const signaturesResults = this.buildSignatureResults(
      verifiedAddress,
      payString,
    )
    return Promise.all(signaturesResults).then(
      (results): VerifiedAddressInspectionResult => {
        const isVerified = results.every((result) => result.isSignatureValid)
        return {
          isVerified,
          address: address.payIdAddress,
          signaturesResults: results,
        }
      },
    )
  }

  /**
   * Builds signatures results for every signature in the verified address.
   *
   * @param verifiedAddress - The address to inspect.
   * @param payString - The PayString this address belongs to.
   * @returns List of promises with inspection results.
   */
  private buildSignatureResults(
    verifiedAddress: VerifiedAddress,
    payString: string,
  ): Array<Promise<SignatureInspectionResult>> {
    return verifiedAddress.signatures.map(async (recipient) => {
      const jwsWithSingleSignature = {
        payload: verifiedAddress.payload,
        signatures: [
          {
            signature: recipient.signature,
            protected: recipient.protected,
          },
        ],
      }
      return this.inspectSignature(payString, jwsWithSingleSignature, recipient)
    })
  }

  /**
   * Inspects the signature.
   *
   * @param payString - The payString this signature belongs to.
   * @param jws - The JWS that contains the recipient.
   * @param recipient - The recipient signature to inspect.
   * @returns The inspection result.
   */
  // eslint-disable-next-line class-methods-use-this -- previously referenced a class field. could be refactored.
  private async inspectSignature(
    payString: string,
    jws: VerifiedAddress,
    recipient: VerifiedAddressSignature,
  ): Promise<SignatureInspectionResult> {
    if (!recipient.protected) {
      return { isSignatureValid: false }
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- because JSON
    const headers: ProtectedHeaders = JSON.parse(
      Buffer.from(recipient.protected, 'base64').toString('utf-8'),
    )
    return verifySignedAddress(payString, jws).then((isSignatureValid) => {
      return { isSignatureValid, keyType: headers.name, jwk: headers.jwk }
    })
  }
}

interface PaymentInformationInspectionResult {
  payString: string
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
  readonly keyType?: string
  readonly jwk?: JWK
}
