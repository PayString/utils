import { JWK, JWKECKey, JWKOctKey, JWKOKPKey, JWKRSAKey } from 'jose'

import { SigningParams } from './verifiable-payid'

import ECKey = JWK.ECKey
import RSAKey = JWK.RSAKey
import OctKey = JWK.OctKey
import OKPKey = JWK.OKPKey

/**
 * Represents the properties needed to sign a PayID using a server key.
 */
export default class ServerKeySigningParams implements SigningParams {
  public readonly keyType = 'serverKey'
  public readonly key: ECKey | RSAKey | OctKey | OKPKey
  public readonly alg: string
  public readonly jwk: JWKRSAKey | JWKECKey | JWKOKPKey | JWKOctKey

  /**
   * Default constructor.
   *
   * @param key - The private key to sign with.
   * @param alg - The signing algorithm.
   * @param jwk - The public jwk to include in the jws.
   */
  public constructor(
    key: ECKey | RSAKey | OctKey | OKPKey,
    alg: string,
    jwk: JWKRSAKey | JWKECKey | JWKOKPKey | JWKOctKey,
  ) {
    this.key = key
    this.alg = alg
    this.jwk = jwk
  }
}
