import { JWS, JWK } from 'jose'

import { Address } from './payid'

import GeneralJWS = JWS.GeneralJWS
import ECKey = JWK.ECKey
import RSAKey = JWK.RSAKey
import JWSRecipient = JWS.JWSRecipient

/**
 * Creates a signed JWS.
 *
 * @param payId - The payID that owns this verified address.
 * @param address - The address to sign.
 * @param signingParams - The key/alg to use to generate the signature.
 * @returns A signed JWS.
 */
export default function sign(
  payId: string,
  address: Address,
  signingParams: SigningParams,
): GeneralJWS {
  const unsigned: UnsignedVerifiedAddress = {
    payId,
    payIdAddress: address,
  }

  const signer = new JWS.Sign(unsigned)
  const publicKey = signingParams.key.toJWK(false)

  const protectedHeaders = {
    name: 'identityKey',
    alg: signingParams.alg,
    typ: 'JOSE+JSON',
    b64: false,
    crit: ['b64'],
    jwk: publicKey,
  }

  signer.recipient(signingParams.key, protectedHeaders)
  return signer.sign('general')
}

/**
 * Creates a signed JWS.
 *
 * @param payId - The payID that owns this verified address.
 * @param address - The address to sign.
 * @param signingParams - The list of key/alg to use to generate the signature.
 * @returns A signed JWS.
 */
export function signWithKeys(
  payId: string,
  address: Address,
  signingParams: SigningParams[],
): GeneralJWS {
  // There seems to be a bug with the JOSE library when dealing with multiple signatures + unencoded payloads.
  // It should be possible to pass multiple keys during signing, but the payload gets garbled due to a bug in jose.
  // The workaround here is to sign the payload once per key, and then collect all the signatures into one response.
  return signingParams
    .map((param) => sign(payId, address, param))
    .reduce(function mergeJWS(current, next): GeneralJWS {
      return {
        payload: current.payload,
        signatures: current.signatures.concat(next.signatures),
      }
    })
}

/**
 * Verify an address is properly signed.
 *
 * @param payId - The expected payid.
 * @param verifiedAddress - JWS representing a verified address.
 * @returns Returns true if any signature is invalid, returns false. Otherwise true.
 */
export function verifySignedAddress(
  payId: string,
  verifiedAddress: GeneralJWS,
): boolean {
  const address = JSON.parse(verifiedAddress.payload) as UnsignedVerifiedAddress

  if (payId !== address.payId) {
    // payId does not match what was inside the signed payload
    return false
  }

  return verifiedAddress.signatures
    .map((recipient) => verifySignature(verifiedAddress, recipient))
    .every((value) => value)
}

function verifySignature(jws: GeneralJWS, recipient: JWSRecipient): boolean {
  if (recipient.protected) {
    const headers = JSON.parse(
      Buffer.from(recipient.protected, 'base64').toString('ascii'),
    ) as JwsHeaders
    return verifySignatureViaHeaders(jws, headers)
  }
  return false
}

function verifySignatureViaHeaders(
  jws: GeneralJWS,
  headers: JwsHeaders,
): boolean {
  try {
    if (JWS.verify(jws, headers.jwk, { crit: ['b64'] })) {
      return true
    }
  } catch {
    // console.info(`signature verification failed`, error)
    return false
  }
  return false
}

interface UnsignedVerifiedAddress {
  readonly payId: string
  readonly payIdAddress: Address
}

interface JwsHeaders {
  typ: string
  b64: boolean
  crit: string[]
  jwk: JWK.Key
}

interface SigningParams {
  key: RSAKey | ECKey
  alg: string
  keyType: string
}

export interface IdentityKeySigningParams extends SigningParams {
  keyType: 'identityKey'
}
// export interface ServerKeySigningParams extends SigningParams {
//   keyType: 'serverKey'
// }
