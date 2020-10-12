import { promises } from 'fs'

import { JWK, JWKECKey, JWKOctKey, JWKOKPKey, JWKRSAKey, JWS } from 'jose'

import RSAKey = JWK.RSAKey
import ECKey = JWK.ECKey
import OKPKey = JWK.OKPKey
import OctKey = JWK.OctKey
import JWSRecipient = JWS.JWSRecipient

const DEFAULT_CURVE = 'P-256'

/**
 * Reads JWK key from a file.
 *
 * @param path - The full file path of the key file.
 * @returns A JWK key.
 */
export async function getSigningKeyFromFile(
  path: string,
): Promise<RSAKey | ECKey | OKPKey | OctKey> {
  const pem = await promises.readFile(path, 'ascii')
  return JWK.asKey(pem)
}

/**
 * Reads JWK from a file. If file contains a chain of certificates, JWK is generated from the first
 * certificate and the rest of the certificates in file are added to the x5c section of the JWK.
 *
 * @param path - The full file path of the key file.
 * @returns A JWK key.
 */
export async function getJwkFromFile(
  path: string,
): Promise<JWKRSAKey | JWKECKey | JWKOKPKey | JWKOctKey> {
  const content = await promises.readFile(path, 'ascii')
  return JWK.asKey(content).toJWK(false)
}

/**
 * Extracts the JWK property from the base64 json in the protected section of a JWK recipient.
 *
 * @param recipient - The recipient to process.
 * @returns The JWK if found, otherwise undefined.
 */
export function getJwkFromRecipient(
  recipient: JWSRecipient,
): JWKRSAKey | JWKECKey | JWKOKPKey | JWKOctKey | undefined {
  if (recipient.protected) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- because JSON
    const headers = JSON.parse(
      Buffer.from(recipient.protected, 'base64').toString('utf-8'),
    )
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- because JSON
    if (headers.jwk) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- because JSON
      return JWK.asKey(headers.jwk).toJWK(false)
    }
  }
  return undefined
}

/**
 * The jose library has 2 types of instances: JWK<Type>Key and JWK.<TypeKey>. The former is just data interface with no
 * methods where as the latter is a richer type. This method converts from the data interface to the richer type.
 *
 * @param jwk - The instance to convert.
 * @returns The converted result.
 */
export function toKey(
  jwk: JWKRSAKey | JWKECKey | JWKOctKey | JWKOKPKey,
): JWK.RSAKey | JWK.ECKey | JWK.OKPKey | JWK.OctKey {
  // JWKRSAKey, JWKECKey, etc use typescript conditional typing so
  // these if conditions are needed to target the correct method overload.
  if (jwk.kty === 'EC') {
    return JWK.asKey(jwk)
  }
  if (jwk.kty === 'oct') {
    return JWK.asKey(jwk)
  }
  if (jwk.kty === 'OKP') {
    return JWK.asKey(jwk)
  }
  return JWK.asKey(jwk)
}

/**
 * Gets the default algorithm for a given JWK*Key instance.
 *
 * @param jwk - The jwk.
 * @returns The default algorithm to use.
 */
export function getDefaultAlgorithm(
  jwk: JWKRSAKey | JWKECKey | JWKOctKey | JWKOKPKey,
): string {
  if (jwk.kty === 'EC') {
    return 'ES256'
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
export async function generateNewKey(): Promise<ECKey> {
  return JWK.generate('EC', DEFAULT_CURVE)
}
