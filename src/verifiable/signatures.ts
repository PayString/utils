import { JWS, JWK } from 'jose'

import IdentityKeySigningParams from './identity-key-signing-params'
import ServerKeySigningParams from './server-key-signing-params'
import { Address } from './verifiable-payid'

import GeneralJWS = JWS.GeneralJWS

/**
 * Creates a signed JWS.
 *
 * @param payId - The payID that owns this verified address.
 * @param address - The address to sign.
 * @param signingParams - The key/alg to use to generate the signature.
 * @returns A signed JWS.
 */
export function sign(
  payId: string,
  address: Address,
  signingParams: IdentityKeySigningParams | ServerKeySigningParams,
): GeneralJWS {
  if (signingParams instanceof ServerKeySigningParams) {
    return signWithServerKey(payId, address, signingParams)
  }
  return signWithIdentityKey(payId, address, signingParams)
}

/**
 * Creates a signed JWS.
 *
 * @param payId - The payID that owns this verified address.
 * @param address - The address to sign.
 * @param signingParams - The key/alg to use to generate the signature.
 * @returns A signed JWS.
 */
function signWithIdentityKey(
  payId: string,
  address: Address,
  signingParams: IdentityKeySigningParams,
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
 * @param signingParams - The key/alg to use to generate the signature.
 * @returns A signed JWS.
 */
export function signWithServerKey(
  payId: string,
  address: Address,
  signingParams: ServerKeySigningParams,
): GeneralJWS {
  const unsigned: UnsignedVerifiedAddress = {
    payId,
    payIdAddress: address,
  }

  const signer = new JWS.Sign(unsigned)

  const protectedHeaders = {
    name: 'serverKey',
    alg: signingParams.alg,
    typ: 'JOSE+JSON',
    b64: false,
    crit: ['b64'],
    jwk: signingParams.x5c,
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
  signingParams: Array<IdentityKeySigningParams | ServerKeySigningParams>,
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
 * @param expectedPayId - The expected payid.
 * @param verifiedAddress - JWS representing a verified address.
 * @returns Returns true if any signature is invalid, returns false. Otherwise true.
 */
export function verifySignedAddress(
  expectedPayId: string,
  verifiedAddress: GeneralJWS,
): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- because JSON
  const address: UnsignedVerifiedAddress = JSON.parse(verifiedAddress.payload)

  if (expectedPayId !== address.payId) {
    // payId does not match what was inside the signed payload
    return false
  }

  try {
    JWS.verify(verifiedAddress, JWK.EmbeddedJWK, {
      crit: ['b64'],
      complete: true,
    })
    return true
  } catch {
    return false
  }
  return false
}

interface UnsignedVerifiedAddress {
  readonly payId: string
  readonly payIdAddress: Address
}
