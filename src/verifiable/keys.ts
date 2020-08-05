import { promises } from 'fs'

import { BasicParameters, JWK, JWKECKey, JWKOctKey, JWKOKPKey, JWKRSAKey, JWS, KeyParameters } from 'jose'

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
  const primary = JWK.asKey(content).toJWK(false)
  const x5c = getX5cChain(
    splitCerts(content).map((part) => JWK.asKey(part).toJWK(false)),
  )
  if (isX5C(primary)) {
    return { ...primary, x5c }
  }
  return primary
}

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

function splitCerts(text: string): string[] {
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

export function isX5C(params: BasicParameters): params is KeyParameters {
  return 'x5c' in params
}
