import fromKeyLike from 'jose/jwk/from_key_like'
import calculateThumbprint from 'jose/jwk/thumbprint'
import generateKeyPair from 'jose/util/generate_key_pair'
import { JWK } from 'jose/webcrypto/types'

import {
  ProtectedHeaders,
  VerifiedAddressSignature,
} from './verifiable-paystring'

const DEFAULT_ALGORITHM = 'ES256'
const DEFAULT_CURVE = 'P-256'

/**
 * Extracts the JWK property from the base64 json in the protected section of a JWK recipient.
 *
 * @param recipient - The recipient to process.
 * @returns The JWK if found, otherwise undefined.
 */
export function getJwkFromRecipient(
  recipient: VerifiedAddressSignature,
): JWK | undefined {
  if (recipient.protected) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- because JSON
    const headers: ProtectedHeaders = JSON.parse(
      Buffer.from(recipient.protected, 'base64').toString('utf-8'),
    )
    return headers.jwk
  }
  return undefined
}

/**
 * Gets the default algorithm for a given JWK*Key instance.
 *
 * @param jwk - The jwk.
 * @returns The default algorithm to use.
 */
export function getDefaultAlgorithm(jwk: JWK): string {
  if (jwk.kty === 'EC') {
    return DEFAULT_ALGORITHM
  }
  if (jwk.kty === 'oct') {
    return 'HS512'
  }
  if (jwk.kty === 'OKP') {
    return 'EdDSA'
  }
  return 'RS512'
}

/**
 * Generates an new JWK key that can be used for V.PayID.
 *
 * @returns A JWK key.
 */
export async function generateNewKey(): Promise<JWK> {
  const { privateKey } = await generateKeyPair(DEFAULT_ALGORITHM, {
    crv: DEFAULT_CURVE,
  })
  return fromKeyLike(privateKey).then(async (key: JWK) => {
    return calculateThumbprint(key).then((thumbprint: string) => {
      return {
        kid: thumbprint,
        alg: getDefaultAlgorithm(key),
        use: 'sig',
        ...key,
      }
    })
  })
}

/**
 * Convert a JWK with a private key, to a JWK without a private key.
 *
 * @param jwk - The jwk.
 * @returns A JWK key.
 */
export function toPublicJWK(jwk: JWK): JWK {
  // eslint-disable-next-line id-length --- 'd' is an actual property of a JWK
  const { d, ...rest } = jwk
  return { ...rest }
}
