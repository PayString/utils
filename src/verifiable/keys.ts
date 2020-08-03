import { promises } from 'fs'

import { JWK } from 'jose'

import RSAKey = JWK.RSAKey
import ECKey = JWK.ECKey
import OKPKey = JWK.OKPKey
import OctKey = JWK.OctKey

/**
 * Reads JWK key from a file.
 *
 * @param path - The full file path of the key file.
 * @returns A JWK key.
 */
export default async function getKeyFromFile(
  path: string,
): Promise<RSAKey | ECKey | OKPKey | OctKey> {
  const pem = await promises.readFile(path, 'ascii')
  return JWK.asKey(pem)
}
