import { JWK } from 'jose'

import { SigningParams } from './verifiable-paystring'

import ECKey = JWK.ECKey
import RSAKey = JWK.RSAKey
import OctKey = JWK.OctKey
import OKPKey = JWK.OKPKey

/**
 * Represents the properties needed to sign a PayString using an identity key.
 */
export default class IdentityKeySigningParams implements SigningParams {
  public readonly keyType = 'identityKey'
  public readonly key: ECKey | RSAKey | OctKey | OKPKey
  public readonly alg: string

  /**
   * Default constructor.
   *
   * @param key - The private key to sign with.
   * @param alg - The signing algorithm.
   */
  public constructor(key: ECKey | RSAKey | OctKey | OKPKey, alg: string) {
    this.key = key
    this.alg = alg
  }
}
