import EmbeddedJWK from 'jose/jwk/embedded'
import parseJWK from 'jose/jwk/parse'
import GeneralSign from 'jose/jws/general/sign'
import generalVerify from 'jose/jws/general/verify'

import {
  convertGeneralJwsToVerifiedAddress,
  convertToGeneralJWSInput,
  convertToVerifiedAddress,
} from './converters'
import IdentityKeySigningParams from './identity-key-signing-params'
import { toPublicJWK } from './keys'
import {
  Address,
  PaymentInformation,
  UnsignedVerifiedAddress,
  VerifiedAddress,
  // eslint-disable-next-line import/max-dependencies -- TODO fix by breaking verification out into a separate file
} from './verifiable-paystring'

// Properties that are included in the 'crit' section of the JWS protected header
const CRIT_OPTIONS = {
  b64: true,
  name: false,
}

const STATIC_PROTECTED_HEADERS = {
  name: 'identityKey',
  typ: 'JOSE+JSON',
  b64: false,
  crit: ['b64', 'name'],
}

const ENCODER = new TextEncoder()

/**
 * Creates a signed JWS.
 *
 * @param payString - The payString that owns this verified address.
 * @param address - The address to sign.
 * @param signingParams - The key/alg to use to generate the signature.
 * @returns A signed JWS.
 */
export async function sign(
  payString: string,
  address: Address,
  signingParams: IdentityKeySigningParams,
): Promise<VerifiedAddress> {
  return signWithKeys(payString, address, [signingParams])
}

/**
 * Creates a signed JWS.
 *
 * @param payString - The payString that owns this verified address.
 * @param address - The address to sign.
 * @param signingParamsArray - The list of key/alg to use to generate the signature.
 * @returns A signed JWS.
 */
export async function signWithKeys(
  payString: string,
  address: Address,
  signingParamsArray: IdentityKeySigningParams[],
): Promise<VerifiedAddress> {
  const unsigned: UnsignedVerifiedAddress = {
    payId: payString,
    payIdAddress: address,
  }
  const payload = JSON.stringify(unsigned)
  const signer = new GeneralSign(ENCODER.encode(payload))
  const signers = signingParamsArray.map(async (signingParams) => {
    const protectedHeaders = {
      ...STATIC_PROTECTED_HEADERS,
      alg: signingParams.alg,
      jwk: toPublicJWK(signingParams.key),
    }
    return parseJWK(signingParams.key).then((keyLike) => {
      signer
        .addSignature(keyLike, { crit: CRIT_OPTIONS })
        .setProtectedHeader(protectedHeaders)
    })
  })
  return Promise.all(signers).then(async () =>
    signer.sign().then((jws) => {
      return convertGeneralJwsToVerifiedAddress(payload, jws)
    }),
  )
}

/**
 * Verifies a PayString using the verified addresses within the PayString.
 *
 * @param toVerify - The PayString (as a json or as a parsed PaymentInformation).
 *
 * @returns True if verified.
 */
export async function verifyPayString(
  toVerify: string | PaymentInformation,
): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- because JSON
  const paymentInformation: PaymentInformation =
    typeof toVerify === 'string' ? JSON.parse(toVerify) : toVerify

  const payString = paymentInformation.payId
  if (payString) {
    const verifications = paymentInformation.verifiedAddresses.map(
      async (address) =>
        verifySignedAddress(payString, {
          payload: address.payload,
          signatures: address.signatures.slice(),
        }),
    )
    return Promise.all(verifications).then((values) =>
      values.every((value) => value),
    )
  }
  return false
}

/**
 * Verify an address is properly signed.
 *
 * @param expectedPayString - The expected payString.
 * @param verifiedAddressOrJson - JWS representing a verified address.
 * @returns Returns true if any signature is invalid, returns false. Otherwise true.
 */
export async function verifySignedAddress(
  expectedPayString: string,
  verifiedAddressOrJson: VerifiedAddress | string,
): Promise<boolean> {
  const verifiedAddress: VerifiedAddress =
    typeof verifiedAddressOrJson === 'string'
      ? convertToVerifiedAddress(verifiedAddressOrJson)
      : verifiedAddressOrJson
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- because JSON
  const address: UnsignedVerifiedAddress = JSON.parse(verifiedAddress.payload)
  if (expectedPayString !== address.payId) {
    // payString does not match what was inside the signed payload
    return false
  }
  try {
    const converted = {
      ...(await convertToGeneralJWSInput(verifiedAddress)),
      payload: verifiedAddress.payload,
    }
    await generalVerify(converted, EmbeddedJWK, { crit: CRIT_OPTIONS })
    return true
  } catch {
    return false
  }
}
