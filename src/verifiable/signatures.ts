import { JWS, JWK } from 'jose'

import IdentityKeySigningParams from './identity-key-signing-params'
import {
  Address,
  PaymentInformation,
  UnsignedVerifiedAddress,
} from './verifiable-paystring'

import GeneralJWS = JWS.GeneralJWS

/**
 * Creates a signed JWS.
 *
 * @param payString - The payString that owns this verified address.
 * @param address - The address to sign.
 * @param signingParams - The key/alg to use to generate the signature.
 * @returns A signed JWS.
 */
export function sign(
  payString: string,
  address: Address,
  signingParams: IdentityKeySigningParams,
): GeneralJWS {
  const unsigned: UnsignedVerifiedAddress = {
    payId: payString,
    payIdAddress: address,
  }

  const signer = new JWS.Sign(unsigned)
  const jwk = signingParams.key.toJWK(false)

  const protectedHeaders = {
    name: 'identityKey',
    alg: signingParams.alg,
    typ: 'JOSE+JSON',
    b64: false,
    crit: ['b64', 'name'],
    jwk,
  }

  signer.recipient(signingParams.key, protectedHeaders)
  return signer.sign('general')
}

/**
 * Creates a signed JWS.
 *
 * @param payString - The payString that owns this verified address.
 * @param address - The address to sign.
 * @param signingParams - The list of key/alg to use to generate the signature.
 * @returns A signed JWS.
 */
export function signWithKeys(
  payString: string,
  address: Address,
  signingParams: IdentityKeySigningParams[],
): GeneralJWS {
  // There seems to be a bug with the JOSE library when dealing with multiple signatures + unencoded payloads.
  // It should be possible to pass multiple keys during signing, but the payload gets garbled due to a bug in jose.
  // The workaround here is to sign the payload once per key, and then collect all the signatures into one response.
  return signingParams
    .map((param) => sign(payString, address, param))
    .reduce(function mergeJWS(current, next): GeneralJWS {
      return {
        payload: current.payload,
        signatures: current.signatures.concat(next.signatures),
      }
    })
}

/**
 * Verifies a PayString using the verified addresses within the PayString.
 *
 * @param toVerify - The PayString (as a json or as a parsed PaymentInformation).
 *
 * @returns True if verified.
 */
export function verifyPayString(
  toVerify: string | PaymentInformation,
): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- because JSON
  const paymentInformation: PaymentInformation =
    typeof toVerify === 'string' ? JSON.parse(toVerify) : toVerify

  const payString = paymentInformation.payId
  if (payString) {
    return paymentInformation.verifiedAddresses
      .map((address) =>
        verifySignedAddress(payString, {
          payload: address.payload,
          signatures: address.signatures.slice(),
        }),
      )
      .every((value) => value)
  }
  return false
}

/**
 * Verify an address is properly signed.
 *
 * @param expectedPayString - The expected payString.
 * @param verifiedAddress - JWS representing a verified address.
 * @returns Returns true if any signature is invalid, returns false. Otherwise true.
 */
export function verifySignedAddress(
  expectedPayString: string,
  verifiedAddress: GeneralJWS | string,
): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- because JSON
  const jws: GeneralJWS =
    typeof verifiedAddress === 'string'
      ? JSON.parse(verifiedAddress)
      : verifiedAddress
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- because JSON
  const address: UnsignedVerifiedAddress = JSON.parse(jws.payload)
  if (expectedPayString !== address.payId) {
    // payString does not match what was inside the signed payload
    return false
  }
  try {
    JWS.verify(jws, JWK.EmbeddedJWK, {
      crit: ['b64', 'name'],
      complete: true,
    })
    return true
  } catch {
    return false
  }
}
