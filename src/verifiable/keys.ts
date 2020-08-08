import { promises } from 'fs'

import {
  BasicParameters,
  JWK,
  JWKECKey,
  JWKOctKey,
  JWKOKPKey,
  JWKRSAKey,
  JWS,
  KeyParameters,
} from 'jose'

import RSAKey = JWK.RSAKey
import ECKey = JWK.ECKey
import OKPKey = JWK.OKPKey
import OctKey = JWK.OctKey
import JWSRecipient = JWS.JWSRecipient

const CERT_HEADER = '-----BEGIN CERTIFICATE-----'
const CERT_TRAILER = '-----END CERTIFICATE-----'

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
  // in the case of a fullchain cert being used, the content will contain the end certificate followed by 1
  // or more intermediate CA certs. The end certificate (index 0) is the one to be manifested as the public key
  // in the JWS headers. The full chain of certificates will be included in the x5c section.
  const certs = splitCerts(content)
  const primary = JWK.asKey(certs[0]).toJWK(false)
  const x5c = getX5cChain(certs.map((part) => JWK.asKey(part).toJWK(false)))
  if (isX5C(primary)) {
    return { ...primary, x5c }
  }
  return primary
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
 * Split of full chain certificate (which contains multiple certificate blocks) into an array
 * of strings.
 *
 * @param text - Text content of the certificate chain.
 * @returns The list of certificates.
 */
export function splitCerts(text: string): string[] {
  let parts: string[] = []
  let startIndex = text.indexOf(CERT_HEADER)
  let endIndex = text.indexOf(CERT_TRAILER, startIndex)
  while (startIndex >= 0) {
    parts = parts.concat(
      text.substring(startIndex, endIndex + CERT_TRAILER.length),
    )
    startIndex = text.indexOf(CERT_HEADER, endIndex + 1)
    endIndex = text.indexOf(CERT_TRAILER, startIndex + 1)
  }
  return parts
}

/**
 * Extracts the x5c values from a JWK.
 *
 * @param keys - The JWK to process.
 * @returns Array of values from the x5c fields. Empty if it doesn't exist or is empty.
 */
function getX5cChain(
  keys: Array<JWKRSAKey | JWKECKey | JWKOKPKey | JWKOctKey>,
): string[] {
  return keys.flatMap((jwk) => {
    if (isX5C(jwk) && jwk.x5c) {
      return jwk.x5c
    }
    return []
  })
}

/**
 * Checks if the params contains is a KeyParameters with an x5c property.
 *
 * @param params - The value to be checked.
 * @returns True if x5c found.
 */
export function isX5C(params: BasicParameters): params is KeyParameters {
  return 'x5c' in params
}

export function toKey(
  jwk: JWKRSAKey | JWKECKey | JWKOctKey | JWKOKPKey,
): JWK.RSAKey | JWK.ECKey | JWK.OKPKey | JWK.OctKey {
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

export function getAlgorithm(
  jwk: JWKRSAKey | JWKECKey | JWKOctKey | JWKOKPKey,
): string {
  if (jwk.kty === 'EC') {
    return 'ES256K'
  }
  if (jwk.kty === 'oct') {
    return 'HS512'
  }
  if (jwk.kty === 'OKP') {
    return 'EdDSA'
  }
  return 'RS512'
}
